


export default class trx {
    constructor () {
        this.detailSearch  = document.querySelector("input#search-input")
        this.makuValue     = document.querySelector("input#maku-value")
        this.typeValue     = document.querySelector("input#type-value")
    }
    monthControl () {
        const monthCtrl     = document.querySelector("#month-control")
        const headSelect    = document.querySelector("#cal-head-select")
        const selectClose   = document.querySelector("#cal-select-close")
        
        monthCtrl.addEventListener("click", () => headSelect.classList.remove("dis-none"))
        selectClose.addEventListener("click", () => headSelect.classList.add("dis-none"))

    }

    makuChange () {
        let dataBar     = document.querySelectorAll(".data-bar")
        let fronts      = document.querySelectorAll(".front") 

        this.makuValue.addEventListener("change", (e) => {
            const value = e.target.value
            dataBar = document.querySelectorAll(".data-bar")
            fronts  = document.querySelectorAll(".front")

            dataBar.forEach (bar => {
                if (value == "semua") bar.classList.remove("dis-none")
                else if (value == "masuk" && bar.classList.contains("green")) bar.classList.remove("dis-none")
                else if (value == "keluar" && bar.classList.contains("blue")) bar.classList.remove("dis-none")
                else bar.classList.add("dis-none")
            })
            fronts.forEach(front => {
                if (value == "semua") front.closest(".cal-trx-group").classList.remove("dis-none")
                else if (value == "masuk" && front.classList.contains("green")) front.closest(".cal-trx-group").classList.remove("dis-none")
                else if (value == "keluar" && front.classList.contains("blue")) front.closest(".cal-trx-group").classList.remove("dis-none")
                else front.closest(".cal-trx-group").classList.remove("dis-none")
            })
        })
    }
    typeChange () {
        const trxList   = document.querySelector("#cal-trx-list")
        const itemList  = document.querySelector("#cal-items-list")
        this.typeValue.addEventListener("change", (e) => {
            const value = e.target.value
            if (value == "transaksi") {
                itemList.classList.add("dis-none")
                trxList.classList.remove("dis-none")
            }
            else if (value == "barang") {
                itemList.classList.remove("dis-none")
                trxList.classList.add("dis-none")
            }
            else return
        })
    }

    CustomSelect(selector = '.custom-select-container', callback = null) {
        const allSelects = document.querySelectorAll(selector);
        if (allSelects.length === 0) return;

        const closeAllSelects = (exceptThisOne = null) => {
        allSelects.forEach(select => {
            if (select !== exceptThisOne) select.classList.remove('open');
        });
        };

        allSelects.forEach(container => {
            // Mencari elemen pendukung di dalam container ini
            const trigger = container.querySelector('.select-trigger');
            const triggerSpan = trigger?.querySelector('span');
            const options = container.querySelectorAll('.option');
            const hiddenInput = container.querySelector('.select-input');
            
            // MENCARI PARENT: Mencari container .select-custom terdekat dari elemen ini
            const parentWrapper = container.closest('.select-custom');

            // --- FUNGSI UPDATE CLR (Hanya untuk parent terkait) ---
            const updateParentColor = (newClrClass) => {
                if (!parentWrapper || !newClrClass) return;
                // Tambahkan class warna yang baru
                parentWrapper.dataset.bg = newClrClass;
            };

            // --- FUNGSI UPDATE UI ---
            const updateSelection = (option) => {
                if (!option) return;

                const val = option.getAttribute('data-value') || '';
                const text = option.innerHTML;
                const clrClass = option.getAttribute('data-clr');

                // 1. Update Span & Simpan data-value asli
                if (triggerSpan) {
                    triggerSpan.innerHTML = text;
                    triggerSpan.setAttribute('data-value', val);
                }

                // 2. Update Hidden Input (untuk form submit)
                if (hiddenInput) {
                    hiddenInput.value = val;
                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // 3. Update Visual Active State pada Opsi
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // 4. Update Warna pada container utama (.select-custom)
                updateParentColor(clrClass);
            };

            // --- INISIALISASI ---
            if (!trigger) return;

            // Set Default Value jika ada
            const defaultValue = container.getAttribute('data-default') || hiddenInput?.value;
            if (defaultValue) {
                const defaultOpt = Array.from(options).find(opt => opt.getAttribute('data-value') === defaultValue);
                if (defaultOpt) updateSelection(defaultOpt);
            }

            // --- EVENT LISTENERS ---
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllSelects(container);
                container.classList.toggle('open');
            });

            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateSelection(option);
                    container.classList.remove('open');
                });
            });
        });

        // Klik di luar area select mana pun akan menutup semua dropdown
        document.addEventListener('click', () => closeAllSelects());
    }

    CustomMore(selector = ".more-box", callback = null) {
        const allMore = document.querySelectorAll(selector);
        if (allMore.length === 0) return;

        const closeAll = (exceptThisOne = null) => {
            allMore.forEach(more => {
                const list = more.querySelector(".more-list");
                if (list && list !== exceptThisOne) {
                    list.classList.add('dis-none');
                }
            });
        };

        allMore.forEach(more => {
            const icon = more.querySelector(".more-icon");
            const list = more.querySelector(".more-list");
            const spans = list.querySelectorAll("span");

            // Toggle Menu
            icon.addEventListener("click", (e) => {
                e.stopPropagation(); // Mencegah bubble ke document
                const isHidden = list.classList.contains("dis-none");
                closeAll(); // Tutup semua yang lain dulu
                
                if (isHidden) {
                    list.classList.remove("dis-none");
                }
            });

            // Handle Klik Item
            spans.forEach(span => {
                span.addEventListener("click", () => {
                    if (span.classList.contains("grey")) return;

                    // UI Update
                    spans.forEach(sp => sp.classList.remove("grey"));
                    span.classList.add("grey");
                    
                    // Close List
                    list.classList.add("dis-none");

                    // EXECUTE CALLBACK: Kirim value dan elemennya
                    if (typeof callback === "function") {
                        callback(span.textContent.trim(), span, more);
                    }
                });
            });
        });

        // Menutup menu jika klik di luar area menu mana pun
        document.addEventListener('click', () => closeAll());
    }

    getData () {
        const dataDummy = [
            { id: 1, code: "XY900101FN", item: "Parang Panjang", spek: "70 Cm - Stainless Steel", masuk: 12, keluar: 2, note: "Stok Aman" },
            { id: 2, code: "XY900102FN", item: "Cangkul Baja", spek: "Gagang Kayu Jati", masuk: 25, keluar: 5, note: "Barang Baru" },
            { id: 3, code: "XY900103FN", item: "Sabit Rumput", spek: "Baja Karbon", masuk: 15, keluar: 10, note: "Checkmark" },
            { id: 4, code: "XY900104FN", item: "Sekop Pasir", spek: "Ujung Lancip", masuk: 8, keluar: 0, note: "High Quality" },
            { id: 5, code: "XY900105FN", item: "Gunting Pagar", spek: "Handle Karet", masuk: 20, keluar: 3, note: "" },
            { id: 6, code: "XY900106FN", item: "Linggis 1m", spek: "Baja Solid", masuk: 5, keluar: 1, note: "Berat" },
            { id: 7, code: "XY900107FN", item: "Martil Besar", spek: "5 Kg - Besi", masuk: 10, keluar: 2, note: "Checkmark" },
            { id: 8, code: "XY900108FN", item: "Gergaji Kayu", spek: "Mata Gergaji Tajam", masuk: 30, keluar: 12, note: "Fast Moving" },
            { id: 9, code: "XY900109FN", item: "Kapak Pembelah", spek: "Baja Tempa", masuk: 7, keluar: 2, note: "" },
            { id: 10, code: "XY900110FN", item: "Meteran 5m", spek: "Plastik ABS", masuk: 50, keluar: 20, note: "Laris Manis" },
            { id: 11, code: "XY900111FN", item: "Obeng Set", spek: "Magnetic 6 pcs", masuk: 40, keluar: 15, note: "Checkmark" },
            { id: 12, code: "XY900112FN", item: "Tang Kombinasi", spek: "Isolasi 1000V", masuk: 18, keluar: 4, note: "" },
            { id: 13, code: "XY900113FN", item: "Kunci Inggris", spek: "12 Inch Chrome", masuk: 12, keluar: 3, note: "Promo" },
            { id: 14, code: "XY900114FN", item: "Bor Tangan", spek: "Listrik 500W", masuk: 6, keluar: 1, note: "Garansi 1 Thn" },
            { id: 15, code: "XY900115FN", item: "Gerinda Tangan", spek: "4 Inch Standard", masuk: 9, keluar: 2, note: "Checkmark" },
            { id: 16, code: "XY900116FN", item: "Palu Kambing", spek: "Gagang Fiber", masuk: 22, keluar: 8, note: "" },
            { id: 17, code: "XY900117FN", item: "Waterpass", spek: "Aluminium 60cm", masuk: 14, keluar: 2, note: "" },
            { id: 18, code: "XY900118FN", item: "Kuas Cat", spek: "3 Inch Nylon", masuk: 100, keluar: 45, note: "Checkmark" },
            { id: 19, code: "XY900119FN", item: "Rol Cat", spek: "Bulu Halus", masuk: 60, keluar: 20, note: "" },
            { id: 20, code: "XY900120FN", item: "Tang Potong", spek: "Mini 5 Inch", masuk: 25, keluar: 6, note: "Presisi" },
            { id: 21, code: "XY900121FN", item: "Semen Portland", spek: "Sak 40 Kg", masuk: 200, keluar: 150, note: "Checkmark" },
            { id: 22, code: "XY900122FN", item: "Pipa PVC", spek: "3/4 Inch AW", masuk: 80, keluar: 30, note: "Tebal" },
            { id: 23, code: "XY900123FN", item: "Kran Air", spek: "Besi Chrome", masuk: 45, keluar: 10, note: "" },
            { id: 24, code: "XY900124FN", item: "Kawat Las", spek: "RB26 2.6mm", masuk: 30, keluar: 5, note: "Checkmark" },
            { id: 25, code: "XY900125FN", item: "Selang Air", spek: "1/2 Inch 20m", masuk: 15, keluar: 4, note: "Anti Tekuk" },
            { id: 26, code: "XY900126FN", item: "Pompa Air", spek: "125 Watt Jet", masuk: 4, keluar: 1, note: "Heavy Duty" },
            { id: 27, code: "XY900127FN", item: "Tangga Lipat", spek: "Aluminium 2m", masuk: 3, keluar: 1, note: "Checkmark" },
            { id: 28, code: "XY900128FN", item: "Gembok Pagar", spek: "60mm Kuningan", masuk: 24, keluar: 9, note: "Anti Karat" },
            { id: 29, code: "XY900129FN", item: "Baut Mur", spek: "12mm Set", masuk: 500, keluar: 200, note: "" },
            { id: 30, code: "XY900130FN", item: "Engsel Pintu", spek: "4 Inch Stainless", masuk: 48, keluar: 12, note: "Checkmark" },
            { id: 31, code: "XY900131FN", item: "Cat Kayu", spek: "1 Kg - Hitam", masuk: 36, keluar: 14, note: "" },
            { id: 32, code: "XY900132FN", item: "Tinner", spek: "Literan - Super", masuk: 20, keluar: 8, note: "Cairan Mudah Terbakar" },
            { id: 33, code: "XY900133FN", item: "Amplas", spek: "No. 100 Kasar", masuk: 150, keluar: 50, note: "Checkmark" },
            { id: 34, code: "XY900134FN", item: "Lem Pipa", spek: "40gr Tube", masuk: 100, keluar: 40, note: "" },
            { id: 35, code: "XY900135FN", item: "Kawat Nyamuk", spek: "Baja Putih /m", masuk: 50, keluar: 15, note: "Checkmark" },
            { id: 36, code: "XY900136FN", item: "Paku Beton", spek: "3 Inch Box", masuk: 20, keluar: 5, note: "" },
            { id: 37, code: "XY900137FN", item: "Bor Beton", spek: "SDS Plus 10mm", masuk: 12, keluar: 3, note: "Tajam" },
            { id: 38, code: "XY900138FN", item: "Kunci L Set", spek: "9 pcs Chrome", masuk: 15, keluar: 2, note: "Checkmark" },
            { id: 39, code: "XY900139FN", item: "Betel Beton", spek: "Flat 10 Inch", masuk: 8, keluar: 2, note: "" },
            { id: 40, code: "XY900140FN", item: "Helm Proyek", spek: "Warna Kuning", masuk: 25, keluar: 10, note: "Safety Gear" },
            { id: 41, code: "XY900141FN", item: "Rompi Safety", spek: "Orange Reflektor", masuk: 30, keluar: 5, note: "Checkmark" },
            { id: 42, code: "XY900142FN", item: "Sepatu Boot", spek: "Karet - Size 42", masuk: 12, keluar: 3, note: "" },
            { id: 43, code: "XY900143FN", item: "Sarung Tangan", spek: "Kain Bintik", masuk: 120, keluar: 60, note: "Checkmark" },
            { id: 44, code: "XY900144FN", item: "Kabel NYM", spek: "2x1.5mm 50m", masuk: 10, keluar: 2, note: "" },
            { id: 45, code: "XY900145FN", item: "Lampu LED", spek: "15 Watt Putih", masuk: 40, keluar: 15, note: "Hemat Energi" },
            { id: 46, code: "XY900146FN", item: "Isolasi Listrik", spek: "Hitam PVC", masuk: 100, keluar: 30, note: "Checkmark" },
            { id: 47, code: "XY900147FN", item: "Saklar Single", spek: "Tanam Tembok", masuk: 50, keluar: 12, note: "" },
            { id: 48, code: "XY900148FN", item: "Stop Kontak", spek: "4 Lubang 3m", masuk: 20, keluar: 7, note: "Checkmark" },
            { id: 49, code: "XY900149FN", item: "Palu Karet", spek: "Handle Kayu", masuk: 15, keluar: 4, note: "" },
            { id: 50, code: "XY900150FN", item: "Gunting Seng", spek: "10 Inch Lurus", masuk: 10, keluar: 2, note: "Checkmark" }
        ];
        return dataDummy
    }

    renderTable() {
        const data = this.getData()

        const headHTML = ""
    }


    play () {
        this.monthControl()
        this.makuChange()
        this.typeChange()

        this.CustomSelect()
        this.CustomMore()
    }
}
