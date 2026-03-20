// js/auth.js

export const initGoogleLogin = () => {
    // 1. Inisialisasi
    google.accounts.id.initialize({
        client_id: "682153086273-cvnoual5uc002rbisi3t1ctbgmd5dot2.apps.googleusercontent.com",
        callback: handleLoginResponse, // Panggil fungsi di bawah
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
};

// Fungsi internal module (tidak perlu diexport jika hanya dipakai di sini)
const handleLoginResponse = async (response) => {
    console.log("JWT Received:", response.credential);

    const payload = {
        type: "loginGoogle",
        credential: response.credential
    };

    try {
        const req = await fetch('URL_WEB_APP_GAS_KAMU', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const res = await req.json();

        if (res.confirm) {
            // Logika pindah halaman atau hide login
            document.querySelector("#login-content").classList.add("dis-none");
            document.querySelector("#main").classList.remove("dis-none");
            
            // Simpan session
            localStorage.setItem("user", JSON.stringify(res.data));
        } else {
            alert("Gagal Login: " + res.msg);
        }
    } catch (err) {
        console.error("Auth Error:", err);
    }
};

// Jalankan inisialisasi saat window load
window.addEventListener('load', initGoogleLogin);