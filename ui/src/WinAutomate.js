import { goToScreen, showMessageBox } from "./utils";

const appWindowTitleMark = '[osp]';

class WinAutomate {

  constructor() {
    this.messageCallback = null
  }

  init() {
    if (!window.nodeapi) {
      return;
    }
    window.nodeapi.subscribe('winautomate-reply', (e) => {
      if (this.messageCallback) {
        this.messageCallback(e)
      }
    })
    // event bypass between float widget & app screens
    window.nodeapi.subscribe('widget-action', (payload) => {
      this.onWidgetAction(payload)
    })
  }

  send(command) {
    return new Promise((done, fail) => {
      if (!window.nodeapi) {
        setTimeout(() => {
          fail("Unable to communicate with Dentrix Automation");
        }, 500);
        return;
      }

      window.nodeapi.send('winautomate-action', command)

      this.messageCallback = function (message) {
        if (message.indexOf("[error]") === 0) {
          fail(message);
        }

        if (message.indexOf("[data]") === 0) {
          message = message.substring(message.indexOf('>') + 1, message.lastIndexOf('<'))
        }
        done(message);
      }
    })
  }

  focusApp() {
    this.send(`focus;${appWindowTitleMark}`);
  }

  failure(e) {
    alert("Dentrix Automation failed\n" + e);
  }

  searchPatient(last_name, first_name) {
    return new Promise((done, fail) => {
      let messageBox = {
        type: "confirm",
        text: "",
        positive: "Input payment",
        negative: "Full stop",
        onPositive: () => {
          done();
        },
        onNegative: () => {
          fail();
        }
      }

      const command = 'search;' + last_name.trim() + ', ' + first_name.trim();
      this.send(command).then((x) => {
        const i = parseInt(x);
        if (i === 1) {
          // follow next
          messageBox.text = "Patient found. " +
            "Please click OK and press `Input payment` to fill the payment form.";
        } else {
          if (i === 0) {
            messageBox.text = "Automation stopped because patient wasn't found. " +
              "Please, choose the patient, click OK and press `Input payment` to fill the payment form.";
          } else {
            messageBox.text = "Automation stopped because there are more than one match." +
              "Please, choose the patient, click OK and press `Input payment` to fill the payment form.";
          }
        }
        this.focusApp()
        showMessageBox(messageBox)
      }, (e) => {
        messageBox.text = e;
        this.focusApp()
        showMessageBox(messageBox);
      })
    })
  }

  confirmCurrentPatient() {
    return new Promise((done, fail) => {
      let messageBox = {
        type: "confirm",
        text: "",
        positive: "Input payment",
        negative: "Full stop",
        onPositive: () => {
          done();
        },
        onNegative: () => {
          fail();
        }
      }

      const command = 'current';
      this.send(command).then((x) => {
        if (x.length) {
          messageBox.text = "Starting transaction for client: " + x;
        } else {
          messageBox.text = "Please select client in Dentrix Ledger";
        }
        this.focusApp()
        showMessageBox(messageBox);
      }, (e) => {
        messageBox.text = e;
        this.focusApp()
        showMessageBox(messageBox);
      })
    });
  }

  onLogin(user) {
    if (user && window.nodeapi) {
      // display floating button
      window.nodeapi.send('widget-display')
    }
  }

  onWidgetAction(payload) {
    if (!payload) {
      return
    }
    if (payload.action === 'show-terminal-payment') {
      // navigate to terminal payment
      goToScreen(9);
    }
  }
}

export default new WinAutomate()
