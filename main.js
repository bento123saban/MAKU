
import indexedDB from "./js/indexedDB"
window.DB = new indexedDB("MAKU", 1, {
    items : {
        keyPath : "code",
        indexes : ["code", "name", "note", "type"]
    },
    device  : {
        keyPath : "email",
        indexes : ["email", "version"]
    }
})

import request from "./js/request"
window.REQUEST = new request()

import { UI_Loader, UI_Login, isReallyOnline } from "./js/UI"
window.isReallyOnline = isReallyOnline

UI_Loader("Starting")
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(async () => {
		UI_Login()
	}, 2500)
})

// https://gemini.google.com/share/ac68c54323e9
