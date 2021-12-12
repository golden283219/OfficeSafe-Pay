const {spawn} = require('child_process');
const ipc = require('electron').ipcMain

class winautomateConnector {

	path = null;
	gateway = null;
	isGatewayInitialized = false;
	webWindow = null;

	getGateway() {
		if (this.gateway == null) {
			this.setupGateway();
		}
		if (this.gateway == null) {
			throw `Unable to spin up gateway: is file exists at ${this.path}?`;
		}
		return this.gateway;
	}

	setupGateway() {
		if (process.platform === 'darwin') {
			// run on macOS
			this.gateway = spawn('mono', [this.path], {
				stdio: 'pipe'
			});
		} else {
			// launch on windows
			this.gateway = spawn(this.path, [], {
				stdio: 'pipe'
			});
		}

		// handle messages from gateway
		this.gateway.stdout.on('data', (data) => {
			if (process.OSP_ALLOW_DEBUG) {
				console.log(`winautomate: stdout: ${data}`);
			}

			if (this.isGatewayInitialized && false === this.webWindow.isDestroyed()) {
				// proxy to frontend
				this.webWindow.webContents.send('winautomate-reply', data.toString());
			} else {
				// on first message - send gateway config
				if (data.indexOf('[started]') > -1) {
					this.isGatewayInitialized = true;
				}
			}
		});

		// gateway error stream
		this.gateway.stderr.on('data', (data) => {
			console.error(`winautomate: stderr: ${data}`);
		});

		// on gateway close
		this.gateway.on('close', (code) => {
			console.log(`winautomate: child process exited with code ${code}`);
			this.gateway = null;
		});
	}

	sendAction(command) {
		if (process.OSP_ALLOW_DEBUG) {
			console.log(`winautomate: sending to gateway\t"${command}"`);
		}
		this.gateway.stdin.write(command + "\r\n");
	}

	setupIpc() {
		let self = this;

		this.getGateway();

		ipc.on('winautomate-action', (e, command) => {
			self.sendAction(command);
		});
	}

	init(webWindow, path) {
		this.webWindow = webWindow
		this.path = path
		this.setupIpc()
	}

	close() {
		if (this.gateway) {
			this.sendAction('exit');
		}
	}
}

module.exports = new winautomateConnector();
