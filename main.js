
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
        indexes : ["user", "time", "type", "staff", "itemsCount", "stocksCount"]
    },
    trxItems : {
        keyPath : "id",
        autoIncrement : true,
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

import inventory from "./js/inventory"
window.INVENTORY = new inventory()

import trx from "./js/transaksi"
window.TRANSAKSI = new trx()

UI_Loader("Connecting...")
document.addEventListener("DOMContentLoaded", () => setTimeout(() => UI_Login(), 1000))

// https://gemini.google.com/share/ac68c54323e9


document.querySelector("#logout").onclick = () => {
    localStorage.setItem("device", "")
    window.location.reload()
}