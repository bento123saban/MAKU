
import indexedDB from "./js/indexedDB"
window.DB = new indexedDB("MAKU", 2, {
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
        indexes : ["user", "time", "type", "staff", "dateCreate", "itemsCount", "stocksCount"]
    },
    trxItems : {
        keyPath : "code",
        indexes : ["code", "trxCode"]
    },
    stocks : {
        keyPath : "code",
        indexes : ["in", "out", "stock"]
    },
    counter : {
        keyPath : "type"
    }
})

import request from "./js/request"
window.REQUEST = new request()

import { UI_Loader, UI_Login, isReallyOnline,setChart } from "./js/UI"
window.isReallyOnline = isReallyOnline

UI_Loader("Connecting...")
document.addEventListener("DOMContentLoaded", () => UI_Login())

// https://gemini.google.com/share/ac68c54323e9
 