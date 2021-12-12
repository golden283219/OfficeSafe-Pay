const ipc = require('electron').ipcMain

class widgetConnector {

  webWindow = null

  init(webWindow, ctorFunction) {
    const self = this
    // keep reference to main window
    this.webWindow = webWindow

    ipc.on('widget-display', function () {
      if (typeof ctorFunction === 'function')
        // invoke constructor
        ctorFunction()
    })

    ipc.on('widget-action', function (e, payload) {
      if (!self.webWindow) {
        // window is closed - currently not handling this case
        return
      }
      // check extras
      if (payload && payload.focus) {
        if (self.webWindow.isMinimized()) {
          self.webWindow.restore()
        }
        self.webWindow.focus()
      }
      // pass to main window
      self.webWindow.webContents.send('widget-action', payload);
    })
  }

}

module.exports = new widgetConnector()
