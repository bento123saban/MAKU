


class IDBManager {
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
                                console.log(`Index baru '${idx}' ditambahkan ke ${storeName}`);
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
    async find(storeName, indexName, value) {
        const db = await this._getDB();
        return new Promise((resolve) => {
            const transaction = db.transaction([storeName], "readonly");
            const index = transaction.objectStore(storeName).index(indexName);
            // Mengambil semua data yang kolom index-nya sama persis dengan value
            const request = index.getAll(IDBKeyRange.only(value));
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * METHOD: search (Fuzzy / Partial Search)
     * Mencari kata kunci yang terkandung di dalam field tertentu (seperti fitur Search di Google).
     * Contoh: Cari "Epson" di field "Nama", maka "Printer Epson L3110" akan ketemu.
     */
    async search(storeName, query, fields = []) {
        // Ambil semua data dulu (karena IDB tidak punya fitur "LIKE" asli)
        const all = await this.getAll(storeName);
        const q = query.toLowerCase();
        
        // Filter di sisi JavaScript (Client Side)
        return all.filter(item => 
            // Cek apakah query ada di salah satu field yang ditentukan
            fields.some(field => String(item[field]).toLowerCase().includes(q))
        );
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

const DB = new IDBManager("MAKU", 1, {
    barang : {
        keyPath : "code",
        indexes : ["code", "name", "note", "type"]
    },
    device  : {
        keyPath : "email",
        indexes : ["email", "version"]
    }
})

export default DB

