import { useState, useEffect } from "react";
import store from "./store";
import { actions as globalActions } from "./store/global";
import { actions as userActions } from "./store/user";
import ServerApi from "./ServerApi";
import WinAutomate from "./WinAutomate";
import Moment from "moment";

const { wentBack, stateChanged } = globalActions;

const goBack = (result = null) => {
  // safe guard from nativeEvents like click
  const payload =
    result && typeof result.nativeEvent !== "undefined" ? null : result;
  store.dispatch(wentBack(payload));
};

const goToScreen = (num, payload = {}, preserve = null) => {
  store.dispatch(stateChanged({ state: num, payload, preserve }));
};

const goBackAgain = (num, payload = {}, preserve = null) => {
  store.dispatch(
    stateChanged({ state: 3, payload: { resetHistory: true }, preserve: null })
  );
  store.dispatch(stateChanged({ state: num, payload, preserve }));
};

const goToHome = () => {
  store.dispatch(
    stateChanged({ state: 3, payload: { resetHistory: true }, preserve: null })
  );
};

const setUser = (user) => {
  store.dispatch(userActions.setUser(user));
  WinAutomate.onLogin(user);
};

const currentCustomerId = () => {
  return store.getState().user.customer_id;
};

const sequence = (prefix) => {
  return prefix + "-" + Date.now().toString();
};

export function usePreservableState(key, defaults) {
  const initial = Object.assign(
    defaults,
    store.getState().global.statePayload[key] || {}
  );
  return useState(initial);
}

export function getNavResult() {
  return store.getState().global.statePayload.result || null;
}

export function followNavResult(handler) {
  useEffect(() => {
    const navResult = getNavResult();
    if (navResult) {
      if (navResult.navBack) {
        goBack(navResult.navBack);
      } else if (navResult.navHome) {
        goToScreen(3, { resetHistory: true });
      } else {
        if (handler) {
          handler(navResult);
        }
      }
    }
  }, []);
}

/**
 * Format pan mask
 * Optionally add expiration digits
 *
 * @param cardToken
 * @param cardExp
 * @returns {string}
 */
export function panMask(cardToken, cardExp) {
  let string = "";
  if (cardToken < 16) {
    string = "xxxx-".repeat(4).slice(0, -1);
  } else {
    string =
      cardToken.slice(0, 2) + "xx-xx".repeat(2) + "xx-" + cardToken.slice(-4);
  }

  if (cardExp && cardExp.length > 2) {
    string += ", till " + cardExp.slice(0, 2) + "/" + cardExp.slice(2);
  }

  return string;
}

/**
 * Format amount in minor units for viewing
 *
 * @param minorUnits
 * @param format
 * @returns {string}
 */
export function formatAmount(minorUnits, format) {
  const value = minorUnits.toFixed(2);

  if (!format || format === "view") {
    return "$ " + value;
  }
  return value;
}

export function parsePartialJson(string) {
  let json = null;
  try {
    // try parse as json
    json = JSON.parse(string);
  } catch {
    // try to extract {...}
    const start = string.indexOf("{");
    const end = string.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const partial = string.substring(start, end + 1);
      try {
        json = JSON.parse(partial);
      } catch {
        // no luck - fallback
        json = null;
      }
    } else {
      // no valid json object marks
      json = null;
    }
  }
  return json;
}

let delayedTransaction = null;

export function delayTransaction(options) {
  delayedTransaction = options;
}

export function getDelayedTransaction() {
  return delayedTransaction;
}

export function commitTransaction(options) {
  ServerApi.request({
    path: "tx",
    method: "POST",
    payload: {
      timestamp: Date.now(),
      user_id: currentCustomerId(),
      patient_id: options.patient_id,
      tx_id: options.tx_id,
      tx_linked: options.tx_linked,
      type: options.type,
      amount: options.amount,
      approved:
        options.meta.approved ?? options.meta.approved === "yes" ? 1 : 0,
      meta: JSON.stringify(options.meta),
    },
  }).then(
    () => {},
    (e) => {
      console.warn("Transaction save failed", e);
    }
  );

  // send to dx
  if (
    options.type === "sale" &&
    options.meta.approved &&
    options.meta.approved === "yes"
  ) {
    const amount = (options.amount / 100).toFixed(2);
    WinAutomate.send(
      "payment;" +
        amount +
        ";osp-" +
        options.type +
        "-" +
        Moment().format("MMDD-HHmm") +
        ";OfficeSafe-Pay, tx ref " +
        options.tx_id +
        ";visa"
    );
  }
}

export {
  goBack,
  goToScreen,
  goToHome,
  setUser,
  currentCustomerId,
  sequence,
  goBackAgain,
};

export const showMessageBoxEvent = "showMessageBox";

export function showMessageBox(options) {
  const e = new CustomEvent(showMessageBoxEvent, {
    detail: Object.assign(
      {},
      {
        type: "confirm",
        text: "Please confirm",
        positive: "OK",
        negative: "Cancel",
        onPositive: () => {},
        onNegative: () => {},
      },
      options
    ),
  });

  window.dispatchEvent(e);
}
