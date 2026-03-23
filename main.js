import DB from "./js/indexedDB"
import DEVICE from "./js/device"
import { UI_Loader } from "./js/UI"
UI_Loader("Starting")
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(async () => {
		DB
		DEVICE.init()
		console.log("APP Init")
	}, 1500)
})


// https://gemini.google.com/share/ac68c54323e9