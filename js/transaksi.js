


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
    CustomContextMenu () {

        const dateBox = document.querySelectorAll(".date-box")
        
        const contextMenu = document.getElementById("context-menu");

        dateBox.forEach(box => 
            box.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                contextMenu.style.display = "none";
                contextMenu.dataset.date = box.dataset.date

                let x = e.clientX;
                let y = e.clientY;

                contextMenu.style.display = "block";

                const menuWidth = contextMenu.offsetWidth;
                const menuHeight = contextMenu.offsetHeight;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                if (x + menuWidth > windowWidth) x = x - menuWidth;
                if (y + menuHeight > windowHeight) y = y - menuHeight;
                
                contextMenu.style.left = `${x}px`;
                contextMenu.style.top = `${y}px`;
            })
        );

        document.addEventListener("click", (e) => contextMenu.style.display = "none")

        document.addEventListener("keydown", (e) => {if (e.key === "Escape") contextMenu.style.display = "none";});

        const makuBox   = document.querySelector("#cal-maku")
        const antarBox  = document.querySelector("#antar-tanggal")

        const showStart = document.querySelector("#date-start-show")
        const showEnd   = document.querySelector("#date-end-show")

        const startBox  = document.querySelector("#start-box")
        const endBox    = document.querySelector("#end-box")

        document.querySelector("#date-start").onclick = (e) => {
            const date = e.target.closest(".context-menu").dataset.date
            makuBox.classList.add("dis-none")
            antarBox.classList.remove("dis-none")
            showStart.textContent = date
            showStart.dataset.status = "on"
            startBox.classList.remove("shake-constant", "blink")
            if (showEnd.dataset.status != "on") endBox.classList.add("shake-constant", "blink")
            else endBox.classList.remove("shake-constant", "blink")
        }
        document.querySelector("#date-end").onclick = (e) => {
            const date = e.target.closest(".context-menu").dataset.date
            makuBox.classList.add("dis-none")
            antarBox.classList.remove("dis-none")
            showEnd.textContent = date
            showEnd.dataset.status = "on"
            endBox.classList.remove("shake-constant", "blink")
            if (showStart.dataset.status != "on") startBox.classList.add("shake-constant", "blink")
            else startBox.classList.remove("shake-constant", "blink")
        }
        document.querySelector("#date-reset").onclick = (e) => {
            e.target.closest(".context-menu").dataset.date = ""
            makuBox.classList.remove("dis-none")
            antarBox.classList.add("dis-none")
            showStart.textContent = "- - -"
            showEnd.textContent = "- - -"
            showEnd.dataset.status = "off"
            showStart.dataset.status = "off"
            startBox.classList.remove("shake-constant", "blink")
            endBox.classList.remove("shake-constant", "blink")
        }

    }

    getData () {
        const inventoryData = [
            { id: "01", code: "97928749823", items: "Laptop ASUS VivoBook", masuk: 10, keluar: 2, note: "Sesuai" },
            { id: "02", code: "97928749824", items: "Mouse Logitech G304", masuk: 25, keluar: 25, note: "Habis" },
            { id: "03", code: "97928749825", items: "Keyboard Mechanical Keychron", masuk: 15, keluar: 5, note: "Sesuai" },
            { id: "04", code: "97928749826", items: "Monitor Dell 24 Inch", masuk: 8, keluar: 0, note: "Stok Utuh" },
            { id: "05", code: "97928749827", items: "Webcam Logitech C922", masuk: 12, keluar: 12, note: "Habis" },
            { id: "06", code: "97928749828", items: "SSD Samsung EVO 500GB", masuk: 30, keluar: 10, note: "Sesuai" },
            { id: "07", code: "97928749829", items: "RAM Corsair 16GB DDR4", masuk: 20, keluar: 4, note: "Sesuai" },
            { id: "08", code: "97928749830", items: "Headset SteelSeries Arctis", masuk: 7, keluar: 7, note: "Habis" },
            { id: "09", code: "97928749831", items: "Router TP-Link Archer", masuk: 10, keluar: 2, note: "Sesuai" },
            { id: "10", code: "97928749832", items: "Printer Epson L3110", masuk: 5, keluar: 1, note: "Sesuai" },
            { id: "11", code: "97928749833", items: "Hardisk External Seagate 1TB", masuk: 18, keluar: 18, note: "Habis" },
            { id: "12", code: "97928749834", items: "Kabel HDMI 2.0 3m", masuk: 50, keluar: 20, note: "Sesuai" },
            { id: "13", code: "97928749835", items: "USB Hub 4 Port USB 3.0", masuk: 25, keluar: 5, note: "Sesuai" },
            { id: "14", code: "97928749836", items: "Power Bank Anker 20000mAh", masuk: 15, keluar: 15, note: "Habis" },
            { id: "15", code: "97928749837", items: "Microphone Blue Yeti", masuk: 4, keluar: 0, note: "Stok Utuh" },
            { id: "16", code: "97928749838", items: "Graphic Tablet Wacom Intuos", masuk: 6, keluar: 2, note: "Sesuai" },
            { id: "17", code: "97928749839", items: "Cooling Pad Laptop", masuk: 30, keluar: 12, note: "Sesuai" },
            { id: "18", code: "97928749840", items: "Flashdisk SanDisk 64GB", masuk: 100, keluar: 100, note: "Habis" },
            { id: "19", code: "97928749841", items: "Speaker Simbadda CST", masuk: 10, keluar: 3, note: "Sesuai" },
            { id: "20", code: "97928749842", items: "Kabel LAN Cat6 10m", masuk: 40, keluar: 10, note: "Sesuai" },
            { id: "21", code: "97928749843", items: "Converter Type C to HDMI", masuk: 20, keluar: 20, note: "Habis" },
            { id: "22", code: "97928749844", items: "VGA Card RTX 3060", masuk: 3, keluar: 1, note: "Sesuai" },
            { id: "23", code: "97928749845", items: "Processor Intel i7-12700K", masuk: 5, keluar: 5, note: "Habis" },
            { id: "24", code: "97928749846", items: "Motherboard MSI B550", masuk: 8, keluar: 2, note: "Sesuai" },
            { id: "25", code: "97928749847", items: "Power Supply 650W 80+", masuk: 12, keluar: 4, note: "Sesuai" },
            { id: "26", code: "97928749848", items: "Casing PC ATX Tempered Glass", masuk: 10, keluar: 0, note: "Stok Utuh" },
            { id: "27", code: "97928749849", items: "Fan Case RGB 120mm", masuk: 60, keluar: 20, note: "Sesuai" },
            { id: "28", code: "97928749850", items: "Keyboard Wireless Logitech", masuk: 15, keluar: 15, note: "Habis" },
            { id: "29", code: "97928749851", items: "Tinta Epson 003 Black", masuk: 40, keluar: 35, note: "Sesuai" },
            { id: "30", code: "97928749852", items: "Kertas A4 80gr Sinar Dunia", masuk: 100, keluar: 50, note: "Sesuai" },
            { id: "31", code: "97928749853", items: "Joystick Gamesir G4 Pro", masuk: 6, keluar: 6, note: "Habis" },
            { id: "32", code: "97928749854", items: "Baterai CMOS CR2032", masuk: 200, keluar: 10, note: "Sesuai" },
            { id: "33", code: "97928749855", items: "Kabel Power PC", masuk: 50, keluar: 5, note: "Sesuai" },
            { id: "34", code: "97928749856", items: "Pasta Processor MX-4", masuk: 15, keluar: 15, note: "Habis" },
            { id: "35", code: "97928749857", items: "Switch Hub 8 Port", masuk: 10, keluar: 2, note: "Sesuai" },
            { id: "36", code: "97928749858", items: "Bracket Monitor Single", masuk: 5, keluar: 0, note: "Stok Utuh" },
            { id: "37", code: "97928749859", items: "Soundcard Focusrite Solo", masuk: 4, keluar: 1, note: "Sesuai" },
            { id: "38", code: "97928749860", items: "Earphone Sony MDR-EX15LP", masuk: 30, keluar: 30, note: "Habis" },
            { id: "39", code: "97928749861", items: "Mousepad Gaming XL", masuk: 25, keluar: 10, note: "Sesuai" },
            { id: "40", code: "97928749862", items: "Docking Station Laptop", masuk: 7, keluar: 7, note: "Habis" },
            { id: "41", code: "97928749863", items: "Wifi Dongle Dual Band", masuk: 20, keluar: 8, note: "Sesuai" },
            { id: "42", code: "97928749864", items: "Kabel Display Port 1.4", masuk: 15, keluar: 3, note: "Sesuai" },
            { id: "43", code: "97928749865", items: "Thermal Pad 1.5mm", masuk: 50, keluar: 50, note: "Habis" },
            { id: "44", code: "97928749866", items: "UPS Prolink 1200VA", masuk: 4, keluar: 1, note: "Sesuai" },
            { id: "45", code: "97928749867", items: "Stylus Pen Universal", masuk: 12, keluar: 2, note: "Sesuai" },
            { id: "46", code: "97928749868", items: "Ring Light 26cm", masuk: 10, keluar: 10, note: "Habis" },
            { id: "47", code: "97928749869", items: "Tripod Takara ECO-196", masuk: 8, keluar: 0, note: "Stok Utuh" },
            { id: "48", code: "97928749870", items: "Scanner Canon LiDE 300", masuk: 3, keluar: 1, note: "Sesuai" },
            { id: "49", code: "97928749871", items: "Screwdriver Kit Xiaomi", masuk: 15, keluar: 5, note: "Sesuai" },
            { id: "50", code: "97928749872", items: "Cleaner Kit Laptop", masuk: 40, keluar: 40, note: "Habis" }
        ];
        const transactionData = [
            { id: "01", tanggal: "05-03-2026", code: "7989234799", pengawas: ["Andi Budiman", "Siti Aminah"], event: "Workshop Digital Marketing", barang: 2, qty: 45 },
            { id: "02", tanggal: "06-03-2026", code: "7989234800", pengawas: ["Rian Hidayat", "Dewi Lestari"], event: "Seminar Cyber Security", barang: 5, qty: 12 },
            { id: "03", tanggal: "06-03-2026", code: "7989234801", pengawas: ["Eko Prasetyo"], event: "Lomba Coding Nasional", barang: 10, qty: 100 },
            { id: "04", tanggal: "07-03-2026", code: "7989234802", pengawas: ["Ferry Irawan", "Giska Putri"], event: "Pameran Komputer 2026", barang: 25, qty: 250 },
            { id: "05", tanggal: "08-03-2026", code: "7989234803", pengawas: ["Indah Permata"], event: "Rapat Tahunan IT", barang: 1, qty: 10 },
            { id: "06", tanggal: "09-03-2026", code: "7989234804", pengawas: ["Kevin Sanjaya", "Lani Rahma"], event: "Pelatihan Server Admin", barang: 4, qty: 8 },
            { id: "07", tanggal: "10-03-2026", code: "7989234805", pengawas: ["Maman Suherman"], event: "Instalasi Jaringan Lab", barang: 15, qty: 60 },
            { id: "08", tanggal: "11-03-2026", code: "7989234806", pengawas: ["Nina Zatulini", "Oky Setiana"], event: "Webinar UI/UX Design", barang: 2, qty: 5 },
            { id: "09", tanggal: "12-03-2026", code: "7989234807", pengawas: ["Putra Perkasa"], event: "E-Sport Tournament", barang: 30, qty: 30 },
            { id: "10", tanggal: "13-03-2026", code: "7989234808", pengawas: ["Rina Nose", "Sule Prikitiw"], event: "Gathering Komunitas Tech", barang: 8, qty: 40 },
            { id: "11", tanggal: "14-03-2026", code: "7989234809", pengawas: ["Taufik Hidayat"], event: "Maintenance Ruang Data", barang: 12, qty: 24 },
            { id: "12", tanggal: "15-03-2026", code: "7989234810", pengawas: ["Vina Panduwinata"], event: "Bakti Sosial IT", barang: 3, qty: 15 },
            { id: "13", tanggal: "16-03-2026", code: "7989234811", pengawas: ["Wawan Wanisar"], event: "Audit Inventaris", barang: 50, qty: 50 },
            { id: "14", tanggal: "17-03-2026", code: "7989234812", pengawas: ["Xenia Sari", "Yanto Basna"], event: "Demo Produk Baru", barang: 6, qty: 12 },
            { id: "15", tanggal: "18-03-2026", code: "7989234813", pengawas: ["Zulkifli Hasan"], event: "Sertifikasi Kompetensi", barang: 1, qty: 20 },
            { id: "16", tanggal: "19-03-2026", code: "7989234814", pengawas: ["Anisa Pohan", "Bambang P."], event: "Bootcamp Frontend", barang: 20, qty: 40 },
            { id: "17", tanggal: "20-03-2026", code: "7989234815", pengawas: ["Cinta Laura"], event: "Workshop AI Science", barang: 4, qty: 16 },
            { id: "18", tanggal: "21-03-2026", code: "7989234816", pengawas: ["Dedi Corbuzier"], event: "Podcast Teknologi Live", barang: 10, qty: 10 },
            { id: "19", tanggal: "22-03-2026", code: "7989234817", pengawas: ["Fajar Alfian"], event: "Lelang Perangkat Bekas", barang: 100, qty: 100 },
            { id: "20", tanggal: "23-03-2026", code: "7989234818", pengawas: ["Haji Bolot"], event: "Testing Aplikasi Baru", barang: 2, qty: 2 }
        ];
        const calendarData = [
            { date: "01", masuk: 2, keluar: 3 },
            { date: "03", masuk: 2, keluar: 0 },
            { date: "08", masuk: 0, keluar: 3 },
            { date: "25", masuk: 2, keluar: 0 },
            { date: "29", masuk: 2, keluar: 3 },
            { date: "31", masuk: 0, keluar: 3 },
        ];
        return [inventoryData, transactionData, calendarData]
    }
    renderItemsTable() {
        const tableBody = document.querySelector("#items-table tbody");
        
        // Kosongkan isi tabel sebelumnya jika ada
        tableBody.innerHTML = "";

        this.getData()[0].forEach(item => {
            const row = document.createElement("tr");
            row.classList.add("pointer")

            // Logika sederhana untuk icon Note: 
            // Jika Keluar == Masuk, tampilkan Centang Hijau. 
            // Jika Keluar < Masuk, tampilkan Jam Orange.
            const noteIcon = item.keluar === item.masuk 
                ? '<i class="fas fa-check clr-green"></i>' 
                : '<i class="fas fa-clock clr-purple"></i>';

            row.innerHTML = `
                <td>${item.id}</td>
                <td class="dis-none"><i class="fas fa-image pointer"></i></td>
                <td>${item.code}</td>
                <td>${item.items}</td>
                <td>${item.masuk}</td>
                <td>${item.keluar}</td>
                <td>${noteIcon}</td>
            `;

            tableBody.appendChild(row);
        });
    }
    renderTrxTable() {
        const tableBody = document.querySelector("#trx-table tbody");
    
        // Pastikan tableBody ditemukan
        if (!tableBody) return;

        // Kosongkan baris yang ada di HTML sebelumnya
        tableBody.innerHTML = "";

        this.getData()[1].forEach(item => {
            // Generate list pengawas dengan format span per baris
            const pengawasHtml = item.pengawas
                .map(nama => `<span>- ${nama}</span>`)
                .join("");

            // Buat elemen baris (tr)
            const row = document.createElement("tr");
            row.classList.add("pointer")
            
            // Isi konten baris sesuai struktur HTML yang Anda minta
            row.innerHTML = `
                <td><span class="w-100 h-100 green p-5 tr-front grid-center">${item.id}</span></td>
                <td>${item.tanggal}</td>
                <td>${item.code}</td>
                <td>
                    <div class="flex-start flex-column align-left items-start">
                        ${pengawasHtml}
                    </div>
                </td>
                <td>${item.event}</td>
                <td>${item.barang}</td>
                <td>${item.qty}</td>
            `;

            // Masukkan baris ke dalam tbody
            tableBody.appendChild(row);
        });
    }
    renderCalendar() {
        const container = document.getElementById('calendar-date');
        const spans = `<span></span><span></span>`
        container.innerHTML = spans; // Clear dulu

        // Loop 1-31 (Gua asumsiin 31 hari dulu buat contoh)
        for (let i = 1; i <= 31; i++) {
            const dayStr = i.toString().padStart(2, '0');
            const dayData = this.getData()[2].find(d => d.date === dayStr) || { date: dayStr, low: true, masuk: 0, keluar: 0 };
            const html = `
                <div class="date-box ${dayData.low ? 'opacity-30' : ''}" data-date="${dayData.date + "-03-2026"}">
                    <div class="date-content grid-center">
                        <div class="date-bars hidden gap-2 ${dayData.low ? 'grey' : 'grey'}">
                            ${dayData.masuk > 0 ? `<div class="data-bar h-100 grid-center bar-masuk green" data-text="${dayData.masuk}">${dayData.masuk}</div>` : "" }
                            ${dayData.keluar > 0 ? `<div class="data-bar h-100 grid-center bar-keluar blue" data-text="${dayData.keluar}">${dayData.keluar}</div>` : "" }
                        </div>
                    </div>
                    <div class="date-number align-center">${dayData.date}</div>
                </div>
            `;
            container.innerHTML += html;
        }
        this.CustomContextMenu()
    }


    play () {
        this.monthControl()
        this.makuChange()
        this.typeChange()
        this.renderItemsTable()
        this.renderTrxTable()
        this.renderCalendar();

        this.CustomSelect()
        this.CustomMore()
    }
}

