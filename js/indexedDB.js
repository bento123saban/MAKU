

export default class IDBManager {
    // Properti statis untuk menyimpan satu-satunya instance (Singleton Pattern)
    // Ini memastikan tidak ada dua koneksi database yang bertabrakan di satu tab browser.
    static instance = null;

    constructor(dbName = "MAKU", version = 1, schema = null) {
        // Jika instance sudah ada, kembalikan instance tersebut (jangan buat baru)
        if (IDBManager.instance) return IDBManager.instance;

        this.dbName = dbName;   // Nama database (misal: "Inventaris_DLHP")
        this.version = version; // Versi DB. Jika struktur tabel berubah, naikkan angka ini.
        this.schema = schema;   // Definisi tabel-tabel dan index-nya.
        this.db = null;         // Tempat menyimpan objek database setelah terbuka.

        /** * PROMISE QUEUE (Antrean Janji)
         * Ini adalah fitur paling krusial. IndexedDB bersifat asinkron. 
         * Jika kamu melakukan 10 perintah tulis (write) sekaligus, sering terjadi error "Transaction Inactive".
         * _queue memastikan perintah ke-2 baru jalan setelah perintah ke-1 benar-benar selesai.
         */
        this._queue = Promise.resolve();
        
        IDBManager.instance = this;
    }

    /**
     * METHOD: _getDB (Internal/Private-like)
     * Mengelola pembukaan koneksi dan pembuatan tabel (Schema Migration).
     */
    async _getDB() {
        // Jika sudah terhubung, langsung kembalikan koneksi yang ada
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            // Dipanggil HANYA jika versi DB naik atau DB baru dibuat pertama kali
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                const transaction = e.target.transaction; // Ambil transaksi upgrade

                for (const [storeName, config] of Object.entries(this.schema)) {
                    let store;
                    
                    if (!db.objectStoreNames.contains(storeName)) {
                        // Jika tabel belum ada, buat baru
                        store = db.createObjectStore(storeName, { keyPath: config.keyPath });
                    } else {
                        // Jika tabel SUDAH ada, ambil store-nya dari transaksi
                        store = transaction.objectStore(storeName);
                    }

                    // Kelola Index
                    if (config.indexes) {
                        config.indexes.forEach(idx => {
                            // Cek apakah index ini sudah ada di tabel?
                            if (!store.indexNames.contains(idx)) {
                                // Jika belum ada, buat index baru
                                store.createIndex(idx, idx, { unique: false });
                            }
                        });
                    }
                    
                    // OPSIONAL: Hapus index lama yang tidak ada lagi di skema baru
                    Array.from(store.indexNames).forEach(existingIdx => {
                        if (!config.indexes.includes(existingIdx)) {
                            store.deleteIndex(existingIdx);
                        }
                    });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onerror = (e) => reject(`Critical IDB Error: ${e.target.error}`);

            // Mencegah error jika user buka aplikasi di dua tab dan salah satunya sedang upgrade
            request.onblocked = () => alert("Tutup tab lain aplikasi ini untuk sinkronisasi database!");
        });
    }

    /**
     * METHOD: _execute (The Engine)
     * Jantung dari class ini. Semua operasi CRUD wajib lewat sini agar antreannya terjaga.
     */
    async _execute(storeName, mode, callback) {
        // Menambahkan tugas baru ke dalam antrean (chaining promises)
        return this._queue = this._queue.then(async () => {
            const db = await this._getDB();
            return new Promise((resolve, reject) => {
                // Membuka transaksi pada tabel tertentu
                const transaction = db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                
                // Menjalankan perintah (add, put, get, dll) yang dikirim lewat callback
                const request = callback(store);

                // Jika transaksi selesai sepenuhnya (commit)
                transaction.oncomplete = () => {
                    // Jika ada hasil request (seperti data dari get), kirim hasilnya
                    resolve(request ? request.result : true);
                };

                // Jika ada error di tingkat transaksi atau request
                transaction.onerror = (e) => reject(e.target.error);
                if (request) {
                    request.onerror = (e) => reject(e.target.error);
                }
            });
        }).catch(err => {
            console.error(`Transaction Failed on ${storeName}:`, err);
            throw err; // Lempar error agar bisa ditangkap di level aplikasi (try-catch)
        });
    }

    /**
     * METHOD: upsert (Update or Insert)
     * Sangat sakti. Jika data dengan ID/Key yang sama sudah ada, dia update. 
     * Jika belum ada, dia tambah. Mendukung data satuan atau array (bulk).
     */
    async upsert(storeName, data) {
        return this._execute(storeName, "readwrite", (store) => {
            if (Array.isArray(data)) {
                // Jika inputnya array, masukkan satu-persatu dalam satu transaksi
                data.forEach(item => {
                    // console.log(item)
                    store.put(item)
                });
            } else {
                // Jika inputnya objek tunggal
                return store.put(data);
            }
        });
    }

    /**
     * METHOD: find (Index Search)
     * Mencari data yang NILAINYA PERSIS sama menggunakan fitur Indexing IDB.
     * Sangat cepat karena tidak memindai seluruh database (O(log n)).
     */
    async find(storeName, index, value) {
        try {
            const db = await this._getDB();
            return await new Promise((res, rej) => {
                // Default transaction adalah "readonly", kita buang biar makin pendek.
                // Method chaining dari transaction -> objectStore -> index -> getAll
                const req = db.transaction(storeName).objectStore(storeName).index(index).getAll(IDBKeyRange.only(value));
                req.onsuccess = () => res(req.result);
                req.onerror = () => rej(req.error);
            });
        } catch (err) {
            console.error(`[DB Error] Gagal baca ${storeName}.${index}:`, err);
            return []; // Tahan banting: Return array kosong biar fungsi forEach/map di luarnya nggak meledak.
        }
    }

    /**
     * @param {string} storeName 
     * @param {Object} options
     * @param {string|string[]} options.query - Satu kata atau array kata kunci (OR logic)
     * @param {Object} options.filters - Object filter, nilai bisa berupa primitive atau Array (IN logic)
     * @param {string[]} options.fields - Kolom yang dipindai oleh query
     */
    async search(storeName, { 
        query = "", 
        filters = {}, 
        fields = [], 
        limit = 50, 
        offset = 0, 
        direction = "next" 
    } = {}) {
        
        // 1. Normalisasi Query (Case Insensitive)
        const queryArray = (Array.isArray(query) ? query : [query])
            .map(q => String(q).toLowerCase().trim())
            .filter(q => q !== "");

        const results = [];
        let skipped = 0;
        const filterEntries = Object.entries(filters);

        return new Promise((resolve, reject) => {
            this._execute(storeName, "readonly", (store) => {
                let request;

                // 2. OPTIMASI INDEX (Cari satu index terbaik untuk mempersempit scan)
                let usedIndex = false;
                for (const [key, value] of filterEntries) {
                    // Jangan pakai index kalau filternya array (IDBKeyRange.only nggak bisa array)
                    if (!Array.isArray(value) && store.indexNames.contains(key)) {
                        request = store.index(key).openCursor(IDBKeyRange.only(value), direction);
                        usedIndex = true;
                        break; 
                    }
                }

                // 3. FALLBACK KE FULL SCAN (Jika tidak ada index yang cocok)
                if (!usedIndex) {
                    request = store.openCursor(null, direction);
                }

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (!cursor) return resolve(results); // Data habis

                    const item = cursor.value;

                    // --- LOGIKA FILTER (Loose equality == untuk Tahun & Angka) ---
                    const passesFilters = filterEntries.every(([key, val]) => {
                        if (Array.isArray(val)) return val.some(v => v == item[key]);
                        return item[key] == val; // "2027" == 2027 tetap TRUE
                    });
                    
                    // --- LOGIKA QUERY (OR Logic across fields) ---
                    const passesQuery = !queryArray.length || queryArray.some(q => 
                        fields.some(f => String(item[f] || "").toLowerCase().includes(q))
                    );

                    // --- PAGINATION & PUSH ---
                    if (passesFilters && passesQuery) {
                        if (skipped < offset) {
                            skipped++;
                        } else {
                            results.push(item);
                        }
                    }

                    // Cek limit: lanjut atau stop?
                    if (results.length < limit) {
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };

                request.onerror = (err) => reject(err);
            }).catch(reject);
        });
    }

    /**
     * Pencarian IndexedDB dengan Agregasi (Unique Code + Sum In/Out)
     * Mendukung Query Teks Jamak (OR) & Filter Dinamis (AND/OR)
     * * @param {string} storeName - Nama object store
     * @param {Object} options - { query, filters, fields, filterStrategy, direction }
     */
    async searchUnique(storeName, targetKey = "code", options = {}) {
        if (typeof targetKey === 'object' && targetKey !== null) {
            options = targetKey;
            targetKey = "code";
        }

        const { 
            query = "", 
            filters = {}, 
            fields = [], 
            dateRange = { field: "date", start: "", end: "" },
            filterStrategy = "AND", 
            direction = "next",
            isUnique = true 
        } = options;
        
        const qArr = [].concat(query).filter(q => q != null && q !== "").map(q => String(q).toLowerCase().trim());
        const fEntries = Object.entries(filters).filter(([_, v]) => v != null);
        const isAND = String(filterStrategy).toUpperCase() === "AND";
        const map = new Map();
        const rawResults = [];

        return new Promise((resolve, reject) => {
            try {
                this._execute(storeName, "readonly", (store) => {
                    let request = store.openCursor(null, direction);

                    if (isAND) {
                        const idx = fEntries.find(([k, v]) => !Array.isArray(v) && store.indexNames.contains(k));
                        if (idx) request = store.index(idx[0]).openCursor(IDBKeyRange.only(idx[1]), direction);
                    }

                    request.onsuccess = ({ target: { result: cursor } }) => {
                        if (!cursor) return resolve(isUnique ? [...map.values()] : rawResults);

                        const item = cursor.value;
                        if (!item || item[targetKey] == null) return cursor.continue();

                        // --- 1. FILTERING ---
                        let passDate = true;
                        if (dateRange.start || dateRange.end) {
                            const itemDate = item[dateRange.field || "date"];
                            const start = dateRange.start || "0000-00-00";
                            const end = dateRange.end || "9999-99-99";
                            passDate = itemDate >= start && itemDate <= end;
                        }

                        const passFilter = !fEntries.length || fEntries[isAND ? 'every' : 'some'](([k, v]) => {
                            const val = item[k];
                            if (val == null) return false;
                            if (Array.isArray(v)) return v.some(allowed => String(val).toLowerCase() == String(allowed).toLowerCase());
                            return String(val).toLowerCase() == String(v).toLowerCase();
                        });

                        const passQuery = !qArr.length || qArr.some(q => 
                            fields.some(f => item[f] != null && String(item[f]).toLowerCase().indexOf(q) !== -1)
                        );

                        // --- 2. PROCESSING ---
                        if (passDate && passFilter && passQuery) {
                            const rawType = String(item.type || "").toUpperCase();
                            const day = String(item.date || "").padStart(2, '0');
                            const dateStr = `${day} ${item.month || ""} ${item.year || ""}`.trim();
                            
                            // Ambil nilai qty asli dari data lo
                            const valIn = Number(item.in || 0);
                            const valOut = Number(item.out || 0);

                            if (!isUnique) {
                                const rawItem = { ...item, date: dateStr };
                                delete rawItem.month; delete rawItem.year;
                                rawResults.push(rawItem);
                            } else {
                                // GROUPING HANYA BERDASARKAN KODE (ITM-109)
                                const groupKey = item[targetKey];
                                
                                if (!map.has(groupKey)) {
                                    const firstItem = { ...item, in: valIn, out: valOut, date: dateStr, trxCount: 1 };
                                    
                                    delete firstItem.month; delete firstItem.year; delete firstItem.qty;
                                    
                                    // Tetap sertakan type di dalam rincian trxCode
                                    firstItem.trxCode = item.trxCode ? [{ 
                                        code: item.trxCode, 
                                        in: valIn, 
                                        out: valOut, 
                                        type: rawType 
                                    }] : [];
                                    
                                    map.set(groupKey, firstItem);
                                } else {
                                    const curr = map.get(groupKey);
                                    
                                    // --- LOGIKA BARU UNTUK TYPE ---
                                    // Kalau type saat ini bukan RECAP, dan type data yang baru masuk (rawType) berbeda 
                                    // dengan type saat ini (misal: curr.type "IN", rawType "OUT"), maka ubah jadi RECAP.
                                    if (curr.type !== "RECAP" && curr.type !== rawType) {
                                        curr.type = "RECAP";
                                    }
                                    
                                    // Tambahkan total IN dan OUT secara akumulatif
                                    curr.in += valIn;
                                    curr.out += valOut;

                                    // Tambahkan rincian ke array trxCode
                                    if (item.trxCode) {
                                        curr.trxCode.push({ 
                                            code: item.trxCode, 
                                            in: valIn, 
                                            out: valOut, 
                                            type: rawType 
                                        });
                                    }

                                    // Gabungkan tanggal jika belum ada
                                    if (dateStr && !curr.date.includes(dateStr)) {
                                        curr.date = curr.date ? `${curr.date}, ${dateStr}` : dateStr;
                                    }

                                    // Auto-Sum Field Angka Lainnya (selain in, out, dll)
                                    for (const key in item) {
                                        const val = item[key];
                                        if (
                                            key !== targetKey && key !== "date" && key !== "month" && 
                                            key !== "year" && key !== "type" && key !== "trxCode" && 
                                            key !== "qty" && key !== "in" && key !== "out" && key !== "id" && key !== "stamp" &&
                                            val !== "" && val !== null && typeof val !== 'boolean' && !isNaN(val)
                                        ) {
                                            curr[key] = (+(curr[key] || 0)) + (+val);
                                        }
                                    }
                                    curr.trxCount += 1;
                                }
                            }
                        }
                        cursor.continue();
                    };
                    request.onerror = () => reject(request.error);
                }).catch(reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * 🏆 THE ULTIMATE REPORTING ENGINE: Range Tanggal Indo + Unik Aggregation
     * Menerima format "12 April 2026", mengkonversi ke Timestamp, lalu Map-Reduce!
     */
    async searchUniqueByDateRange(storeName, { 
        start = "", end = "", filters = {}, direction = "next" 
    } = {}) {
        // Parser Internal: Indo String to Timestamp
        const parseDateIndo = (str) => {
            if (!str) return null;
            const months = { januari:0, februari:1, maret:2, april:3, mei:4, juni:5, juli:6, agustus:7, september:8, oktober:9, november:10, desember:11 };
            const p = String(str).toLowerCase().split(' ');
            if (p.length < 3) return new Date(str).getTime(); // Fallback
            return new Date(parseInt(p[2]), months[p[1]], parseInt(p[0])).getTime();
        };

        const startTime = start ? parseDateIndo(start) : 0;
        const endTime = end ? parseDateIndo(end) : Date.now();
        const fEntries = Object.entries(filters).filter(([_, v]) => v != null);
        const map = new Map();

        return new Promise((resolve, reject) => {
            this._execute(storeName, "readonly", (store) => {
                if (!store.indexNames.contains("stamp")) return reject("❌ Index 'stamp' wajib ada di DB!");

                const request = store.index("stamp").openCursor(IDBKeyRange.bound(startTime, endTime), direction);

                request.onsuccess = ({ target: { result: cursor } }) => {
                    if (!cursor) return resolve([...map.values()]);
                    const item = cursor.value;
                    if (!item || !item.code) return cursor.continue();

                    const passFilter = !fEntries.length || fEntries.every(([k, v]) => {
                        const val = item[k];
                        if (val == null) return false;
                        if (Array.isArray(v)) return v.some(a => String(a).toLowerCase() === String(val).toLowerCase() || a == val);
                        return String(val).toLowerCase() === String(v).toLowerCase() || val == v;
                    });

                    if (passFilter) {
                        const existing = map.get(item.code) || { ...item, in: 0, out: 0, trxCount: 0 };
                        existing.in += +(item.in || 0);
                        existing.out += +(item.out || 0);
                        existing.trxCount += 1;
                        map.set(item.code, existing);
                    }
                    cursor.continue();
                };
                request.onerror = () => reject(request.error);
            }).catch(reject);
        });
    }
    
    /**
     * METHOD: getPaged (Pagination)
     * Membagi data menjadi halaman-halaman. 
     * Sangat penting jika data kamu sudah ribuan agar browser tidak lag saat render tabel.
     */
    async getPaged(storeName, page = 1, limit = 10) {
        const all = await this.getAll(storeName);
        const start = (page - 1) * limit; // Hitung index awal
        return all.slice(start, start + limit); // Potong array sesuai limit
    }

    /**
     * METHOD: Standard CRUD (getAll, getById, delete, clear)
     * Fungsi dasar manajemen data.
     */
    async getAll(storeName) {
        return this._execute(storeName, "readonly", (store) => store.getAll());
    }

    async getById(storeName, id) {
        return this._execute(storeName, "readonly", (store) => store.get(id));
    }

    async delete(storeName, id) {
        return this._execute(storeName, "readwrite", (store) => store.delete(id));
    }

    async clear(storeName) {
        return this._execute(storeName, "readwrite", (store) => store.clear());
    }
}
