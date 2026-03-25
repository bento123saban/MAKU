
import { getDevice } from "./device";
import { UI_Login } from "./UI";

const jenisInput = document.querySelector("#form-jenis-input")
const submitBtn  = document.querySelector("#form-submit-button")
const forms      = document.querySelectorAll(".forms")
const itemsUpdateButtons = document.querySelectorAll(".items-update-button")


export async function updateBarang (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Barang] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getAllItems",
            ...user
        })
        console.log("[Update Barang] Response : ", resp)
        if (resp.data.confirm) {
            const data      = resp.data.data
            const inserts   = await window.DB.upsert("items", data)
            console.log("[Update Barang] Data barang sudah terupdate ")
            return {confirm : true, data : data}
        }
        console.log("[Update Barang] Update Gagal...")
        if (!resp.confirm) return {confirm : false, msg : "[Update Barang] Gagal : " + resp.error.message}
        if (!resp.data.confirm) return {confirm : false, msg : "[Update Barang] Gagal : " + resp.data.msg}
        console.log("")
    } catch (e) {
        console.log("[Update Barang] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Barang] Gagal : " + e.message
        }
    }
}

export async function formStart () {
    updateBarang()
}