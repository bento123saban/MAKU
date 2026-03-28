
import { getDevice } from "./device";
import { UI_Login, UI_Notif } from "./UI";

const jenisInput = document.querySelector("#form-jenis-input")
const submitBtn  = document.querySelector("#form-submit-button")
const forms      = document.querySelectorAll(".forms")
const itemsUpdateButtons = document.querySelectorAll(".items-update-button")


export async function updateItems (loaderCallback = null) {
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
        // console.log("[Update Barang] Response : ", resp)
        if (resp.data?.confirm) {
            const data      = resp.data.data
            const upsert    = await window.DB.upsert("items", data)
            console.log("[Update Barang] Data barang sudah terupdate ")
            return {confirm : true, data : data}
        }
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Update Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Update Barang] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Barang] Gagal : " + e.message
        }
    }
}

export async function updateTRX (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Transaksi] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getBothTRX",
            ...user
        })
        console.log("[Update Transaksi] Response : ", resp)
        if (resp.data?.confirm) {
            const trxHeader = resp.data.trxHeader
            const trxItems  = resp.data.trxItems
            await window.DB.upsert("trxHeader", trxHeader)
            await window.DB.upsert("trxItems", trxItems)
            console.log("[Update Transaksi] Data transaksi sudah terupdate ")
            return {confirm : true, data : data}
        }
        
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Update Transaksi] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Transaksi] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Update Transaksi] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Transaksi] Gagal : " + e.message
        }
    }
}

export async function updateStocks (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Stock] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getStock",
            ...user
        })
        // console.log("[Update Stock] Response : ", resp)
        if (resp.data?.confirm) {
            const data      = resp.data.data
            const upsert    = await window.DB.upsert("items", data)
            console.log("[Update Stock] Data stock sudah terupdate ")
            return {confirm : true, data : data}
        }
        if (!resp.confirm || !resp.data?.confirm) {
            console.log("[Update Stock] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Stock] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("[Update Stock] Gagal : Undefined")
        console.log("")
    } catch (e) {
        console.log("[Update Stock] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Stock] Gagal : " + e.message
        }
    }
}

export async function addItems (data = null, loaderCallback = null) {
    if (!data || typeof data !== "object") return {
        confirm : false,
        msg     : "[Tambah Barang] Data barang tidak ditmukan"
    }
    try {
        console.log("")
        console.log("[Tambah Barang] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "addItems",
            data : data,
            ...user
        })
        // console.log("[Tambah Barang] Response : ", resp)
        if (resp.data?.confirm) {
            console.log("[Tambah Barang] Data barang sudah ditambahkan ")
            return {confirm : true}
        }
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Tambah Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Tambah Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Tambah Barang] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Tambah Barang] Gagal : " + e.message
        }
    }
}

export async function addItem() {
    const addElms  = document.querySelectorAll("#item-file-add", "#item-code-add", "#item-name-add", "#item-type-add", "textarea#item-note-add")
    const obj = {}
    let param = true
    addElms.forEach(async (elm) => {
        const value = elm.value
        if (elm.type == "file") value = (value == "") ? "" : await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Hanya ambil string setelah koma
            reader.readAsDataURL(value);
        })
        if (value == "") return param = false
        obj[elm.dataset.label] = value
    })
    if (!param) return UI_Notif("Lengkapi semua data", "red")

    const data = obj
    
    console.log("")
    console.log("[Update Barang] Request ke server...")
    const user = getDevice()
    if (!user) return UI_Login()
    const resp = await window.REQUEST.post({
        type : "addItem",
        ...user,
        item    : obj
    })
}

export async function formStart () {
    return updateTRX()
    updateItems()
    jenisInput.onchange = () => {
        forms.forEach(form => (form.dataset.form.toUpperCase() == jenisInput.value.toUpperCase()) ? form.classList.remove("dis-none") : form.classList.add("dis-none"))
        submitBtn.className = "p-15 borad-10 pointer " + jenisInput.dataset.clr
        submitBtn.dataset.form = jenisInput.value
    }
    setTimeout(() => readFromAdd(), 1000)
}