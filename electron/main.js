// Electron node environment
// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, screen, nativeImage} = require("electron");
const path = require("path");
const winautomate = require("./winautomate")
const widget = require("./widget")

// Keep link globally to prevent GC
let mainWindow;

// Floating window
let floatWidget;
const floatWidgetPosition = {
	height: 70,
	width: 260,
	bottom: 50,
	right: 10,
}

// debugger flag
process.OSP_ALLOW_DEBUG = true;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 680,
		minWidth: 800,
		minHeight: 600,
		autoHideMenuBar: true,
		//title: "OfficeSafe Pay", // title set from ui's html title tag
		webPreferences: {
			devTools: process.OSP_ALLOW_DEBUG,
			spellcheck: false,
			textAreasAreResizable: false,
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: true, // enable remote to pass app metadata
			preload: path.join(__dirname, "preload.js") // setup main-renderer bindings
		}
	});

	mainWindow.setMenu(null);
	Menu.setApplicationMenu(null);

	// SPA app
	mainWindow.loadFile(path.join(__dirname, '/ui/index.html'));

	if (process.OSP_ALLOW_DEBUG) {
		// devTools for debug mode
		const devtools = new BrowserWindow();
		mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
		mainWindow.webContents.openDevTools({mode: 'detach'});
	}

	// Init interprocess communicators
	winautomate.init(mainWindow, path.join(__dirname, '/binary/dxauto.exe'));
	widget.init(mainWindow, createFloatWidget)

	// Quit the app when main window was closed
	// If that logic is not desired then we should
	// to reinit winautomate with new browser window handlers
	mainWindow.on('closed', quitApp);
};

// creating shortcut topmost window
const createFloatWidget = () => {

	if (floatWidget && floatWidget.isVisible()){
		// do not create a copy
		return
	}

	// calculate position
	const display = screen.getPrimaryDisplay()
	const x = display.bounds.width - floatWidgetPosition.width - floatWidgetPosition.right
	const y = display.bounds.height - floatWidgetPosition.height - floatWidgetPosition.bottom

	floatWidget = new BrowserWindow({
		width: floatWidgetPosition.width,
		height: floatWidgetPosition.height,
		x: x,
		y: y,
		frame: false,
		resizable: false,
		titleBarStyle: "hidden",
		alwaysOnTop: true,
		icon: nativeImage.createEmpty(),
		webPreferences: {
			devTools: process.OSP_ALLOW_DEBUG,
			preload: path.join(__dirname, "preload.js"),
		}
	})

	floatWidget.loadFile(path.join(__dirname, '/widget.html'))
	floatWidget.setSkipTaskbar(true)

	if (process.OSP_ALLOW_DEBUG) {
		const devtools = new BrowserWindow();
		floatWidget.webContents.setDevToolsWebContents(devtools.webContents);
		floatWidget.webContents.openDevTools({mode: 'detach'});
	}
}

// Create UI on app start
app.whenReady().then(() => {
	createWindow();
});

const quitApp = () => {
	// close child processes
	winautomate.close();

	// wait a little and quit
	setTimeout(() => {
		app.quit();
	}, 700);
}

// Quit when all windows closed, including on macOS
app.on("window-all-closed", quitApp);
