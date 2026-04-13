import { updates } from "./form";

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

class trx {
    constructor () {
        this.trxItemDetailBox   = document.querySelector("#trx-items-detail")
        this.trxDetailBox       = document.querySelector("#trx-detail")
        this.detailSearch       = document.querySelector("input#search-input")
        this.makuValue          = document.querySelector("input#maku-value")
        this.typeValue          = document.querySelector("input#type-value")
        this.makuMore           = document.querySelector("#maku-more-input")

        this.countMakuOut       = document.querySelector("#cal-maku-out")
        this.countMakuIn        = document.querySelector("#cal-maku-in")

        this.calendarDate       = new Date(new Date().setDate(10))
        this.calendarData       = null
        this.calendarCounter    = async () => await window.DB.search("counter", {query : "trxHeader", fields : ["type"]})
        this.monthControl       = document.querySelector("#month-control")
        this.onMonth            = () => new Date(this.calendarDate).toLocaleDateString("in-ID",{month : "long"})
        this.onYear             = () => new Date(this.calendarDate).toLocaleDateString("in-ID",{year : "numeric"})

        this.range              = this.onMonth()
        this.stringRange        = ""
    }

    makuChange () {
        let dataBar     = document.querySelectorAll(".data-bar")
        let fronts      = document.querySelectorAll(".trx-tr") 

        this.makuValue.addEventListener("change", (e) => {
            const value = e.target.value
            dataBar = document.querySelectorAll(".data-bar")
            fronts  = document.querySelectorAll(".trx-tr")
            dataBar.forEach (bar => {
                if (value == "semua") bar.classList.remove("dis-none")
                else if (value == "masuk" && bar.classList.contains("green")) bar.classList.remove("dis-none")
                else if (value == "keluar" && bar.classList.contains("blue")) bar.classList.remove("dis-none")
                else bar.classList.add("dis-none")
            })
            fronts.forEach(front => {
                console.log(value)
                if (value == "semua") front.classList.remove("dis-none")
                else if (value == front.dataset.type) front.classList.remove("dis-none")
                else front.classList.add("dis-none")
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

    async renderItemsTable(data = null) {
        const trxItems  = await window.DB.searchUnique("trxItems", {query : this.range, fields : ["month"], filters : {year : this.onYear()}})
        const tableBody = document.querySelector("#items-table tbody");
        tableBody.innerHTML = "";
        trxItems.forEach((item, i)=> {
            console.log(item)
            const row = document.createElement("tr");
            row.dataset.code = item.code
            row.dataset.type = (item.type === "IN") ? "masuk" : "keluar"
            row.dataset.date = item.date
            row.className = "trx-tr"
            console.log(item)
            row.innerHTML = `
                <td class="pointer"><span class="borad-5 h-100 purple p-5 tr-front grid-center">${(i + 1).toString().padStart(2, '0')}</span></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.trxCount}</td>
                <td>${item.in}</td>
                <td>${item.out}</td>
            `;

            tableBody.appendChild(row);
            row.firstElementChild.onclick = () => {
                const code = row.dataset.code
                if (this.trxItemDetailBox.dataset.code == code && !this.trxItemDetailBox.classList.contains("dis-none")) return
                this.trxDetailBox.classList.add("dis-none")
                this.trxItemDetailBox.classList.remove("dis-none")
                this.renderTRXItems(code)
            }
        });
    }

    async renderTRXItems(code) {
        const year      = this.onYear()
        const item      = (await window.DB.search("items", {query : code, fields : ["code"], filter: {year : year}}))[0]
        const items     = await window.DB.search("trxItems", {query : code, fields : ["code"], filters : {month : this.range, year : year}})
        const headsMap  = new Map()

        let stockIn     = 0
        let stockOut    = 0 

        await Promise.all(items.map(async (item) => {
            const results = await window.DB.search("trxHeader", {
                query: item.trxCode,
                fields: ["code"]
            });
            if (item.type == "IN") stockIn += parseInt(item.in)
            else stockOut += parseInt(item.out)

            const head = results[0];
            if (head && !headsMap.has(head.code)) headsMap.set(head.code, { itemCount : item.type == "IN" ? item.in : item.out, head : head});
        }));
        const heads = Array.from(headsMap.values());

        let html = `
            <i class="fas fa-close clr-red fz-20 pointer" id="trx-item-detail-close"></i>
            <span id="trx-items-detail-header" class="dis-none align-center mb-2">Periode : 01 </span>
            
            <div class="flex-start gap-10 w-100 ">
                <i class="fas fa-image grid-center purple fz-20 borad-20 pointer" onclick="window.location.href ='${item.link}'"></i>
                <div class="flex-beetwen w-100">
                    <span class="fz-18 bolder dis-block w-100">${item.name}</span>
                    <div class="flex-strech flex-column">
                        <span class="in-out clr-green bolder" data-type="in">${stockIn.toString().padStart(3, '0')}</span>
                        <span class="align-center">-</span>
                        <span class="in-out clr-blue bolder"  data-type="out">${stockOut.toString().padStart(3, '0')}</span>
                    </div>
                </div>
            </div>
            
            <div class="hr grey"></div>

            <div id="trx-items-list-trx" class="flex-start items-start flex-column gap-3">
        `

        heads.forEach(head => html += `
            <div class="trx-items-trx-group w-100 p-10">
                <div class="flex-beetwen">
                    <span>${head.head.staff}</span>
                    <span class="${head.head.type == "IN" ? "clr-green" : "clr-blue"} bolder">${head.itemCount} Pcs</span>
                </div>
                <div class="flex-beetwen fz-14">
                    <span>${head.head.code}</span>
                    <span>${new Date(head.head.time).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + " " + new Date(head.head.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
            </div>    
        `)

        html += `</div>`

        document.querySelector("#trx-items-detail").innerHTML = html
    }

    async calculateDetailedSummary(param = null) {
        const trxItems = param || await window.DB.search("trxItems", {query : this.onMonth(), fields : ["month"], filters : {year : this.onYear()}})
        const init = {
            in: { trx: 0, items: new Set(), qty: 0 },
            out: { trx: 0, items: new Set(), qty: 0 }
        };

        const stats = trxItems.reduce((acc, item) => {
            const type = item.type === "IN" ? "in" : "out";
            const qty = +(item[type] || 0); // Ambil item.in jika IN, item.out jika OUT

            acc[type].trx++;
            acc[type].qty += qty;
            if (item.code) acc[type].items.add(item.code);

            return acc;
        }, init);
        document.querySelector("#render-counter").innerHTML = `
            <h4 class="m-0 p-0">Periode <br> ${this.stringRange}</h4>
            
            <div>
                <h4 class="m-0 p-0 clr-green uppercase">Barang Masuk</h4>
                <span>${stats.in.trx} Transaksi - ${stats.in.items.size} Barang - ${stats.in.qty} Qty</span>
            </div>
            <div>
                <h4 class="m-0 p-0 clr-blue uppercase align-right">Barang Keluar</h4>
                <span>${stats.out.trx} Transaksi - ${stats.out.items.size} Barang - ${stats.out.qty} Qty</span>
            </div>
        `
    }

    async renderTrxTable(data = null) {
        // 1. Ambil data jika null (Case-insensitive 'month' ditangani oleh DB.search)
        const trxHeader = data || this.calendarData

        const tableBody = document.querySelector("#trx-table tbody");
        if (!tableBody) return;

        // Gunakan DocumentFragment untuk performa jika data > 100 baris
        const fragment = document.createDocumentFragment();
        tableBody.innerHTML = ""; 

        trxHeader.forEach((item) => {
            const row = document.createElement("tr");
            const isIN = item.type === "IN";
            
            row.className = "trx-tr";
            row.dataset.code = item.code;
            
            // Format tanggal lebih efisien
            const dateStr = `${String(item.date).padStart(2, '0')} ${item.month} ${item.year}`;
            row.dataset.date = dateStr
            // Di dalam loop renderTrxTable:
            const d = new Date(item.time);
            const timeDisplay = `${dateFormatter.format(d)} ${timeFormatter.format(d)}`;
            
            row.innerHTML = `
                <td class="pointer">
                    <span class="borad-5 w-100 h-100 ${isIN ? "green" : "blue"} p-5 tr-front grid-center">
                        ${String(item.date).padStart(2, '0')}
                    </span>
                </td>
                <td>${timeDisplay}</td>
                <td>${item.code}</td>
                <td>${item.staff}</td>
                <td>${item.itemsCount}</td>
                <td>${item.stocksCount}</td>
                <td>${item.typeNote}</td>
                <td>${item.note || '-'}</td>
            `;

            // Klik pada kolom pertama (Badge Tanggal)
            row.cells[0].onclick = () => this.renderTRXDetail(item);
            
            fragment.appendChild(row);
        });

        tableBody.appendChild(fragment);
    }

    async renderTRXDetail(head) {
        const onCode = this.trxDetailBox.dataset.code
        if (onCode == head.code && !this.trxDetailBox.classList.contains("dis-none")) return
        
        this.trxDetailBox.classList.remove("dis-none")
        this.trxItemDetailBox.classList.add("dis-none")
        
        const items = await window.DB.search("trxItems", { query : head.code, fields : ["trxCode"]})
        if (!head) return false
        const type = head.type

        let html = `
            <i class="fas fa-close fz-20 pointer" id="trx-detail-close"></i>
            <span id="trx-detail-header" class="dis-block align-center mb-2">Barang ${head.type === "IN" ? "Masuk" : "Keluar"} - ${head.typeNote}</span>
            <div class="flex-beetwen items-end">
                <div id="detail-pengawas" class="flex-start gap-20 w-100">
                    <i class="fas fa-image grid-center ${type == "IN" ? "green" : "blue"} fz-20 borad-20 pointer"></i>
                    <div class="flex-beetwen w-100 gap-20">
                        <div class="flex-start items-start flex-column gap-5">
                            <span class="fz-20">${head.staff}</span>
                            <span class="fz-14">${head.itemsCount} Barang - ${head.stocksCount} Qty</span>
                        </div>
                        <div class="flex-start items-end flex-column gap-5">
                            <span class="italic">${head.code}</span>
                            <span class="fz-12">${new Date(head.time).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hr grey"></div>
            <div id="detail-items-list" class="flex-strech items-start flex-column gap-3">
                
        `

        items.forEach(item => html += `
            <div class="itms-group flex-beetwen w-100">
                <span>${item.name}</span>
                <span>${item[type.toLowerCase()]} Pcs</span>
            </div>
        `)

        html += `</div>`

        document.querySelector("#trx-detail").innerHTML = html
        return true

    }

    async calendarSet() {
        const year = this.onYear()
        this.calendarData       = await window.DB.search("trxHeader", {query : this.onMonth(), fields : ["month"], filters : {year : year}})
        let prevButton  = document.querySelector("#calendar-previous")
        let nextButton  = document.querySelector("#calendar-next")
        nextButton.onclick = async (e) => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1)
            const year = this.onYear()
            this.calendarData       = await window.DB.search("trxHeader", {query : this.onMonth(), fields : ["month"], filters : {year : year}})
            this.renderCalendar()
            this.makuValue.value = ""
            this.makuValue.dispatchEvent(new Event('change', { bubbles: true }));
            this.makuValue.value = "bulanan"
            this.makuValue.dispatchEvent(new Event('change', { bubbles: true }));
        }
        prevButton.onclick = async (e) => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1)
            const year = this.onYear()
            this.calendarData   = await window.DB.search("trxHeader", {query : this.onMonth(), fields : ["month"], filters : {year : year}})
            this.renderCalendar()
            this.makuValue.value = ""
            this.makuValue.dispatchEvent(new Event('change', { bubbles: true }));
            this.makuValue.value = "bulanan"
            this.makuValue.dispatchEvent(new Event('change', { bubbles: true }));
        }
        this.renderCalendar()
        this.calculateDetailedSummary()
        this.renderItemsTable()
        this.renderTrxTable()
    }

    async renderCalendar() {
        const last      = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 0).getDate(),
            month       = this.calendarDate.getMonth(),
            year        = this.calendarDate.getFullYear(),
            firstDay    = new Date(year, month, 1).getDay()

        this.monthControl.textContent = this.onMonth() + " " + this.onYear()
        const container = document.getElementById('calendar-date');
        container.innerHTML = ((firstDay) => Array(firstDay).fill("<span></span>").join(""))(firstDay)

        for (let i = 1; i <= last; i++) {
            const dayStr    = i.toString().padStart(2, '0');
            const dayObj    = { date: dayStr, low: true, masuk: 0, keluar: 0, status : false }
            
            const dayData = this.calendarData == [] ? dayObj : (() => {
                this.calendarData.forEach(x => {
                    if (x.date != dayStr) return
                    dayObj.low = false
                    dayObj.status = true
                    if (x.type == "IN") dayObj.masuk ++
                    if (x.type == "OUT") dayObj.keluar ++
                })
                return dayObj
            })()
            // continue
            const html = `
                <div data-ctrl="${!dayData.status ? 0 : 1}" class="${!dayData.status ? 0 : "pointer "} date-box ${dayData.low ? 'opacity' : ''}" data-date="${dayData.date} ${this.onMonth()} ${this.onYear()}">
                    <div class="date-content grid-center">
                        <div class="date-bars hidden gap-2 ${dayData.low ? 'opacity-10' : ''}">
                            ${dayData.masuk > 0 ? `<div class="data-bar h-100 grid-center bar-masuk green" data-text="${dayData.masuk}">${dayData.masuk}</div>` : "" }
                            ${dayData.keluar > 0 ? `<div class="data-bar h-100 grid-center bar-keluar blue" data-text="${dayData.keluar}">${dayData.keluar}</div>` : "" }
                        </div>
                    </div>
                    <div class="date-number align-center">${dayData.date}</div>
                </div>
            `;
            container.innerHTML += html;
        }

        this.range = [this.onMonth()]
        this.stringRange = this.onMonth().toUpperCase() + " " + this.onYear()

        
        // this.calculateDetailedSummary()
        // this.renderItemsTable()
        // this.renderTrxTable()
        // CustomContextMenu()
    }

    setMoreRange () {
        const startYear = 2026;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        const rangeElm = document.querySelector("#maku-more-list")

        rangeElm.innerHTML = "<span class='grey'>Bulanan</span>"

        // Menentukan triwulan saat ini (1-4)
        const currentTriwulan = Math.floor(currentMonth / 3) + 1;

        for (let year = startYear; year <= currentYear; year++) {
            // Jika tahun yang sedang di-loop adalah tahun sekarang, batasnya sampai triwulan saat ini.
            // Jika tahun di masa lalu, batasnya sampai triwulan 4.
            const limitTriwulan = (year === currentYear) ? currentTriwulan : 4;
            for (let t = 1; t <= limitTriwulan; t++) rangeElm.innerHTML += `<span>Triwulan ${t} - ${year}</span>`;
            rangeElm.innerHTML += `<span>${year}</span>`;
        }

    }

    trxRender() {
        this.renderItemsTable()
        this.renderTrxTable()
        this.calendarSet()
    }

    async play () {
        const headSelect    = document.querySelector("#cal-head-select")
        const selectClose   = document.querySelector("#cal-select-close")
        
        // this.monthControl.addEventListener("click", () => headSelect.classList.remove("dis-none"))
        selectClose.addEventListener("click", () => headSelect.classList.add("dis-none"))

        this.calendarSet()
        this.makuChange()
        this.typeChange()


        window.addEventListener("click", (e) => {
            const box = e.target.closest(".date-box")
            if (box) {
                if (box.dataset.ctrl == 0) return
                const boxDate = box.dataset.date
                document.querySelectorAll(".trx-tr")?.forEach(tr => {
                    console.log(tr.dataset.date)
                    if (tr.dataset.date.toUpperCase() == box.dataset.date.toUpperCase()) return tr.classList.remove("dis-none")
                    tr.classList.add("dis-none")
                    console.log(tr.dataset.date, box.dataset.date)
                })
            }
            const trxDetailClose = e.target.closest("#trx-detail-close")
            if (trxDetailClose) this.trxDetailBox.classList.add("dis-none")
            const itemDetailClose = e.target.closest("#trx-item-detail-close")
            if (itemDetailClose) this.trxItemDetailBox.classList.add("dis-none")
            if (e.target.classList.contains("trx-update")) {
                const btn = e.target
                btn.onclick = (e) => (!e.target.classList.contains("spin")) ? updates(() => this.trxRender()    ) : false
            }
        })

        this.makuMore.onchange = async (e) => {
            const value = e.target.value
            let headerMonth = []
            let itemsMonth  = []
            let itmsMonth   = []

            const getNamaBulan = ((p) => {
                const f = new Intl.DateTimeFormat('id', { month: 'long' });
                const b = (i) => f.format(new Date(0, i));
                
                const input = p.toString().trim();
                const lowP = input.toLowerCase();
                const now = new Date(this.calendarDate);

                // Helper: Mendapatkan daftar nama bulan di antara dua tanggal
                const getBulanAntara = (dateStart, dateEnd) => {
                    let start = new Date(dateStart.getFullYear(), dateStart.getMonth(), 1);
                    let end = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 1);
                    let list = [];
                    while (start <= end) {
                        list.push(b(start.getMonth()).toLowerCase());
                        start.setMonth(start.getMonth() + 1);
                    }
                    return list;
                };

                // 1. KONDISI: RANGE TANGGAL (Contoh: "02 April 2026 - 30 November 2026")
                if (input.includes('-') && !lowP.includes('triwulan')) {
                    const dates = input.split('-').map(d => d.trim());
                    // Mencoba parse tanggal manual (Asumsi format: DD Bulan YYYY)
                    // Kita gunakan Date.parse atau pembuatan objek Date sederhana
                    const d1 = new Date(dates[0]);
                    const d2 = new Date(dates[1]);

                    if (!isNaN(d1) && !isNaN(d2)) {
                        return {
                            bulan: getBulanAntara(d1, d2),
                            year: d1.getFullYear(), // Mengambil tahun dari tanggal mulai
                            periode: `${dates[0]} - ${dates[1]}`
                        };
                    }
                }

                // 2. KONDISI: "BULANAN"
                if (lowP === 'bulanan') {
                    // this.calendarDate = new Date(new Date(this.calendarDate).setDate(10));
                    this.range        = this.onMonth();
                    const m = now.getMonth();
                    const y = now.getFullYear();
                    return {
                        bulan: [b(m).toLowerCase()],
                        year: y,
                        periode: `${b(m)} ${y}`
                    };
                }

                // 3. KONDISI: "TRIWULAN X - YYYY"
                if (lowP.includes('triwulan')) {
                    const parts = lowP.split(' '); 
                    const tw = parseInt(parts[1]);
                    const y = parseInt(parts[3]);
                    if (tw >= 1 && tw <= 4 && y) {
                        const bulanArray = [0, 1, 2].map(i => b((tw - 1) * 3 + i));
                        return {
                            bulan: bulanArray.map(m => m.toLowerCase()),
                            year: y,
                            periode: `${bulanArray[0]} - ${bulanArray[2]} ${y}`
                        };
                    }
                }

                // 4. KONDISI: HANYA TAHUN (Contoh: "2026")
                const checkYear = parseInt(lowP);
                if (!isNaN(checkYear) && lowP.length === 4) {
                    return {
                        bulan: Array.from({ length: 12 }, (_, i) => b(i).toLowerCase()),
                        year: checkYear,
                        periode: `Januari - Desember ${checkYear}`
                    };
                }

                return { bulan: [], year: null, periode: "Format tidak dikenali" };
            })(value);

            this.range = getNamaBulan.bulan
            this.stringRange = getNamaBulan.periode

            headerMonth = await window.DB.search("trxHeader", {query : this.range, fields: ["month"], filters : {year : this.onYear()}})
            itmsMonth   = await window.DB.search("trxItems", {query : this.range, fields: ["month"], filters : {year : this.onYear()}})
            itemsMonth  = await window.DB.searchUnique("trxItems", {query : this.range, fields: ["month"], filters : {year : this.onYear()}})
            this.calculateDetailedSummary(itmsMonth)
            this.renderTrxTable(headerMonth)
            this.renderItemsTable(itemsMonth)
        }
    }
}

const TRANSACTION = new trx()
export default TRANSACTION
