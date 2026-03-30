
import { getDevice } from "./device";
import { UI_Alert, UI_Login, UI_Notif } from "./UI";

const jenisInput = document.querySelector("#form-jenis-input")
const submitBtn  = document.querySelector("#form-submit-button")
const forms      = document.querySelectorAll(".forms")
const itemsUpdateButtons = document.querySelectorAll(".items-update-button")
const navFrom    = document.querySelector("#tambah-button")


export async function updateItems (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Barang] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getAllItems",
            ...user
        })
        console.log("[Update Barang] Response : ", resp)
        if (resp.data?.confirm) {
            const data      = resp.data.data
            await window.DB.upsert("items", data.list)
            await  window.DB.upsert("counter", {type : "items", count : data.count})
            console.log("[Update Barang] Data barang sudah terupdate ")
            return {confirm : true, data : data}
        }
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Update Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Update Barang] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Barang] Gagal : " + e.message
        }
    }
}

export async function updateTRX (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Transaksi] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getBothTRX",
            ...user
        })
        console.log("[Update Transaksi] Response : ", resp)
        if (resp.data?.confirm) {
            const trxHeader = resp.data.header
            const trxItems  = resp.data.items
            await window.DB.upsert("trxHeader", trxHeader.list)
            await window.DB.upsert("counter", {
                type    : "trxHeader",
                count   : trxHeader.count,
                month   : trxHeader.month
            })

            await window.DB.upsert("trxItems", trxItems.list)
            await window.DB.upsert("counter", {
                type    : "trxItems",
                month   : trxItems.month
            })
            console.log("[Update Transaksi] Data transaksi sudah terupdate ")
            return {confirm : true}
        }
        
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Update Transaksi] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Transaksi] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Update Transaksi] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Transaksi] Gagal : " + e.message
        }
    }
}

export async function updateStocks (loaderCallback = null) {
    try {
        console.log("")
        console.log("[Update Stock] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "getStocks",
            ...user
        })
        console.log("[Update Stock] Response : ", resp)
        if (resp.data?.confirm) {
            const data      = resp.data.data
            await window.DB.upsert("stocks", data.list)
            await window.DB.upsert("counter", {
                type        : "stocks",
                unavailable : data.unavailable,
                available   : data.available,
                total       : data.total
            })
            console.log("[Update Stock] Data stock sudah terupdate ")
            return {confirm : true, data : data}
        }
        if (!resp.confirm || !resp.data?.confirm) {
            console.log("[Update Stock] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Update Stock] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("[Update Stock] Gagal : Undefined")
        console.log("")
    } catch (e) {
        console.log("[Update Stock] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Update Stock] Gagal : " + e.message
        }
    }
}

export async function addItems (data = null, loaderCallback = null) {
    if (!data || typeof data !== "object") return {
        confirm : false,
        msg     : "[Tambah Barang] Data barang tidak ditmukan"
    }
    try {
        console.log("")
        console.log("[Tambah Barang] Request ke server...")
        const user = getDevice()
        if (!user) return UI_Login()
        if (typeof loaderCallback == "function") loaderCallback()
        const resp = await window.REQUEST.post({
            type : "addItems",
            data : data,
            ...user
        })
        // console.log("[Tambah Barang] Response : ", resp)
        if (resp.data?.confirm) {
            console.log("[Tambah Barang] Data barang sudah ditambahkan ")
            return {confirm : true}
        }
        if (!resp.confirm || !resp.data.confirm) {
            console.log("[Tambah Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg)
            return {confirm : false, msg : "[Tambah Barang] Gagal : " + (!resp.confirm) ? resp.error.message : resp.data.msg}
        }
        console.log("")
    } catch (e) {
        console.log("[Tambah Barang] Gagal : " + e.message)
        return {
            confirm : false,
            msg     : "[Tambah Barang] Gagal : " + e.message
        }
    }
}

export async function addItem() {
    const addElms  = document.querySelectorAll("#item-file-add", "#item-code-add", "#item-name-add", "#item-type-add", "textarea#item-note-add")
    const obj = {}
    let param = true
    addElms.forEach(async (elm) => {
        const value = elm.value
        if (elm.type == "file") value = (value == "") ? "" : await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Hanya ambil string setelah koma
            reader.readAsDataURL(value);
        })
        if (value == "") return param = false
        obj[elm.dataset.label] = value
    })
    if (!param) return UI_Notif("Lengkapi semua data", "red")

    const data = obj
    
    console.log("")
    console.log("[Update Barang] Request ke server...")
    const user = getDevice()
    if (!user) return UI_Login()
    const resp = await window.REQUEST.post({
        type : "addItem",
        ...user,
        item    : obj
    })
}

export async function formStart () {
    const updatetrx     = await updateTRX()
    if (!updatetrx.confirm) return UI_Alert(updatetrx.msg)

    const updateitems   = await updateItems()
    if (!updateitems.confirm) return UI_Alert(updateitems.msg)

    const updatestocks  = await updateStocks()
    if (!updatestocks.confirm) return UI_Alert(updatestocks.msg)

    console.log("")
    navFrom.classList.remove("dis-none")
    document.querySelectorAll(".content-loader").forEach(load => load.classList.add("dis-none"))
    
    jenisInput.onchange = () => {
        forms.forEach(form => (form.dataset.form.toUpperCase() == jenisInput.value.toUpperCase()) ? form.classList.remove("dis-none") : form.classList.add("dis-none"))
        submitBtn.className = "p-15 borad-10 pointer " + jenisInput.dataset.clr
        submitBtn.dataset.form = jenisInput.value
    }
    itemsUpdateButtons.forEach(btn => btn.onclick = async () => {
        btn.classList.add("spin")
        const update = await updateItems()
        if (!update.confirm) UI_Alert(update.msg)
        btn.classList.remove("spin")
    })
}

/**
 * UPDATED KELUAR MODULE WITH STOCK CHECK
 */
const KeluarModule = {
    cart: [],

    // 1. Tambah ke keranjang tetap sama, tapi pastikan stokTersedia ikut disimpan
    addToCart: function(kode, nama, stokTersedia) {
        if (stokTersedia <= 0) return alert("Stok Kosong! Tidak bisa mengeluarkan barang ini.");
        
        if (this.cart.some(item => item.kode === kode)) return alert("Barang sudah ada di list!");

        this.cart.push({ 
            kode: kode, 
            nama: nama, 
            stokMax: parseInt(stokTersedia), // Simpan batas maksimum stok
            jumlah: 1 
        });
        this.renderCart();
    },

    // 2. Fungsi Validasi saat User mengubah angka jumlah di input
    updateQty: function(kode, inputElement) {
        const val = parseInt(inputElement.value);
        const item = this.cart.find(i => i.kode === kode);

        if (item) {
            if (val > item.stokMax) {
                alert(`Stok tidak mencukupi! Maksimal stok tersedia: ${item.stokMax}`);
                inputElement.value = item.stokMax; // Paksa balik ke stok maksimal
                item.jumlah = item.stokMax;
            } else if (val <= 0 || isNaN(val)) {
                inputElement.value = 1;
                item.jumlah = 1;
            } else {
                item.jumlah = val;
            }
        }
    },

    // 3. Final Check sebelum Data Benar-benar dikirim ke GAS
    validateBeforeSubmit: function() {
        if (this.cart.length === 0) {
            alert("Keranjang masih kosong!");
            return false;
        }

        // Cari apakah ada jumlah yang melebihi stok (Double Check)
        const overflowItems = this.cart.filter(item => item.jumlah > item.stokMax);
        
        if (overflowItems.length > 0) {
            const namaBarang = overflowItems.map(i => i.nama).join(", ");
            alert(`Gagal! Barang berikut melebihi stok: ${namaBarang}`);
            return false;
        }

        return true;
    },

    getFinalPayload: function() {
        if (!this.validateBeforeSubmit()) return null;

        return {
            action: 'BARANG_KELUAR',
            header: {
                tujuan: document.getElementById('tujuan-keluar-value').value,
                pengambil: document.querySelector('input[name="pengambil"]').value,
                tanggal: document.querySelector('input[name="tanggal_keluar"]').value
            },
            items: this.cart // Mengirim array barang yang sudah divalidasi
        };
    }
};

function processTransaction(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetMaster = ss.getSheetByName("MasterBarang");
  const dataMaster = sheetMaster.getDataRange().getValues();

  if (payload.action === 'BARANG_KELUAR') {
    // Looping setiap barang yang mau dikeluarkan
    for (let item of payload.items) {
      // Cari baris barang di Master
      let row = dataMaster.find(r => r[0] == item.kode); // r[0] adalah kolom Kode
      let stokSekarang = row[3]; // r[3] contoh kolom Stok

      if (stokSekarang < item.jumlah) {
        throw new Error("Stok untuk " + item.nama + " tiba-tiba tidak mencukupi di server!");
      }
    }
    
    // Jika semua lolos cek, baru jalankan fungsi simpan
    return simpanKeSheets(payload);
  }
}

/**
 * FORM BARANG MASUK
 */
const BarangMasukModule = {
    // 1. Preview Gambar Dokumentasi (Opsional)
    initPreview: function() {
        const fileInput = document.getElementById('file-masuk');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                // Logika notifikasi jumlah file yang dipilih
                const label = e.target.nextElementSibling;
                const count = e.target.files.length;
                if (count > 0) {
                    label.innerHTML = `<span class="icon"><i class="fas fa-check-circle clr-green"></i></span> ${count} File Terpilih`;
                }
            });
        }
    },

    // 2. Ambil Data Form Masuk
    getData: async function() {
        const fileInput = document.getElementById('file-masuk');
        let filesData = [];

        // Jika ada file (nota/faktur), proses semua
        if (fileInput && fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                const base64 = await this.toBase64(file);
                filesData.push({
                    name: file.name,
                    data: base64
                });
            }
        }

        const payload = {
            action: 'BARANG_MASUK',
            header: {
                sumber: document.getElementById('item-type-add')?.value || "", // Sumber pengadaan
                penerima: document.querySelector('input[placeholder="Penerima Barang Masuk"]')?.value || "",
                tanggal: document.querySelector('input[type="date"]')?.value || "",
                keterangan: document.querySelector('textarea[placeholder="Keterangan"]')?.value || ""
            },
            // Di sini kita asumsikan barang masuk bisa banyak (bulk) atau satu per satu
            // Jika satu per satu, ambil dari field input utama
            items: [{
                kode: document.getElementById('item-code-add')?.value || "",
                nama: document.getElementById('item-name-add')?.value || "",
                jumlah: parseInt(document.querySelector('input[type="number"]')?.value) || 0
            }],
            dokumentasi: filesData
        };

        // Validasi
        if (!payload.items[0].kode || payload.items[0].jumlah <= 0) {
            alert("Kode barang dan jumlah harus diisi dengan benar!");
            return null;
        }

        return payload;
    },

    toBase64: file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
};

// Inisialisasi event listener file
// BarangMasukModule.initPreview();

/**
 * SERVER COMMUNICATION
 */
async function submitData(moduleType) {
    let payload;
    
    // Tentukan modul mana yang sedang aktif
    if (moduleType === 'TAMBAH') payload = await AddItemModule.getData();
    if (moduleType === 'KELUAR') payload = KeluarModule.getFinalPayload();
    if (moduleType === 'EDIT') payload = await EditModule.getData();

    if (!payload) return;

    console.log("Kirim ke GAS:", payload);

    // Un-comment kode di bawah jika sudah diintegrasikan ke Google Apps Script:
    /*
    google.script.run
        .withSuccessHandler(res => {
            alert("Transaksi Berhasil!");
            location.reload(); 
        })
        .withFailureHandler(err => alert("Gagal: " + err))
        .processTransaction(payload);
    */
}

// Bind ke tombol submit masing-masing
document.getElementById('btn-submit-keluar')?.addEventListener('click', () => submitData('KELUAR'));
document.getElementById('btn-save-item')?.addEventListener('click', () => submitData('TAMBAH'));
document.getElementById('btn-update-item')?.addEventListener('click', () => submitData('EDIT'));


/**
 * FORM EDIT BARANG
 */
const EditModule = {
    // Fungsi ini dipanggil saat tombol Edit di tabel diklik
    populateForm: function(data) {
        document.getElementById('edit-code').value = data.kode;
        document.getElementById('edit-name').value = data.nama;
        document.getElementById('edit-type-value').value = data.tipe;
        document.getElementById('edit-type-label').innerText = data.tipe;
        
        const preview = document.getElementById('preview-img-edit');
        const icon = document.getElementById('placeholder-icon-edit');
        
        if (data.foto) {
            preview.src = data.foto;
            preview.classList.remove('dis-none');
            icon.classList.add('dis-none');
        }
    },

    getData: async function() {
        const fileInput = document.getElementById('item-file-edit');
        let fotoData = document.getElementById('preview-img-edit').src;

        if (fileInput.files.length > 0) {
            fotoData = await AddItemModule.toBase64(fileInput.files[0]);
        }

        return {
            action: 'UPDATE_BARANG',
            kode: document.getElementById('edit-code').value,
            nama: document.getElementById('edit-name').value,
            tipe: document.getElementById('edit-type-value').value,
            foto: fotoData
        };
    }
};


/**
 * FORM BARANG KELUAR
 */
const KeluarModule1 = {
    cart: [],

    // 1. Tambah Barang ke List Keluar
    addToCart: function(kode, nama, stokTersedia) {
        if (this.cart.some(item => item.kode === kode)) return alert("Barang sudah ada di list!");

        this.cart.push({ kode, nama, stok: stokTersedia, jumlah: 1 });
        this.renderCart();
    },

    // 2. Hapus Barang dari List
    removeItem: function(kode) {
        this.cart = this.cart.filter(item => item.kode !== kode);
        this.renderCart();
    },

    // 3. Render HTML List Barang Keluar
    renderCart: function() {
        const container = document.getElementById('list-barang-keluar');
        const emptyMsg = document.getElementById('empty-cart-msg');
        
        if (this.cart.length === 0) {
            container.innerHTML = `<div id="empty-cart-msg" class="w-100 txt-center p-20 clr-grey italic">Belum ada barang dipilih</div>`;
            return;
        }

        container.innerHTML = '<h4 class="fz-14 clr-blue mb-10"><i class="fas fa-shopping-cart"></i> Daftar Barang Keluar</h4>';
        
        this.cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'form-items-group flex-beetwen w-100 gap-10 p-10 borad-10 bg-light-blue mb-10';
            div.innerHTML = `
                <i class="fas fa-trash red pointer" onclick="KeluarModule.removeItem('${item.kode}')"></i>
                <div class="w-100">
                    <span class="fz-10 clr-grey">${item.kode}</span><br>
                    <span class="fz-14 bolder">${item.nama}</span>
                </div>
                <input type="number" class="input-qty" value="${item.jumlah}" min="1" max="${item.stok}" 
                       onchange="KeluarModule.updateQty('${item.kode}', this.value)">
            `;
            container.appendChild(div);
        });
    },

    updateQty: function(kode, val) {
        const item = this.cart.find(i => i.kode === kode);
        if (item) item.jumlah = parseInt(val);
    },

    // 4. Ambil Payload Akhir
    getFinalPayload: function() {
        return {
            action: 'BARANG_KELUAR',
            header: {
                tujuan: document.getElementById('tujuan-keluar-value').value,
                pengambil: document.querySelector('input[name="pengambil"]').value,
                tanggal: document.querySelector('input[name="tanggal_keluar"]').value
            },
            items: this.cart
        };
    }
};

/**
 * FORM TAMBAH BARANG
 */
const AddItemModule = {
    // Preview Gambar
    initPreview: function() {
        document.getElementById('item-file-add').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('preview-img');
            const icon = document.getElementById('placeholder-icon');

            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.classList.remove('dis-none');
                    icon.classList.add('dis-none');
                };
                reader.readAsDataURL(file);
            }
        });
    },

    // Mengambil Data Form
    getData: async function() {
        const fileInput = document.getElementById('item-file-add');
        let base64Image = null;

        if (fileInput.files.length > 0) {
            base64Image = await this.toBase64(fileInput.files[0]);
        }

        return {
            action: 'TAMBAH_BARANG',
            kode: document.getElementById('item-code-add').value.trim(),
            nama: document.getElementById('item-name-add').value.trim(),
            tipe: document.getElementById('item-type-add').value,
            catatan: document.getElementById('item-note-add').value,
            foto: base64Image
        };
    },

    toBase64: file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
};

// Inisialisasi
// AddItemModule.initPreview();


/**
 * GLOBAL UI CONTROLLER
 * Menangani interaksi dropdown dan navigasi antar form
 */
document.addEventListener('click', function(e) {
    // Logic Custom Select Dropdown
    const trigger = e.target.closest('.select-trigger');
    if (trigger) {
        const container = trigger.closest('.custom-select-container');
        container.classList.toggle('active');
        return;
    }

    // Memilih Opsi Dropdown
    const option = e.target.closest('.option');
    if (option) {
        const container = option.closest('.custom-select-container');
        const hiddenInput = container.querySelector('.select-input');
        const label = container.querySelector('.select-trigger span');
        const value = option.dataset.value;

        hiddenInput.value = value;
        label.innerText = option.innerText;
        label.classList.remove('clr-grey', 'italic');
        container.classList.remove('active');
        return;
    }

    // Tutup dropdown jika klik di luar
    if (!e.target.closest('.custom-select-container')) {
        document.querySelectorAll('.custom-select-container').forEach(c => c.classList.remove('active'));
    }
});