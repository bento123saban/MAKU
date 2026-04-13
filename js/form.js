
import { getDevice } from "./device";
import { UI_Alert, UI_ClearShimmer, UI_Loader, UI_Login, UI_Notif, UI_showShimmer, defaultFetchResponse } from "./UI";

const jenisInput = document.querySelector("#form-jenis-input")
const submitBtn  = document.querySelector("#form-submit-button")
const forms      = document.querySelectorAll(".forms")
const navFrom    = document.querySelector("#tambah-button")
const itemsUpdateButtons = document.querySelectorAll(".items-update-button")


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

        return await defaultFetchResponse(resp, {
            success : async (param) => {
                try {
                    const data      = resp.data.data
                    await window.DB.upsert("items", data.list)
                    await  window.DB.upsert("counter", {type : "items", count : data.count})
                    console.log("[Update Barang] Data barang sudah terupdate ")
                    UI_Notif("Data barang sudah terupdate", "green")
                    return true
                } catch (e) {
                    console.log("[Update Barang] Gagal : " + e.message)
                    UI_Notif("[Update Barang] Gagal : " + e.message)
                    return false
                }
                
            },
            note : "[Update Barang ] "
        })
    } catch (e) {
        console.log("[Update Barang] Gagal : " + e.message)
        UI_Notif("[Update Barang] Gagal : " + e.message)
        return false
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

        return await defaultFetchResponse(resp, {
            success : async (param) => {
                try {
                    const trxHeader = param.data.header
                    const trxItems  = param.data.items
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
                    UI_Notif("Data transaksi sudah terupdate", "green")
                    return true
                } catch (e) {   
                    console.log("[Update Transaksi] Gagal : " + e.message)
                    UI_Notif("[Update Transaksi] Gagal : " + e.message)
                    return false
                }
            },
            note : "[Update Transaksi] "
        })
    } catch (e) {
        console.log("[Update Transaksi] Gagal : " + e.message)
        UI_Notif("[Update Transaksi] Gagal : " + e.message)
        return false
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

        return await defaultFetchResponse(resp, {
            success : async (param) => {
                try {
                    const data      = param.data.data
                    await window.DB.upsert("stocks", data.list)
                    await window.DB.upsert("counter", {
                        type        : "stocks",
                        unavailable : data.unavailable,
                        available   : data.available,
                        total       : data.total
                    })
                    console.log("[Update Stock] Data stock sudah terupdate ")
                    UI_Notif("Data stok sudah terupdate", "green")
                    return true
                } catch (e) {
                    console.log("[Update Transaksi] Gagal : " + e.message)
                    UI_Notif("[Update Transaksi] Gagal : " + e.message)
                    return false
                }
            },
            note : "[Update Stock] "
        })
    } catch (e) {
        console.log("[Update Transaksi] Gagal : " + e.message)
        UI_Notif("[Update Transaksi] Gagal : " + e.message)
        return false
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

/**
 * Kompres Gambar menggunakan Canvas
 * @param {File} file - File asli dari input
 * @param {number} maxWidth - Lebar maksimal (default 1280px)
 * @param {number} quality - Kualitas 0.0 sampai 1.0 (default 0.7)
 */
async function compressImage(file, maxWidth = 1280, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Hitung Rasio jika gambar terlalu lebar
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export ke Base64 dengan format JPEG (lebih ringan dari PNG)
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Konversi kembali ke Blob untuk konsistensi atau kirim Base64 langsung
                resolve({
                    base64: dataUrl,
                    type: 'image/jpeg',
                    name: file.name.replace(/\.[^/.]+$/, "") + ".jpg" // Ubah ekstensi ke .jpg
                });
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

export function updates(callback = "") {
    const spin = document.querySelector("#trx-update");
    spin.classList.add("spin");
    UI_showShimmer();

    let items = false;
    let stocks = true; // Contoh jika defaultnya dianggap true
    let trx = false;

    const func = () => {
        const isFinished = [items, stocks, trx].every(Boolean);
        
        if (isFinished) {
            if (typeof callback == "function") callback()
            spin.classList.remove("spin");
            UI_ClearShimmer();
        }
    };

    // Tambahkan catch agar func() tetap dipanggil untuk cek state terakhir
    updateItems()
        .then(e => items = !!e)
        .catch(() => items = false) 
        .finally(() => func());

    updateStocks()
        .then(e => stocks = !!e)
        .catch(() => stocks = false)
        .finally(() => func());

    updateTRX()
        .then(e => trx = !!e)
        .catch(() => trx = false)
        .finally(() => func());
}

export async function formStart () {
    const isOnline = await window.isReallyOnline()
    if (!isOnline.confirm) return UI_Notif("Offline", "red")
        
    // const updatetrx     = await updateTRX()
    // const updateitems   = await updateItems()
    // const updatestocks  = await updateStocks()

    navFrom.classList.remove("dis-none")
    document.querySelectorAll(".content-loader").forEach(load => load.classList.add("dis-none"))
    
    jenisInput.onchange = () => {
        forms.forEach(form => (form.dataset.form.toUpperCase() == jenisInput.value.toUpperCase()) ? form.classList.remove("dis-none") : form.classList.add("dis-none"))
        submitBtn.className = "p-15 borad-10 pointer " + jenisInput.dataset.clr
        submitBtn.dataset.form = jenisInput.value
    }
    itemsUpdateButtons.forEach(btn => btn.onclick = async () => {
        btn.classList.add("spin")
        await updateItems()
        await updateStocks()
        btn.classList.remove("spin")
        // UI_Notif("Update Berhasil", "green")
    })

    FormMasuk.init()
    FormKeluar.init()
    FormTambah.init()
    // FormEdit.init() 

    window.ITEMS    = await window.DB.getAll("items")
    window.STOCKS   = await window.DB.getAll("stocks")

    document.querySelector("#form-submit-button").onclick = async (e) => {
        if (jenisInput.value == "masuk") {
            if (e.target.dataset.on == "submitOn") return
            const data = await FormMasuk.getData()
            // return console.log(data)
            if (!data) return
            try {
                e.target.dataset.on = "submitOn"
                console.log("")
                console.log("[Transaksi Masuk] Mengirim ke server...")
                const user = getDevice()
                if (!user) return UI_Login()
                UI_Loader("Mengirim")
                const resp = await window.REQUEST.post({
                    type    : "in",
                    data    : data,
                    ...user
                })

                await defaultFetchResponse(resp, {
                    success : (param) => {
                        UI_Alert(param.data.msg, "green")
                        FormMasuk.reset()
                    },
                    reject  : (param) => UI_Alert(param.data.msg, "red"),
                    failed  : (param) => UI_Alert((param.error?.message || "Terjadi kesalahan pada sistem."), "red"),
                    note    : "[Trasaksi Masuk] "
                })
            } catch (e) {
                console.log("[Transaksi Masuk] Gagal : " + e.message)
                return {
                    confirm : false,
                    msg     : "[Transaksi Masuk] Gagal : " + e.message
                }
            }
            finally {
                e.target.dataset.on = ""
            }
        }
        else if (jenisInput.value == "keluar") {
            if (e.target.dataset.on == "submitOn") return
            const data = await FormKeluar.getData()
            // console.log(data)
            if (!data) return
            try {
                e.target.dataset.on = "submitOn"
                console.log("")
                console.log("[Transaksi Keluar] Mengirim ke server...")
                const user = getDevice()
                if (!user) return UI_Login()
                UI_Loader("Mengirim")
                const resp = await window.REQUEST.post({
                    type    : "out",
                    data    : data,
                    ...user
                })
                await defaultFetchResponse(resp, {
                    success : (param) => {
                        UI_Alert(param.data.msg, "green")
                        FormKeluar.reset()
                    },
                    reject  : (param) => UI_Alert(param.data.msg, "red"),
                    failed  : (param) => UI_Alert((param.error?.message || "Terjadi kesalahan pada sistem."), "red"),
                    note    : "[Trasaksi Keluar] "
                })
            } catch (e) {
                console.log("[Transaksi Keluar] Gagal : " + e.message)
                return {
                    confirm : false,
                    msg     : "[Transaksi Keluar] Gagal : " + e.message
                }
            }
            
            finally {
                e.target.dataset.on = ""
            }
        }
        else if (jenisInput.value == "tambah") {
            if (e.target.dataset.on == "submitOn") return
            const data = await FormTambah.getData()
            // console.log(data)
            if (!data) return
            try {
                e.target.dataset.on = "submitOn"
                console.log("")
                console.log("[Tambah Item] Mengirim ke server...")
                const user = getDevice()
                if (!user) return UI_Login()
                UI_Loader("Mengirim")
                const resp = await window.REQUEST.post({
                    type    : "addItem",
                    data    : data,
                    ...user
                })
                await defaultFetchResponse(resp, {
                    success : (param) => {
                        UI_Alert(param.data.msg, "green")
                        FormKeluar.reset()
                    },
                    reject  : (param) => UI_Alert(param.data.msg, "red"),
                    failed  : (param) => UI_Alert((param.error?.message || "Terjadi kesalahan pada sistem."), "red"),
                    note    : "[Tambah Item] "
                })
            } catch (e) {
                console.log("[Tambah Item] Gagal : " + e.message)
                return {
                    confirm : false,
                    msg     : "[Tambah Item] Gagal : " + e.message
                }
            }
            
            finally {
                e.target.dataset.on = ""
            }
        }
    }
    
}

// Helper sederhana untuk PDF
function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
    });
}


const FormMasuk = (() => {
    // 1. State Management Terpusat
    const state = { items: new Map(), files: [] };
    // let src   = []
    
    // 2. DOM Selector Cache (Lebih cepat & ringkas)
    const el = (id) => document.getElementById(id);
    const dom = {
        list    : el('items-form-masuk-list'),
        search  : el('masuk-items-search'),
        sumber  : el('sumber-masuk'),
        ket     : el('keterangan-sumber-masuk'),
        penerima: el('penerima-masuk'),
        tgl     : el('tanggal-masuk'),
        file    : el('file-input'),
        find    : el('masuk-search-input')
    };

    async function prepareFilesForUpload() {
        const preparedFiles = [];

        for (const file of state.files) {
            if (file.type.startsWith('image/')) {
                // Kompres jika file adalah gambar
                console.log(`Mengompres: ${file.name}`);
                const compressed = await compressImage(file);
                preparedFiles.push(compressed);
            } else {
                // Langsung jadikan Base64 jika PDF
                const base64Data = await fileToBase64(file);
                preparedFiles.push({
                    base64: base64Data,
                    type: file.type,
                    name: file.name
                });
            }
        }
        return preparedFiles;
    }

    // 3. Render UI Reactive
    const render = () => {
        dom.list.innerHTML = state.items.size ? '' : '<div class="p-20 clr-grey grid-center">Belum ada barang dipilih</div>';
        state.items.forEach((val, kode) => {
            dom.list.insertAdjacentHTML('beforeend', `
                <div class="form-items-group flex-beetwen w-100 gap-10" data-kode="${kode}">
                    <i class="fas fa-trash p-7 borad-5 red pointer fz-14 btn-del"></i> |
                    <div class="form-items-left flex-start items-start flex-column w-100">
                        <span class="fz-12">${kode}</span>
                        <span class="fz-18">${val.nama}</span>
                    </div>
                    <div class="flex-beetwen gap-10">
                        <div class="form-icons-group p-5 borad-5">
                            <span>Jumlah : </span>
                            <input type="number" min="1" value="${val.qty}" class="masuk-qty">
                        </div>
                    </div>
                </div>`);
        });
    };

    const renderSearch = (list) => {
        const html = list.map(item => {
            return `
                <tr>
                    <td><i class="fas fa-plus-circle clr-green pointer"></i></td>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td><i class="fas fa-image pointer" onclick="window.location.href('${item.link}')"></i></td>
                </tr>
            `
        }).join("")
        dom.search.innerHTML = html
    }

    // Helper untuk format size agar rapi (KB/MB)
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    function renderFiles() {
        const container = document.getElementById('file-list-display');

        const statusIcon = document.querySelector('.masuk-icon i.fa-file, .masuk-icon i.fa-check');
        const statusText = statusIcon.parentElement.nextSibling; // Mengambil text "Pilih File"
        const listIconBtn = document.getElementById('masuk-file-list-icon');

        const fileCount = state.files.length;
        const totalSize = state.files.reduce((acc, f) => acc + f.size, 0);
        if (fileCount > 0) {
            // Ubah Ikon jadi Check
            statusIcon.classList.replace('fa-file', 'fa-check');
            
            // Update Teks: "2 File (1.5 MB)"
            // Catatan: Jika struktur HTML berbeda, pastikan ID/Class pembungkus teks tepat
            statusIcon.parentElement.parentElement.lastChild.textContent = ` ${fileCount} File (${formatSize(totalSize)})`;
            
            // Tampilkan ikon list
            listIconBtn.classList.remove('dis-none');
        } else {
            // Reset ke kondisi awal
            statusIcon.classList.replace('fa-check', 'fa-file');
            statusIcon.parentElement.parentElement.lastChild.textContent = ' Pilih File';
            
            // Sembunyikan ikon list & container list
            listIconBtn.classList.add('dis-none');
            container.classList.add('dis-none');
        }

        container.innerHTML = ''; // Reset tampilan
        state.files.forEach((file, index) => {
            // Logika penentuan icon berdasarkan tipe file
            let iconClass = 'fa-file'; // Default icon
            
            if (file.type === 'application/pdf') iconClass = 'fa-file-pdf';
            else if (file.type.startsWith('image/')) iconClass = 'fa-image';
            
            const fileSpan = document.createElement('span');
            
            // Styling menggunakan class utility yang kamu punya (asumsi dari snippet sebelumnya)
            fileSpan.className = 'borad-5 p-5-10 flex-start gap-10';
            fileSpan.innerHTML = `
                <i class="fas ${iconClass} clr-green fz-16"></i>
                <span class="clr-dark fz-12">${file.name}</span>
                <i class="fas fa-times-circle clr-red pointer" onclick="removeFileIn(${index})"></i>
            `;
            
            container.appendChild(fileSpan);
        });
        
    }

    return {
        // 4. Inisialisasi Event Listener
        init: () => {
            // A. Tambah Barang (Dari Tabel Search)
            dom.search.addEventListener('click', e => {
                if (!e.target.closest('.fa-plus-circle')) return;
                const cells = e.target.closest('tr').cells;
                const [kode, nama] = [cells[1].innerText, cells[2].innerText];
                // Tambah Qty jika sudah ada, atau buat baru dengan Qty 1
                const qty = state.items
                state.items.set(kode, { nama, qty: (state.items.get(kode)?.qty || 0) + 1 });
                render();
            });

            // B. Hapus & Update Qty (Delegation di List Container)
            dom.list.addEventListener('click', e => {
                if (e.target.classList.contains('btn-del')) {
                    state.items.delete(e.target.closest('[data-kode]').dataset.kode);
                    render();
                }
            });

            dom.list.addEventListener('input', e => {
                const target = e.target
                const value = target.value
                if (target.classList.contains('masuk-qty')) {
                    const kode = e.target.closest('[data-kode]').dataset.kode;
                    const stock = window.STOCKS.find(stok => stok.code == kode).stock
                    if (stock <= value) {
                        UI_Notif("Stock tidak cukup", "red")
                        target.value = stock
                    }
                    state.items.get(kode).qty = parseInt((stoc <= value) ? stock : value) || 0; // Jika dikosongkan, set 0
                }
            });

            // Saat Hapus File
            window.removeFileIn = (index) => {
                state.files.splice(index, 1);
                renderFiles(); // Update semua indikator
            };

            // C. Handle File (Max 4 File, Max 10MB)
            dom.file.addEventListener('change', e => {
                const newFiles = Array.from(e.target.files);

                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                const invalidFile = newFiles.find(f => !allowedTypes.includes(f.type));

                if (invalidFile) {
                    UI_Notif(`File "${invalidFile.name}" tidak diizinkan! Hanya boleh Gambar (JPG/PNG/WebP) atau PDF.`, "red");
                    dom.file.value = ''; // Reset input
                    return;
                }

                if (state.files.length + newFiles.length > 2) return UI_Notif("Maksimal 2 file!", "red");
                if ([...state.files, ...newFiles].reduce((acc, f) => acc + f.size, 0) > 5242880) return UI_Notif("Total file melebihi 5MB!", "red");
                state.files.push(...newFiles);
                renderFiles()

                dom.file.value = '';
            });

            dom.find.addEventListener("keyup", (e) => {
                if (e.target.value == "") return renderSearch([])
                let src = []
                const value = e.target.value.toUpperCase()

                window.ITEMS.forEach(item => {
                    if (parseInt(item.stock <= 0)) return
                    // console.log(item)
                    const code  = item.code.toUpperCase()
                    const name  = item.name.toUpperCase()
                    if (code.indexOf(value) >= 0 || name.indexOf(value) >= 0) src.push({name : item.name, code : item.code, stock : item.stock, link : item.link})
                })

                renderSearch(src)
            })

            document.getElementById('masuk-file-list-icon').addEventListener('click', function() {
                const container = document.getElementById('file-list-display');
                container.classList.toggle('dis-none');
            });

            render(); // Initial render state kosong
        },

        // 5. Validasi Tahan Banting & Ambil Payload
        getData: async () => {
            const errs = [];
            
            // Validasi Header (Otomatis toggle class 'br-red')
            [
                { val: dom.sumber.value, ref: dom.sumber, msg: "Sumber" },
                { val: dom.penerima.value, ref: dom.penerima, msg: "Penerima" },
                { val: dom.tgl.value, ref: dom.tgl, msg: "Tanggal" }
            ].forEach(({ val, ref, msg }) => {
                ref.classList.toggle('br-red', !val);
                if (!val) errs.push(`${msg} wajib diisi!`);
            });

            // Validasi Items & Qty
            if (!state.items.size) errs.push("Daftar barang masih kosong!");
            state.items.forEach((val, kode) => {
                const isInvalid = !val.qty || val.qty <= 0;
                const inputEl = dom.list.querySelector(`[data-kode="${kode}"] .masuk-qty`);
                
                if (inputEl) inputEl.classList.toggle('br-red', isInvalid);
                if (isInvalid) errs.push(`Jumlah barang "${val.nama}" belum diisi/valid!`);
            });

            // Stop jika ada error
            if (errs.length) {
                UI_Notif("⚠️ PERBAIKI DATA BERIKUT:\n\n- " + errs.join("\n- "), "red");
                return null;
            }

            // Kembalikan Object Bersih Siap Kirim
            const fixFiles  = await prepareFilesForUpload()
            return {
                header: { 
                    event: dom.sumber.value, 
                    keterangan: dom.ket.value, 
                    staff: dom.penerima.value, 
                    tanggal: new Date(dom.tgl.value)
                },
                items: Array.from(state.items.entries()).map(([kode, data]) => ({ kode, ...data })),
                files: fixFiles
            };
        },

        // 6. Fungsi Reset Total
        reset: () => {
            // A. Reset State
            state.items.clear();
            state.files = [];

            // B. Reset Semua Input di DOM
            const inputs = [dom.sumber, dom.ket, dom.penerima, dom.tgl, dom.file, dom.find];
            inputs.forEach(input => {
                if (input) {
                    input.value = '';
                    input.classList.remove('br-red'); // Hapus class error jika ada
                }
            });

            // C. Reset Tampilan Pencarian
            renderSearch([]);

            // D. Reset Tampilan List Barang
            render();

            // E. Reset Tampilan Status File & List Icon
            const statusIcon = document.querySelector('.masuk-icon i.fa-check, .masuk-icon i.fa-file');
            if (statusIcon) {
                statusIcon.className = 'fas fa-file clr-green';
                // Reset teks tombol "Pilih File"
                statusIcon.parentElement.parentElement.lastChild.textContent = ' Pilih File';
            }

            // Sembunyikan List File Detail
            const listIconBtn = document.getElementById('masuk-file-list-icon');
            const container = document.getElementById('file-list-display');
            if (listIconBtn) listIconBtn.classList.add('dis-none');
            if (container) {
                container.innerHTML = '';
                container.classList.add('dis-none');
            }

            console.log("[Form Masuk] Berhasil di-reset.");
        }
    };
})();

const FormKeluar = (() => {
    // 1. State Management
    const state = { items: new Map(), files: [] };

    // 2. DOM Selector Cache
    const el = (id) => document.getElementById(id);
    const dom = {
        list    : el('items-form-keluar-list'),
        search  : el('keluar-items-search'), // Body table hasil pencarian
        tujuan  : el('keluar-tujuan-value'), // Hidden input atau select
        ket     : el('keterangan-keluar'),
        penerima: el('penerima-keluar'), // Nama pengambil
        tgl     : el('tanggal-keluar'),
        file    : el('file-input-keluar'),
        find    : el('keluar-search-input')
    };

    // Helper: File to Base64 (Asumsi sama dengan FormMasuk)
    async function prepareFilesForUpload() {
        const preparedFiles = [];
        for (const file of state.files) {
            if (file.type.startsWith('image/')) {
                const compressed = await compressImage(file);
                preparedFiles.push(compressed);
            } else {
                const base64Data = await fileToBase64(file);
                preparedFiles.push({
                    base64: base64Data,
                    type: file.type,
                    name: file.name
                });
            }
        }
        return preparedFiles;
    }

    // 3. Render UI Items
    const render = () => {
        dom.list.innerHTML = state.items.size ? '' : '<div class="p-20 clr-grey grid-center">Belum ada barang dipilih</div>';
        state.items.forEach((val, kode) => {
            dom.list.insertAdjacentHTML('beforeend', `
                <div class="form-items-group flex-beetwen w-100 gap-10" data-kode="${kode}">
                    <i class="fas fa-trash p-7 borad-5 red pointer fz-14 btn-del"></i> |
                    <div class="form-items-left flex-start items-start flex-column w-100">
                        <span class="fz-10 clr-grey">${kode} | Sisa Stok: <b>${val.stok}</b></span>
                        <span class="fz-18">${val.nama}</span>
                    </div>
                    <div class="flex-beetwen gap-10">
                        <div class="form-icons-group p-5 borad-5">
                            <span>Jumlah : </span>
                            <input type="number" min="1" max="${val.stok}" value="${val.qty}" class="keluar-qty">
                        </div>
                    </div>
                </div>`);
        });
    };

    // 4. Render Search Results
    const renderSearch = (list) => {
        dom.search.innerHTML = list.map(item => `
            <tr>
                <td><i class="fas fa-plus-circle clr-green pointer" data-stok="${item.stock}"></i></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td><span class="badge ${item.stock > 0 ? 'bg-blue' : 'bg-red'}">${item.stock}</span></td>
            </tr>
        `).join("");
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    function renderFiles() {
        const container = el('file-list-display-keluar');
        const statusIcon = document.querySelector('.keluar-icon i.fa-file, .keluar-icon i.fa-check');
        const listIconBtn = el('keluar-file-list-icon');

        const fileCount = state.files.length;
        const totalSize = state.files.reduce((acc, f) => acc + f.size, 0);

        if (fileCount > 0) {
            statusIcon.classList.replace('fa-file', 'fa-check');
            statusIcon.parentElement.parentElement.lastChild.textContent = ` ${fileCount} File (${formatSize(totalSize)})`;
            listIconBtn.classList.remove('dis-none');
        } else {
            statusIcon.classList.replace('fa-check', 'fa-file');
            statusIcon.parentElement.parentElement.lastChild.textContent = ' Pilih File';
            listIconBtn.classList.add('dis-none');
            container.classList.add('dis-none');
        }

        container.innerHTML = '';
        state.files.forEach((file, index) => {
            let iconClass = file.type === 'application/pdf' ? 'fa-file-pdf' : 'fa-image';
            const fileSpan = document.createElement('span');
            fileSpan.className = 'borad-5 p-5-10 flex-start gap-10';
            fileSpan.innerHTML = `
                <i class="fas ${iconClass} clr-blue fz-16"></i>
                <span class="clr-dark fz-12">${file.name}</span>
                <i class="fas fa-times-circle clr-red pointer" onclick="removeFileOut(${index})"></i>
            `;
            container.appendChild(fileSpan);
        });
    }

    return {
        init: () => {
            // A. Tambah Barang (Cek Stok Sebelum Add)
            dom.search.addEventListener('click', e => {
                const btn = e.target.closest('.fa-plus-circle');
                if (!btn) return;

                const cells = btn.closest('tr').cells;
                const [kode, nama] = [cells[1].innerText, cells[2].innerText];
                const stokTersedia = parseInt(btn.dataset.stok);

                if (stokTersedia <= 0) return UI_Notif(`Stok "${nama}" habis!`, "red");

                const currentQty = state.items.get(kode)?.qty || 0;
                if (currentQty + 1 > stokTersedia) return UI_Notif("Melebihi stok yang tersedia!", "red");

                state.items.set(kode, { 
                    nama, 
                    stok: stokTersedia, 
                    qty: currentQty + 1 
                });
                render();
            });

            // B. Hapus & Update Qty (Delegation)
            dom.list.addEventListener('click', e => {
                if (e.target.classList.contains('btn-del')) {
                    state.items.delete(e.target.closest('[data-kode]').dataset.kode);
                    render();
                }
            });

            dom.list.addEventListener('input', e => {
                if (e.target.classList.contains('keluar-qty')) {
                    const kode = e.target.closest('[data-kode]').dataset.kode;
                    const item = state.items.get(kode);
                    let val = parseInt(e.target.value) || 0;

                    if (val > item.stok) {
                        UI_Notif(`Stok hanya tersedia ${item.stok}`, "red");
                        val = item.stok;
                        e.target.value = val;
                    }
                    item.qty = val;
                }
            });

            // C. Pencarian Barang (Filter Stok > 0)
            dom.find.addEventListener("keyup", e => {
                const val = e.target.value.toUpperCase();
                if (!val) return renderSearch([]);

                const src = window.STOCKS.filter(item => {
                    const matches = item.code.toUpperCase().includes(val) || item.name.toUpperCase().includes(val);
                    return matches && item.stock > 0; // Hanya tampilkan yang ada stoknya
                });
                renderSearch(src);
            });

            // Saat Hapus File
            window.removeFileOut = (index) => {
                state.files.splice(index, 1);
                renderFiles(); // Update semua indikator
            };
            // D. File Handling
            dom.file.addEventListener('change', e => {
                const newFiles = Array.from(e.target.files);

                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                const invalidFile = newFiles.find(f => !allowedTypes.includes(f.type));

                if (invalidFile) {
                    UI_Notif(`File "${invalidFile.name}" tidak diizinkan! Hanya boleh Gambar (JPG/PNG/WebP) atau PDF.`, "red");
                    dom.file.value = ''; // Reset input
                    return;
                }

                if (state.files.length + newFiles.length > 2) return UI_Notif("Maksimal 2 file!", "red");
                if ([...state.files, ...newFiles].reduce((acc, f) => acc + f.size, 0) > 5242880) return UI_Notif("Total file melebihi 5MB!", "red");
                state.files.push(...newFiles);
                renderFiles()
                dom.file.value = '';
            });

            el('keluar-file-list-icon').addEventListener('click', () => {
                el('file-list-display-keluar').classList.toggle('dis-none');
            });

            render();
        },

        removeFile: (index) => {
            state.files.splice(index, 1);
            renderFiles();
        },

        getData: async () => {
            const errs = [];
            // Validasi Header
            [{ val: dom.tujuan.value, ref: dom.tujuan, msg: "Tujuan" },
             { val: dom.penerima.value, ref: dom.penerima, msg: "Penerima/Pengambil" },
             { val: dom.tgl.value, ref: dom.tgl, msg: "Tanggal" }
            ].forEach(({ val, ref, msg }) => {
                ref.classList.toggle('br-red', !val);
                if (!val) errs.push(`${msg} wajib diisi!`);
            });

            if (!state.items.size) errs.push("Daftar barang keluar masih kosong!");
            
            state.items.forEach((val, kode) => {
                if (val.qty <= 0) errs.push(`Jumlah barang "${val.nama}" tidak valid!`);
            });

            if (errs.length) {
                UI_Notif("⚠️ PERBAIKI DATA:\n- " + errs.join("\n- "), "red");
                return null;
            }

            return {
                header: {
                    event: dom.tujuan.value,
                    keterangan: dom.ket.value,
                    staff: dom.penerima.value,
                    tanggal: dom.tgl.value
                },
                items: Array.from(state.items.entries()).map(([kode, d]) => ({ kode, ...d })),
                files: await prepareFilesForUpload()
            };
        },

        reset: () => {
            state.items.clear();
            state.files = [];
            [dom.ket, dom.penerima, dom.tgl, dom.file, dom.find].forEach(i => i && (i.value = ''));
            renderSearch([]);
            render();
            renderFiles();
        }
    };
})();

const FormTambah = (() => {
    // 1. State Management (Identik dengan gaya FormKeluar)
    const state = { files: [] };

    // 2. DOM Selector Cache
    const el = (id) => document.getElementById(id);
    const dom = {
        container : el('form-tambah'),
        preview   : el('preview-img'),
        imgBox    : el('tambah-img-box'),
        fileInput : el('file-input-add'),
        fileList  : el('file-list-display-tambah'),
        listIcon  : el('add-file-list-icon'),
        
        // Input Fields
        code      : el('item-code-add'),
        name      : el('item-name-add'),
        type      : el('tambah-item-value'), // Hidden input dari selector
        note      : el('item-note-add'),
        status    : el("tambah-status-value")
    };

    // Helper: File Handling (Format Size & Base64)
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    async function prepareFilesForUpload() {
        const preparedFiles = [];
        for (const file of state.files) {
            // Gunakan utilitas yang sama dengan FormKeluar (compressImage/fileToBase64)
            if (file.type.startsWith('image/')) {
                const compressed = await compressImage(file);
                preparedFiles.push(compressed);
            } else {
                const base64Data = await fileToBase64(file);
                preparedFiles.push({
                    base64: base64Data,
                    type: file.type,
                    name: file.name
                });
            }
        }
        return preparedFiles;
    }

    // Handle Main Preview (File pertama jika gambar)
        
    

    function renderFiles() {
        const container = el('file-list-display-keluar');
        const statusIcon = document.querySelector('.tambah-icon i.fa-file, .tambah-icon i.fa-check');
        const listIconBtn = el('add-file-list-icon');
        const iconDefault = el("add-img-icon")

        const fileCount = state.files.length;
        const totalSize = state.files.reduce((acc, f) => acc + f.size, 0);

        if (fileCount > 0) {
            statusIcon.classList.replace('fa-file', 'fa-check');
            statusIcon.parentElement.parentElement.lastChild.textContent = ` ${fileCount} File (${formatSize(totalSize)})`;
            listIconBtn.classList.remove('dis-none');
        } else {
            statusIcon.classList.replace('fa-check', 'fa-file');
            statusIcon.parentElement.parentElement.lastChild.textContent = ' Pilih File';
            listIconBtn.classList.add('dis-none');
            container.classList.add('dis-none');
        }

        if (fileCount > 0 && state.files[0].type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dom.preview.src = e.target.result;
                dom.preview.classList.remove('dis-none');
                iconDefault.classList.add('dis-none');
            };
            reader.readAsDataURL(state.files[0]);
        } else {
            dom.preview.src = '';
            dom.preview.classList.add('dis-none');
            if (iconDefault) iconDefault.classList.remove('dis-none');
        }

        container.innerHTML = '';
        state.files.forEach((file, index) => {
            let iconClass = file.type === 'application/pdf' ? 'fa-file-pdf' : 'fa-image';
            const fileSpan = document.createElement('span');
            fileSpan.className = 'borad-5 p-5-10 flex-start gap-10';
            fileSpan.innerHTML = `
                <i class="fas ${iconClass} clr-orange fz-16"></i>
                <span class="clr-dark fz-12">${file.name}</span>
                <i class="fas fa-times-circle clr-red pointer" onclick="removeFileOut(${index})"></i>
            `;
            container.appendChild(fileSpan);
        });
    }

    /**
     * UNIVERSAL FETCH & PREVIEW
     * Mengambil file dari Google Drive URL dan menampilkannya di Preview Box.
     * * @param {string} driveUrl - URL sharing Google Drive
     * @param {string} previewImgId - ID elemen <img> untuk preview
     * @param {string} iconId - ID elemen ikon placeholder (opsional)
     */
    async function fetchAndPreviewDriveFile(driveUrl, previewImgId, iconId = null) {
        const previewImg = document.getElementById(previewImgId);
        const iconPlaceholder = iconId ? document.getElementById(iconId) : null;

        if (!previewImg) return console.error("❌ Elemen preview img tidak ditemukan.");

        // 1. Validasi & Ekstrak ID File Drive
        const fileIdMatch = driveUrl.match(/[-\w]{25,}/);
        if (!fileIdMatch) {
            UI_Notif("⚠️ URL Google Drive tidak valid!", "red");
            return;
        }
        const fileId = fileIdMatch[0];

        // 2. Buat Direct View Link (No CORS issue untuk <img> tag)
        const directViewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        // 3. UI Feedback: Tampilkan Loading (Opsional, pakai icon spin)
        if (iconPlaceholder) {
            iconPlaceholder.className = "fas fa-spinner fa-spin fz-60 clr-orange"; // Ubah jadi loading
            iconPlaceholder.style.display = 'block';
        }
        previewImg.classList.add('dis-none');

        // 4. Proses Preview (Gunakan tag <img> langsung)
        return new Promise((resolve, reject) => {
            // Set src ke directViewUrl
            previewImg.src = directViewUrl;

            // Listener jika gambar sukses dimuat
            previewImg.onload = () => {
                previewImg.classList.remove('dis-none');
                if (iconPlaceholder) iconPlaceholder.style.display = 'none';
                // Kembalikan directViewUrl jika sukses (buat disimpan ke state)
                resolve(directViewUrl); 
            };

            // Listener jika gambar gagal dimuat (CORS, 404, file bukan gambar, dll)
            previewImg.onerror = () => {
                previewImg.classList.add('dis-none');
                if (iconPlaceholder) {
                    // Kembalikan ke ikon default
                    iconPlaceholder.className = "fas fa-image fz-60 clr-orange"; 
                    iconPlaceholder.style.display = 'block';
                }
                UI_Notif("❌ Gagal memuat gambar Drive. Pastikan file publik & berupa gambar.", "red");
                reject(new Error("Gagal memuat gambar dari Drive."));
            };
        });
    }

    return {
        init: () => {
            // A. File Input Handling
            dom.fileInput.addEventListener('change', e => {
                const newFiles = Array.from(e.target.files);

                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                const invalidFile = newFiles.find(f => !allowedTypes.includes(f.type));

                if (invalidFile) {
                    UI_Notif(`File "${invalidFile.name}" tidak diizinkan! Hanya boleh Gambar (JPG/PNG/WebP) atau PDF.`, "red");
                    dom.file.value = ''; // Reset input
                    return;
                }

                if (state.files.length + newFiles.length > 1) return UI_Notif("Maksimal 1 file!", "red");
                if ([...state.files, ...newFiles].reduce((acc, f) => acc + f.size, 0) > 5242880) return UI_Notif("Total file melebihi 5MB!", "red");
                state.files.push(...newFiles);
                renderFiles()

                dom.fileInput.value = '';
            })

            // B. Toggle List Display
            dom.listIcon.addEventListener('click', () => {
                dom.fileList.classList.toggle('dis-none');
            });

            // Saat Hapus File
            window.removeFileAdd = (index) => {
                state.files.splice(index, 1);
                renderFiles(); // Update semua indikator
            };

            dom.code.addEventListener("keyup", () => {
                const value = dom.kode.value.trim().toUpperCase()
                const find = window.ITEMS.find(data => data.code.toUpperCase() == value)
                if (find) {
                    fetchAndPreviewDriveFile(find.link, "preview-img")
                    dom.name.value = find.name
                    dom.note.value = find.note
                }
            })

            console.log("FormTambah Module Initialized 🚀");
        },

        getData: async () => {
            const errs = [];
            
            // Validasi Field
            if (!dom.code.value.trim()) errs.push("Kode Barang wajib diisi!");
            if (!dom.name.value.trim()) errs.push("Nama Barang wajib diisi!");
            if (!dom.type.value) errs.push("Tipe wajib dipilih!");
            if (!dom.status.value) errs.push("Status wajib dipilih!");
            
            // Highlight error
            [dom.code, dom.name].forEach(el => el.classList.toggle('br-red', !el.value.trim()));

            if (errs.length) {
                UI_Notif("⚠️ LENGKAPI DATA:\n- " + errs.join("\n- "), "red");
                return null;
            }

            return {
                header: {
                    kode: dom.code.value.trim(),
                    nama: dom.name.value.trim(),
                    tipe: dom.type.value,
                    keterangan: dom.note.value.trim(),
                    timestamp: new Date().toISOString(),
                    status: dom.status.value.trim()
                },
                files: await prepareFilesForUpload()
            };
        },

        reset: () => {
            state.files = [];
            [dom.code, dom.name, dom.type, dom.note].forEach(i => i && (i.value = ''));
            
            // Reset Custom Selector UI
            const trigger = dom.container.querySelector('.select-trigger span');
            if (trigger) {
                trigger.innerText = "Pilih tujuan :";
                trigger.classList.add('clr-grey', 'italic');
            }

            renderFiles();
        }
    };
})();

// Initialize
const FormEdit = (() => {
    // 1. State & Helper
    const state = { file: null, originalFileUrl: null }; // Simpan URL gambar asli jika tidak diubah
    const q = (sel, ctx = document) => ctx.querySelector(sel);
    const qa = (sel, ctx = document) => ctx.querySelectorAll(sel);
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    // Helper: UI Rendering untuk Preview Gambar
    const updatePreview = (src) => {
        const img = q('#edit-preview-img');
        const icon = q('#edit-icon-img');
        if (src) {
            img.src = src;
            img.classList.remove('dis-none');
            if (icon) icon.style.display = 'none';
        } else {
            img.src = '';
            img.classList.add('dis-none');
            if (icon) icon.style.display = 'block';
        }
    };

    return {
        init: () => {
            const container = q('#form-edit');
            if (!container) return console.warn('Form Edit tidak ditemukan di DOM');

            

            // 3. Handle File Input (Strict Validation)
            q('#edit-file-input', container).addEventListener('change', (e) => {
                const file = e.target.files[0];
                const labelText = q('#edit-file-name-text', container);

                // Reset jika batal pilih (kembali ke gambar asli jika ada)
                if (!file) {
                    state.file = null;
                    if (labelText) labelText.innerText = "Pilih File Baru";
                    return updatePreview(state.originalFileUrl);
                }

                // Validasi Tipe MIME (Hanya Gambar)
                if (!file.type.startsWith('image/')) {
                    e.target.value = ''; 
                    return alert('🚫 File ditolak: Hanya format gambar!');
                }

                // Validasi Ukuran (Max 5MB)
                if (file.size > MAX_SIZE) {
                    e.target.value = '';
                    return alert('⚠️ Ukuran gambar terlalu besar! (Maksimal 5MB)');
                }

                // Sukses: Simpan state & Render Preview File Baru
                state.file = file;
                if (labelText) labelText.innerText = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
                
                const reader = new FileReader();
                reader.onload = (ev) => updatePreview(ev.target.result);
                reader.readAsDataURL(file);
            });

            // Tambahkan ini di dalam FormEdit.init() atau setelahnya
            const handleSearchKode = async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Mencegah form submit tidak sengaja
                    const kodeCari = e.target.value.trim();

                    if (!kodeCari) return alert("Silahkan masukkan Kode Barang terlebih dahulu.");

                    try {
                        // Ambil semua data dari database
                        const allItems = await window.DB.getAll("items");
                        
                        // Cari item yang kodenya cocok
                        const itemFound = allItems.find(item => item.kode === kodeCari);

                        if (itemFound) {
                            // Gunakan fungsi setInitialData untuk mengisi semua field
                            // Pastikan struktur itemFound sesuai (kode, nama, sumber, status, dll)
                            FormEdit.setInitialData({
                                kode: itemFound.kode,
                                nama: itemFound.nama,
                                sumber: itemFound.sumber,
                                status: itemFound.status,
                                pengambil: itemFound.pengambil || "",
                                tanggal: itemFound.tanggal || "",
                                fotoUrl: itemFound.foto_url // Link Google Drive dari database
                            });
                            
                            console.log("Data ditemukan dan dimuat.");
                        } else {
                            alert(`🚫 Kode "${kodeCari}" tidak ditemukan di database.`);
                            FormEdit.reset(); // Opsional: bersihkan form jika tidak ketemu
                        }
                    } catch (err) {
                        console.error("Gagal mengambil data:", err);
                        alert("Terjadi kesalahan saat mengakses database.");
                    }
                }
            };

            // Hubungkan ke elemen input kode di HTML
            document.querySelector('#edit-kode').addEventListener('keypress', handleSearchKode);
        },

        // Fitur Tambahan Khusus Edit: Memasukkan data awal sebelum diedit
        setInitialData: (data) => {
            const container = q('#form-edit');
            if (!container) return;

            // Isi field teks
            q('#edit-kode', container).value = data.kode || '';
            q('#edit-nama', container).value = data.nama || '';
            q('#edit-pengambil', container).value = data.pengambil || '';
            q('#edit-tanggal', container).value = data.tanggal || '';

            // Set Dropdown Sumber
            if (data.sumber) {
                q('#edit-sumber-value', container).value = data.sumber;
                const text = q(`.option[data-value="${data.sumber}"]`, container)?.innerText || data.sumber;
                const trigger = q('#edit-sumber-text', container);
                trigger.innerText = text;
                trigger.classList.remove('clr-grey', 'italic');
            }

            // Set Dropdown Status
            if (data.status) {
                q('#edit-status-value', container).value = data.status;
                const text = q(`.option[data-value="${data.status}"]`, container)?.innerText || data.status;
                const trigger = q('#edit-status-text', container);
                trigger.innerText = text;
                trigger.classList.remove('clr-grey', 'italic');
            }

            if (data.fotoUrl) {
                let driveUrl = data.fotoUrl;

                // Trik konversi link Drive agar bisa jadi Source Image
                // Mengubah '/file/d/ID/view' menjadi '/thumbnail?id=ID&sz=w500'
                if (driveUrl.includes('drive.google.com')) {
                    const fileId = driveUrl.match(/[-\w]{25,}/);
                    if (fileId) {
                        driveUrl = `https://lh3.googleusercontent.com/d/${fileId}=s500`;
                    }
                }

                state.originalFileUrl = driveUrl;
                updatePreview(driveUrl);
            }
        },

        // 4. Payload Output & Final Validation
        getData: () => {
            const container = q('#form-edit');
            if (!container) return null;

            const req = [
                { id: '#edit-kode', name: 'Kode Barang' },
                { id: '#edit-nama', name: 'Nama Barang' },
                { id: '#edit-sumber-value', name: 'Sumber Barang' },
                { id: '#edit-status-value', name: 'Status Barang' }
            ];

            const errs = req.reduce((acc, r) => {
                const val = q(r.id, container)?.value.trim();
                return !val ? [...acc, `${r.name} wajib diisi!`] : acc;
            }, []);

            if (errs.length) {
                alert("⚠️ GAGAL UPDATE:\n- " + errs.join("\n- "));
                return null;
            }

            return {
                kode: q('#edit-kode', container).value.trim(),
                nama: q('#edit-nama', container).value.trim(),
                sumber: q('#edit-sumber-value', container).value.trim(),
                status: q('#edit-status-value', container).value.trim(),
                pengambil: q('#edit-pengambil', container).value.trim(),
                tanggal: q('#edit-tanggal', container).value,
                fileBaru: state.file, // Akan berisi file object jika diupdate, atau null jika tidak diubah
                fotoLama: state.file ? null : state.originalFileUrl // Indikator ke backend apakah foto berubah
            };
        },

        // 5. Reset Form
        reset: () => {
            const container = q('#form-edit');
            if (!container) return;

            qa('.form-input', container).forEach(input => input.value = '');
            qa('input[type="hidden"]', container).forEach(input => input.value = '');
            q('#edit-file-input', container).value = '';

            qa('.select-trigger span', container).forEach(span => {
                span.innerText = span.id.includes('sumber') ? 'Pilih Sumber :' : 'Pilih Status :';
                span.classList.add('clr-grey', 'italic');
            });

            const labelText = q('#edit-file-name-text', container);
            if (labelText) labelText.innerText = "Pilih File Baru";

            state.file = null;
            state.originalFileUrl = null;
            updatePreview(null);
        }
    };
})();