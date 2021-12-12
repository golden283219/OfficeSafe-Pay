import ServerApi from "./ServerApi";

class Processor {
  constructor() {
    this.logCallback = null;
    this.messageCallback = null;
  }

  logger(callback) {
    this.logCallback = callback;
    return this;
  }

  log(message) {
    if (typeof this.logCallback === "function") {
      this.logCallback(message);
    }
  }

  init() {
    // noop
  }

  makeTransaction(payload) {
    console.log(payload);
    return new Promise((transactionDone, transactionFail) => {
      let paymentInvoke = {
        path: "processPayment",
        method: "POST",
        payload: {},
      };
      switch (payload.action) {
        case "simpleTransaction":
          // sale (todo: capture)
          paymentInvoke.payload = {
            type: payload.type,
            amount: payload.amount,
            onTerminal: payload.manualInput !== "true",
            customerInfo: payload.customerInfo || null,
          };
          break;
        case "linkedTransaction":
          // refund/void
          paymentInvoke.payload = {
            type: payload.type,
            amount: payload.amount,
            originalTx: payload.linkedTransaction,
          };
          break;
        case "auth":
          // auth
          paymentInvoke.payload = {
            type: "auth",
            amount: payload.amount,
            onTerminal: payload.manualInput !== "true",
          };
          break;
        default:
          transactionFail({ message: "Unknown transaction type." });
          return;
      }
      // just execute
      ServerApi.request(paymentInvoke)
        .then(transactionDone)
        .catch(transactionFail);
    });
  }

  prepareAmount(amount, type = null) {
    amount =
      typeof amount === "number"
        ? amount
        : parseFloat(amount.trim().replaceAll(",", "."));
    amount = Math.ceil(amount * 100);
    if (!amount) amount = 0;
    if (amount < 0) {
      // convert negative amount to refund if type not specified
      type = type === null ? "refund" : type;
      amount = Math.abs(amount);
    } else {
      // fallback to sale type
      type = type === null ? "sale" : type;
    }

    return [amount, type];
  }
}

export default new Processor();
