
import indexedDB from "./js/indexedDB"
window.DB = new indexedDB("MAKU", 1, {
    items : {
        keyPath : "code",
        indexes : ["code", "name", "note", "type"]
    },
    device  : {
        keyPath : "email",
        indexes : ["email", "version"]
    },
    trxHeader : {
        keyPath : "code",
        indexes : ["user", "createTime", "type", "staff", "date", "itemsCount", "stocksCount"]
    },
    trxItems : {
        keyPath : "code",
        indexes : ["code", "itemsID"]
    },
    stock : {
        keyPath : "code",
        indexes : ["in", "out", "stock"]
    }
})

import request from "./js/request"
window.REQUEST = new request()

import { UI_Loader, UI_Login, isReallyOnline } from "./js/UI"
window.isReallyOnline = isReallyOnline

UI_Loader("Connecting...")
document.addEventListener("DOMContentLoaded", () => UI_Login())

// https://gemini.google.com/share/ac68c54323e9
 