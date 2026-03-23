// import DBM from "./indexedDB"
import { isReallyOnline, generateUUID, UI_Login, UI_Offline, UI_clearPopUp, UI_Loader, UI_Main, UI_Alert } from "./UI";
import REQUEST from "./request";

// const DB = new DBM()

/**
 * Advanced Device Manager for MAKU System
 * Focus: Persistence, Validation, & Fail-safe State
 */
class Device {
    constructor() {
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        // this.init();
    }

    /**
     * Pastikan device ID selalu ada sejak aplikasi dibuka
     */
    async init() {
        // if (!this.get()) return this.create();
        const user = this.get()
        f (user.STATUS.indexOf("Bendhard16") >= 0 || user.EXPIRED >= Date.now()) {
            if (!isOnline.confirm) return UI_Offline()
            this.initGoogleLogin()
        }
        
        if (user && user.STATUS)
        if (!user) {
            const isOnline = await isReallyOnline()
            if (!isOnline.confirm) return UI_Offline()
            this.initGoogleLogin()
            UI_Login()
            UI_clearPopUp()
        } else if (!user.STATUS || !user.EXPIRED || user.CREATED_AT == user.LAST_SYNC) {
            const isOnline = await isReallyOnline()
            if (!isOnline.confirm) return UI_Offline()
            this.initGoogleLogin()
            UI_Login()
            UI_clearPopUp()
        } else if (user.STATUS.indexOf("Bendhard16") >= 0 || user.EXPIRED >= Date.now()) {
            if (!isOnline.confirm) return UI_Offline()
            this.initGoogleLogin()
        }
    }

    /**
     * Registrasi Perangkat (Jalankan 1x untuk mendaftarkan Laptop/HP)
     */
    async registerDevice(sub, email) {
        try {
            const publicKeyOptions = {
                challenge   : window.crypto.getRandomValues(new Uint8Array(32)),
                rp          : { name: "MAKU", id: window.location.hostname },
                user        : {
                    id          : window.crypto.getRandomValues(new Uint8Array(16)),
                    sub         : sub,
                    name        : email,
                    displayName : email.split('@')[0]
                },
                pubKeyCredParams        : [{ alg: -7, type: "public-key" }], // ES256
                authenticatorSelection  : { userVerification: "required" }, // Paksa PIN/Sidik Jari
                timeout                 : 60000
            };

            const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
            
            // Kirim Public Key ke Cloudflare untuk disimpan di KV
            const regData = {
                email       : email,
                sub         : sub,
                credId      : bufferToBase64(credential.rawId),
                publicKey   : bufferToBase64(credential.response.getPublicKey())
            };

            return regData
        } catch (e) {
            this._log(e.message)
            return false
        }
        

        // Lakukan fetch ke endpoint registrasi Cloudflare kamu
        // console.log("Kirim ini ke Cloudflare KV:", regData);
    }

    /**
     * Membuat Identitas Device Baru dengan Fallback UUID
     */
    create(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return data;
        } catch (e) {
            // Jika localStorage penuh (kasus langka tapi mungkin)
            console.error("Storage Full!", e);
        }
    }

    /**
     * Ambil data device dengan parsing yang aman
     */
    get() {
        // const devices = DBM.getAll("device")
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Update data device secara parsial (Merge)
     */
    async update(newData) {
        try {
            const current = this.get() || this.create();
            // Gunakan Spread Operator untuk merging data secara elegan
            const updated = { ...current, ...newData, UPDATED_AT: Date.now() };
            
            localStorage.setItem(this.storageKey, JSON.stringify(updated));
            this.main._log("Device Updated", newData);
            return updated;
        } catch (err) {
            console.error("Gagal update device:", err);
        }
    }

    
    initGoogleLogin () {
        // 1. Inisialisasi
        google.accounts.id.initialize({
            client_id: "682153086273-cvnoual5uc002rbisi3t1ctbgmd5dot2.apps.googleusercontent.com",
            
            callback: async (response) => {
                // document.querySelector("#login").classList.add("dis-none")
                // document.querySelector("#main").classList.remove("dis-none")
                const token     = response.credential
                // return console.log(token)
                // const decode    = this._decodeJWT(token)
                // console.log(decode)
                UI_Loader("Login....")
                const resp = await REQUEST.post({
                    type        : "login",
                    credential  : token
                })
                if (!resp.confirm) return UI_Alert(resp.error.message)
                if (!resp.data.confirm) return UI_Alert(resp.data.msg)
                if (resp.data.confirm) {
                    this.update
                }
            },

            auto_select: false,
            context: "signin"
        });

        // 2. Render tombolnya
        google.accounts.id.renderButton(
            document.getElementById("googleBtn"), // Target container
            { 
                type: "standard", 
                shape: "pill", 
                theme: "filled_blue", 
                text: "signin_with", 
                size: "large", 
                locale: "id", 
                width: "250" 
            }
        );
        this._log("Init Google Login ✅")

    }

    generateUUID() {
        try {
            return crypto.randomUUID();
        } catch (e) {
            // Fallback jika browser sangat lama (misal HP Android jadul staf)
            return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }) + "-" + Date.now();
        }
    }
    // Helper untuk baca data user dari Google Token (tanpa kirim ke server dulu)
    _decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch (e) {
            return null;
        }
    }
    _log() { 
        try { 
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, ["[Device]"].concat(args)); 
        } catch(_) {}
    }
}

const DEVICE = new Device()
export default DEVICE