// Preload: place to link Electron Node.js backend with Electron JS renderer
// Message bridge idea based on https://stackoverflow.com/a/59888788
const {contextBridge, ipcRenderer, remote} = require("electron");

// Simple eventbus
const eventBus = (() => {
	const subscriptions = {}
	const getNextUniqueId = getIdGenerator()

	function subscribe(eventType, callback) {
		const id = getNextUniqueId()

		if (!subscriptions[eventType])
			subscriptions[eventType] = {}

		subscriptions[eventType][id] = callback

		return {
			unsubscribe: () => {
				delete subscriptions[eventType][id]
				if (Object.keys(subscriptions[eventType]).length === 0) delete subscriptions[eventType]
			}
		}
	}

	function publish(eventType, arg) {
		if (!subscriptions[eventType])
			return

		Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg))
	}

	function getIdGenerator() {
		let lastId = 0

		return function getNextUniqueId() {
			lastId += 1
			return lastId
		}
	}

	return {publish, subscribe}
})();

const activeChannels = [];

function watchChannel(channel) {
	if (activeChannels.includes(channel) === false) {
		ipcRenderer.on(channel, (e, payload) => {
			eventBus.publish(channel, payload)
		});
	}
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
	"nodeapi", {
		send: (channel, data) => {
			ipcRenderer.send(channel, data);
		},

		subscribe: (channel, func) => {
			watchChannel(channel);
			return eventBus.subscribe(channel, func);
		},

		getAppMeta: () => {
			return {
				appVersion: remote.app.getVersion(),
				path: remote.app.getAppPath(),
				metrics: remote.app.getAppMetrics(),
			}
		}
	}
);
