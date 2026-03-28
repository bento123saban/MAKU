import { UI_Loader, UI_Main, UI_Alert } from "./UI";

/**
 * Advanced Device Manager for MAKU System
 * Focus: Persistence, Validation, & Fail-safe State
 */

/**
 * Registrasi Perangkat (Jalankan 1x untuk mendaftarkan Laptop/HP)
 */
async function registerDevice(sub, email) {
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
        Device_log(e.message)
        return false
    }
    

    // Lakukan fetch ke endpoint registrasi Cloudflare kamu
    // console.log("Kirim ini ke Cloudflare KV:", regData);
}

function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Ambil data device dengan parsing yang aman
 */
export function getDevice() {
    try {
        const raw = localStorage.getItem("device");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Update data device secara parsial (Merge)
 */
export async function updateDevice(newData) {
    try {
        const current = getDevice();
        // Gunakan Spread Operator untuk merging data secara elegan
        const updated = { ...current, ...newData, UPDATED_AT: Date.now() };
        localStorage.setItem("device", JSON.stringify(updated));
        Device_log("Device Updated", newData);
        return updated;
    } catch (err) {
        console.error("Gagal update device:", err);
    }
}

export function initGoogleLogin () {
    // 1. Inisialisasi
    google.accounts.id.initialize({
        client_id: "682153086273-cvnoual5uc002rbisi3t1ctbgmd5dot2.apps.googleusercontent.com",
        
        callback: async (response) => {
            const token     = response.credential
            console.log(token)
            UI_Loader("Login....")
            const resp = await window.REQUEST.post({
                type        : "login",
                credential  : token
            })
            console.log(resp)
            if (!resp.confirm) return UI_Alert(resp.error.message)
            if (!resp.data.confirm) return UI_Alert(resp.data.msg)
            updateDevice(resp.data.user)
            UI_Main()
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
    Device_log("Init Google Login ✅")

}

function Device_log() { 
    try { 
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, ["[Device]"].concat(args)); 
    } catch(_) {}
}



