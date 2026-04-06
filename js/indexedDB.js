


// export default class IDBManager {
//     // Properti statis untuk menyimpan satu-satunya instance (Singleton Pattern)
//     // Ini memastikan tidak ada dua koneksi database yang bertabrakan di satu tab browser.
//     static instance = null;

//     constructor(dbName = "MAKU", version = 1, schema = null) {
//         // Jika instance sudah ada, kembalikan instance tersebut (jangan buat baru)
//         if (IDBManager.instance) return IDBManager.instance;

//         this.dbName = dbName;   // Nama database (misal: "Inventaris_DLHP")
//         this.version = version; // Versi DB. Jika struktur tabel berubah, naikkan angka ini.
//         this.schema = schema;   // Definisi tabel-tabel dan index-nya.
//         this.db = null;         // Tempat menyimpan objek database setelah terbuka.

//         /** * PROMISE QUEUE (Antrean Janji)
//          * Ini adalah fitur paling krusial. IndexedDB bersifat asinkron. 
//          * Jika kamu melakukan 10 perintah tulis (write) sekaligus, sering terjadi error "Transaction Inactive".
//          * _queue memastikan perintah ke-2 baru jalan setelah perintah ke-1 benar-benar selesai.
//          */
//         this._queue = Promise.resolve();
        
//         IDBManager.instance = this;
//     }

//     /**
//      * METHOD: _getDB (Internal/Private-like)
//      * Mengelola pembukaan koneksi dan pembuatan tabel (Schema Migration).
//      */
//     async _getDB() {
//         // Jika sudah terhubung, langsung kembalikan koneksi yang ada
//         if (this.db) return this.db;

//         return new Promise((resolve, reject) => {
//             const request = indexedDB.open(this.dbName, this.version);

//             // Dipanggil HANYA jika versi DB naik atau DB baru dibuat pertama kali
//             request.onupgradeneeded = (e) => {
//                 const db = e.target.result;
//                 const transaction = e.target.transaction; // Ambil transaksi upgrade

//                 for (const [storeName, config] of Object.entries(this.schema)) {
//                     let store;
                    
//                     if (!db.objectStoreNames.contains(storeName)) {
//                         // Jika tabel belum ada, buat baru
//                         store = db.createObjectStore(storeName, { keyPath: config.keyPath });
//                     } else {
//                         // Jika tabel SUDAH ada, ambil store-nya dari transaksi
//                         store = transaction.objectStore(storeName);
//                     }

//                     // Kelola Index
//                     if (config.indexes) {
//                         config.indexes.forEach(idx => {
//                             // Cek apakah index ini sudah ada di tabel?
//                             if (!store.indexNames.contains(idx)) {
//                                 // Jika belum ada, buat index baru
//                                 store.createIndex(idx, idx, { unique: false });
//                                 // console.log(`Index baru '${idx}' ditambahkan ke ${storeName}`);
//                             }
//                         });
//                     }
                    
//                     // OPSIONAL: Hapus index lama yang tidak ada lagi di skema baru
                    
//                     Array.from(store.indexNames).forEach(existingIdx => {
//                         if (!config.indexes.includes(existingIdx)) {
//                             store.deleteIndex(existingIdx);
//                         }
//                     });
                    
//                 }
//             };

//             request.onsuccess = (e) => {
//                 this.db = e.target.result;
//                 resolve(this.db);
//             };

//             request.onerror = (e) => reject(`Critical IDB Error: ${e.target.error}`);

//             // Mencegah error jika user buka aplikasi di dua tab dan salah satunya sedang upgrade
//             request.onblocked = () => alert("Tutup tab lain aplikasi ini untuk sinkronisasi database!");
//         });
//     }

//     /**
//      * METHOD: _execute (The Engine)
//      * Jantung dari class ini. Semua operasi CRUD wajib lewat sini agar antreannya terjaga.
//      */
//     async _execute(storeName, mode, callback) {
//         // Menambahkan tugas baru ke dalam antrean (chaining promises)
//         return this._queue = this._queue.then(async () => {
//             const db = await this._getDB();
//             return new Promise((resolve, reject) => {
//                 // Membuka transaksi pada tabel tertentu
//                 const transaction = db.transaction([storeName], mode);
//                 const store = transaction.objectStore(storeName);
                
//                 // Menjalankan perintah (add, put, get, dll) yang dikirim lewat callback
//                 const request = callback(store);

//                 // Jika transaksi selesai sepenuhnya (commit)
//                 transaction.oncomplete = () => {
//                     // Jika ada hasil request (seperti data dari get), kirim hasilnya
//                     resolve(request ? request.result : true);
//                 };

//                 // Jika ada error di tingkat transaksi atau request
//                 transaction.onerror = (e) => reject(e.target.error);
//                 if (request) {
//                     request.onerror = (e) => reject(e.target.error);
//                 }
//             });
//         }).catch(err => {
//             console.error(`Transaction Failed on ${storeName}:`, err);
//             throw err; // Lempar error agar bisa ditangkap di level aplikasi (try-catch)
//         });
//     }

//     /**
//      * METHOD: upsert (Update or Insert)
//      * Sangat sakti. Jika data dengan ID/Key yang sama sudah ada, dia update. 
//      * Jika belum ada, dia tambah. Mendukung data satuan atau array (bulk).
//      */
//     async upsert(storeName, data) {
//         return this._execute(storeName, "readwrite", (store) => {
//             if (Array.isArray(data)) {
//                 // Jika inputnya array, masukkan satu-persatu dalam satu transaksi
//                 data.forEach(item => store.put(item));
//             } else {
//                 // Jika inputnya objek tunggal
//                 return store.put(data);
//             }
//         });
//     }

//     /**
//      * METHOD: find (Index Search)
//      * Mencari data yang NILAINYA PERSIS sama menggunakan fitur Indexing IDB.
//      * Sangat cepat karena tidak memindai seluruh database (O(log n)).
//      */
//     /** * Fast Index Access (O(log n)) - Tahan Banting
//  */
//     async find(store, index, value) {
//         try {
//             const db = await this._getDB();
//             return await new Promise((res, rej) => {
//                 // Default transaction adalah "readonly", kita buang biar makin pendek.
//                 // Method chaining dari transaction -> objectStore -> index -> getAll
//                 const req = db.transaction(store).objectStore(store).index(index).getAll(IDBKeyRange.only(value));
//                 req.onsuccess = () => res(req.result);
//                 req.onerror = () => rej(req.error);
//             });
//         } catch (err) {
//             console.error(`[DB Error] Gagal baca ${store}.${index}:`, err);
//             return []; // Tahan banting: Return array kosong biar fungsi forEach/map di luarnya nggak meledak.
//         }
//     }

//     /**
//      * @param {string} storeName 
//      * @param {Object} options
//      * @param {string|string[]} options.query - Satu kata atau array kata kunci (OR logic)
//      * @param {Object} options.filters - Object filter, nilai bisa berupa primitive atau Array (IN logic)
//      * @param {string[]} options.fields - Kolom yang dipindai oleh query
//      */
//     async search(storeName, { 
//         query = "", 
//         filters = {}, 
//         fields = [], 
//         limit = 50, 
//         offset = 0, 
//         direction = "next" 
//     } = {}) {
        
//         // 1. Normalisasi Query (Case Insensitive)
//         const queryArray = (Array.isArray(query) ? query : [query])
//             .map(q => String(q).toLowerCase().trim())
//             .filter(q => q !== "");

//         const results = [];
//         let skipped = 0;
//         const filterEntries = Object.entries(filters);

//         return new Promise((resolve, reject) => {
//             this._execute(storeName, "readonly", (store) => {
//                 let request;

//                 // 2. OPTIMASI INDEX (Cari satu index terbaik untuk mempersempit scan)
//                 let usedIndex = false;
//                 for (const [key, value] of filterEntries) {
//                     // Jangan pakai index kalau filternya array (IDBKeyRange.only nggak bisa array)
//                     if (!Array.isArray(value) && store.indexNames.contains(key)) {
//                         request = store.index(key).openCursor(IDBKeyRange.only(value), direction);
//                         usedIndex = true;
//                         break; 
//                     }
//                 }

//                 // 3. FALLBACK KE FULL SCAN (Jika tidak ada index yang cocok)
//                 if (!usedIndex) {
//                     request = store.openCursor(null, direction);
//                 }

//                 request.onsuccess = (event) => {
//                     const cursor = event.target.result;
//                     if (!cursor) return resolve(results); // Data habis

//                     const item = cursor.value;

//                     // --- LOGIKA FILTER (Loose equality == untuk Tahun & Angka) ---
//                     const passesFilters = filterEntries.every(([key, val]) => {
//                         if (Array.isArray(val)) return val.some(v => v == item[key]);
//                         return item[key] == val; // "2027" == 2027 tetap TRUE
//                     });
                    
//                     // --- LOGIKA QUERY (OR Logic across fields) ---
//                     const passesQuery = !queryArray.length || queryArray.some(q => 
//                         fields.some(f => String(item[f] || "").toLowerCase().includes(q))
//                     );

//                     // --- PAGINATION & PUSH ---
//                     if (passesFilters && passesQuery) {
//                         if (skipped < offset) {
//                             skipped++;
//                         } else {
//                             results.push(item);
//                         }
//                     }

//                     // Cek limit: lanjut atau stop?
//                     if (results.length < limit) {
//                         cursor.continue();
//                     } else {
//                         resolve(results);
//                     }
//                 };

//                 request.onerror = (err) => reject(err);
//             }).catch(reject);
//         });
//     }


//     /**
//      * Pencarian IndexedDB dengan Agregasi (Unique Code + Sum In/Out)
//      * Mendukung Query Teks Jamak (OR) & Filter Dinamis (AND/OR)
//      * * @param {string} storeName - Nama object store
//      * @param {Object} options - { query, filters, fields, filterStrategy, direction }
//      */
//     async searchUnique(storeName, { 
//         query = "", 
//         filters = {}, 
//         fields = [], 
//         filterStrategy = "AND", 
//         direction = "next" 
//     } = {}) {
        
//         // 1. Normalisasi Array Query & hapus null/undefined/string kosong
//         const qArr = [].concat(query)
//             .filter(q => q != null && q !== "")
//             .map(q => String(q).toLowerCase().trim());
            
//         // 2. Bersihkan filter dari properti kosong sejak awal
//         const fEntries = Object.entries(filters).filter(([_, v]) => v != null);
        
//         const isAND = String(filterStrategy).toUpperCase() === "AND";
//         const map = new Map();

//         return new Promise((resolve, reject) => {
//             try {
//                 this._execute(storeName, "readonly", (store) => {
//                     let source = store;
//                     let range = null;

//                     // 3. Optimasi Indexing (Hanya eksekusi jika mode AND & value primitive)
//                     if (isAND) {
//                         const idx = fEntries.find(([k, v]) => !Array.isArray(v) && store.indexNames.contains(k));
//                         if (idx) { 
//                             source = store.index(idx[0]); 
//                             range = IDBKeyRange.only(idx[1]); 
//                         }
//                     }

//                     const request = source.openCursor(range, direction);

//                     // Destructuring event target untuk kode lebih bersih
//                     request.onsuccess = ({ target: { result: cursor } }) => {
//                         // Return hasil sebagai Array menggunakan Spread Operator
//                         if (!cursor) return resolve([...map.values()]);

//                         const item = cursor.value;
                        
//                         // Safety net: Skip jika record korup / tidak ada kode barang
//                         if (!item || !item.code) return cursor.continue();

//                         // 4. LOGIKA FILTER DINAMIS (Anti "Bug 2027" & Kebal Case-Sensitive)
//                         const passFilter = !fEntries.length || fEntries[isAND ? 'every' : 'some'](([k, v]) => {
//                             const itemVal = item[k];
//                             if (itemVal == null) return false;

//                             if (Array.isArray(v)) {
//                                 // Cek isi array (Loose equality & Case insensitive untuk filter array)
//                                 return v.some(allowed => {
//                                     if (typeof itemVal === 'string' && typeof allowed === 'string') {
//                                         return itemVal.toLowerCase() === allowed.toLowerCase();
//                                     }
//                                     return itemVal == allowed;
//                                 });
//                             }

//                             // Cek primitive string (Case insensitive)
//                             if (typeof itemVal === 'string' && typeof v === 'string') {
//                                 return itemVal.toLowerCase() === v.toLowerCase();
//                             }

//                             // LOOSE EQUALITY (==): Kunci agar filter number/string tidak bentrok ("2027" == 2027)
//                             return itemVal == v;
//                         });

//                         // 5. LOGIKA TEXT QUERY (.indexOf untuk pencarian string tercepat)
//                         const passQuery = !qArr.length || qArr.some(q => 
//                             fields.some(f => {
//                                 const fieldVal = item[f];
//                                 return fieldVal != null && String(fieldVal).toLowerCase().indexOf(q) !== -1;
//                             })
//                         );

//                         // 6. MAP-REDUCE AGREGASI (O(1) Lookup)
//                         if (passFilter && passQuery) {
//                             const curr = map.get(item.code) || { ...item, in: 0, out: 0 };
                            
//                             // Unary Plus (+) untuk konversi ke Number paling ringan & efisien
//                             curr.in += +(item.in || 0);
//                             curr.out += +(item.out || 0);
                            
//                             map.set(item.code, curr);
//                         }
                        
//                         cursor.continue();
//                     };
                    
//                     request.onerror = () => reject(request.error);
//                 }).catch(reject);
//             } catch (err) {
//                 // Pengaman di level terluar eksekusi
//                 reject(err);
//             }
//         });
//     }

//     /**
//      * METHOD: getPaged (Pagination)
//      * Membagi data menjadi halaman-halaman. 
//      * Sangat penting jika data kamu sudah ribuan agar browser tidak lag saat render tabel.
//      */
//     async getPaged(storeName, page = 1, limit = 10) {
//         const all = await this.getAll(storeName);
//         const start = (page - 1) * limit; // Hitung index awal
//         return all.slice(start, start + limit); // Potong array sesuai limit
//     }

//     /**
//      * METHOD: Standard CRUD (getAll, getById, delete, clear)
//      * Fungsi dasar manajemen data.
//      */
//     async getAll(storeName) {
//         return this._execute(storeName, "readonly", (store) => store.getAll());
//     }

//     async getById(storeName, id) {
//         return this._execute(storeName, "readonly", (store) => store.get(id));
//     }

//     async delete(storeName, id) {
//         return this._execute(storeName, "readwrite", (store) => store.delete(id));
//     }

//     async clear(storeName) {
//         return this._execute(storeName, "readwrite", (store) => store.clear());
//     }

// }






/* 
async renderTRXItems(code) {
        this.trxItemDetailBox.dataset.code = code;
        
        // 1. Tarik Data Paralel
        const [itemArr, trxItems] = await Promise.all([ 
            window.DB.find("items", "code", code), 
            window.DB.find("trxItems", "code", code) 
        ]);
        if (!itemArr[0]) return;

        // 2. Batching Map Header (Singkat & Padat)
        const headers = await window.DB.search("trxHeader", { query: [...new Set(trxItems.map(i => i.trxCode))], fields: ["code"] });
        const hMap = new Map(headers.map(h => [h.code, h]));
        
        // 3. Render Engine
        const frag = document.createDocumentFragment();
        let inQty = 0, outQty = 0;

        trxItems.forEach(i => {
            const h = hMap.get(i.trxCode);
            if (!h) return; // Skip kalau header gaib

            const qty = +(i.in || i.out || 0);
            i.type === "IN" ? (inQty += qty) : (outQty += qty); // Ternary logic

            const div = document.createElement("div");
            div.className = "trx-items-trx-group w-100 p-10 border-bottom";
            div.innerHTML = `
                <div class="flex-beetwen"><span class="bold">${h.staff}</span><span class="${i.type === "IN" ? "clr-green" : "clr-blue"} bolder">${qty} Pcs</span></div>
                <div class="flex-beetwen fz-12 grey-text"><span>${h.code}</span><span>${new Date(h.time).toLocaleString('id-ID')}</span></div>`;
            frag.appendChild(div);
        });

        // 4. Inject ke DOM (1x Reflow saja)
        const box = document.querySelector("#trx-items-detail");
        box.innerHTML = `
            <div class="p-10 flex-beetwen"><span class="fz-18 bolder">${itemArr[0].name}</span><i class="fas fa-close pointer" id="btn-close"></i></div>
            <div class="p-10 flex-start gap-15"><span class="clr-green bold">IN: ${inQty}</span><span class="clr-blue bold">OUT: ${outQty}</span></div>
            <div id="list" class="max-h-400 scroll-y"></div>
        `;
        
        box.querySelector("#list").appendChild(frag);
        box.querySelector("#btn-close").onclick = () => this.trxItemDetailBox.classList.add("dis-none");
    }

*/


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
                data.forEach(item => store.put(item));
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
    async searchUnique(storeName, { 
        query = "", 
        filters = {}, 
        fields = [], 
        filterStrategy = "AND", 
        direction = "next" 
    } = {}) {
        
        // 1. Normalisasi Array Query & hapus null/undefined/string kosong
        const qArr = [].concat(query)
            .filter(q => q != null && q !== "")
            .map(q => String(q).toLowerCase().trim());
            
        // 2. Bersihkan filter dari properti kosong sejak awal
        const fEntries = Object.entries(filters).filter(([_, v]) => v != null);
        
        const isAND = String(filterStrategy).toUpperCase() === "AND";
        const map = new Map();

        return new Promise((resolve, reject) => {
            try {
                this._execute(storeName, "readonly", (store) => {
                    let source = store;
                    let range = null;

                    // 3. Optimasi Indexing (Hanya eksekusi jika mode AND & value primitive)
                    if (isAND) {
                        const idx = fEntries.find(([k, v]) => !Array.isArray(v) && store.indexNames.contains(k));
                        if (idx) { 
                            source = store.index(idx[0]); 
                            range = IDBKeyRange.only(idx[1]); 
                        }
                    }

                    const request = source.openCursor(range, direction);

                    request.onsuccess = ({ target: { result: cursor } }) => {
                        // Return hasil sebagai Array menggunakan Spread Operator
                        if (!cursor) return resolve([...map.values()]);

                        const item = cursor.value;
                        
                        // Safety net: Skip jika record korup / tidak ada kode barang
                        if (!item || !item.code) return cursor.continue();

                        // 4. LOGIKA FILTER DINAMIS (Anti "Bug 2027" & Kebal Case-Sensitive)
                        const passFilter = !fEntries.length || fEntries[isAND ? 'every' : 'some'](([k, v]) => {
                            const itemVal = item[k];
                            if (itemVal == null) return false;

                            if (Array.isArray(v)) {
                                return v.some(allowed => {
                                    if (typeof itemVal === 'string' && typeof allowed === 'string') {
                                        return itemVal.toLowerCase() === allowed.toLowerCase();
                                    }
                                    return itemVal == allowed;
                                });
                            }

                            if (typeof itemVal === 'string' && typeof v === 'string') {
                                return itemVal.toLowerCase() === v.toLowerCase();
                            }

                            return itemVal == v;
                        });

                        // 5. LOGIKA TEXT QUERY (.indexOf untuk pencarian string tercepat)
                        const passQuery = !qArr.length || qArr.some(q => 
                            fields.some(f => {
                                const fieldVal = item[f];
                                return fieldVal != null && String(fieldVal).toLowerCase().indexOf(q) !== -1;
                            })
                        );

                        // 6. MAP-REDUCE AGREGASI (O(1) Lookup)
                        if (passFilter && passQuery) {
                            const curr = map.get(item.code) || { ...item, in: 0, out: 0, trxCount: 0 };
                            
                            // Unary Plus (+) untuk konversi ke Number paling ringan & efisien
                            curr.in += +(item.in || 0);
                            curr.out += +(item.out || 0);
                            curr.trxCount += 1;
                            
                            map.set(item.code, curr);
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
