import DBM from "./indexedDB"
import { isReallyOnline, generateUUID, UI_Login } from "./UI";

const DB = new DBM()

/**
 * Advanced Device Manager for MAKU System
 * Focus: Persistence, Validation, & Fail-safe State
 */
export default class Device {
    constructor() {
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.init();
    }

    /**
     * Pastikan device ID selalu ada sejak aplikasi dibuka
     */
    init() {
        // if (!this.get()) return this.create();
        if (!this.get()) {
            UI_Login()
            window.addEventListener('load', async () => {
                const isOnline = await isReallyOnline()
                if (isOnline) initGoogleLogin()
                UI_Offline()
            });
        }
    }

    /**
     * Membuat Identitas Device Baru dengan Fallback UUID
     */
    create() {
        const newDevice = {
            ID          : generateUUID(),
            NAMA        : "Staf DLHP",
            JWT         : null,
            EMAIL       : null,
            VERSION     : "1.0",
            CREATED_AT  : Date.now(),
            LAST_SYNC   : null,
            IS_MOBILE   : this.isMobile
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(newDevice));
            return newDevice;
        } catch (e) {
            // Jika localStorage penuh (kasus langka tapi mungkin)
            console.error("Storage Full!", e);
            return newDevice; // Return object saja di memori
        }
    }

    /**
     * Ambil data device dengan parsing yang aman
     */
    get() {
        const devices = DBM.getAll("device")
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
            callback: this.handleLoginResponse, // Panggil fungsi di bawah
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

    handleLoginResponse (response) {
        this._log("Handle Google Login ✅")

        document.querySelector("#login").classList.add("dis-none")
        document.querySelector("#main").classList.remove("dis-none")

        const resp = await request.post({
            JWT     : resp.credential,
            type    : "login"
        })

        if (!resp.confirm) 



        console.log(post)
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

    play () {
        // Jalankan inisialisasi saat window load
        
    }
}