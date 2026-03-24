import DB from "./js/indexedDB"
import DEVICE from "./js/device"
import { UI_Loader, UI_Login, UI_Main} from "./js/UI"
UI_Loader("Starting")
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(async () => {
		DB
		// UI_Login()
		console.log("APP Init")
	}, 2500)
})
UI_Main()


// https://gemini.google.com/share/ac68c54323e9