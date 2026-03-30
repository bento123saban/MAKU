import { Chart } from "chart.js/auto"
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { formStart } from "./form";
import { initGoogleLogin } from "./device";
import TRANSACTION from "./transaksi";
// Async Function

export async function isReallyOnline() {
    // 1. Cek dasar: Jika browser bilang offline, biasanya memang offline.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        console.log("❌ Offline: No Network Access.");
        return {
            confirm : false,
            status  : "NETWORK_ERROR",
            code    : 0
        };
    }
    // console.log(navigator.onLine)

    const checkEndpoints = [
        "https://clients3.google.com/generate_204", // Endpoint sangat ringan dari Google
        "" // Mencoba ping ke Base URL kamu sendiri
    ];

    let attempts = 0;
    const maxPingAttempts = 3;

    while (attempts < maxPingAttempts) {
        attempts++;
        try {
            console.log(`🔍 Network Checking (Attemp ${attempts})...`);
            
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
            console.log("📶 Network : Online.");
            return {
                confirm : true,
                status  : "ONLINE",
                code    : 2
            }; 

        } catch (err) {
            console.log(`⚠️ Ping attemps ${attempts} failed.`);
            if (attempts < maxPingAttempts) {
                // Beri jeda 1 detik sebelum cek ulang
                await new Promise(r => setTimeout(r, 100));
            }
        }
    }

    console.log("❌ No Internet Acces.");
    return {
        confirm : false,
        status  : "NO_INTERNET_ACCESS",
        code    : 1
    };
}

// 
export function CustomSelect (selector = '.custom-select-container', callback = null) {
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
            hiddenInput.dataset.clr = clrClass

            // 1. Update Span & Simpan data-value asli
            if (triggerSpan) {
                triggerSpan.innerHTML = text;
                triggerSpan.setAttribute('data-value', val);
                triggerSpan.className = triggerSpan.dataset.class
            }

            // 2. Update Hidden Input (untuk form submit)
            if (hiddenInput) {
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                hiddenInput.dataset.clr = clrClass
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
        UI_log("Custom Select ✅")
    });

    // Klik di luar area select mana pun akan menutup semua dropdown
    document.addEventListener('click', () => closeAllSelects());
}
export function CustomMore (selector = ".more-box", callback = null) {
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
    
    UI_log("Custom More ✅")
}
export function CustomContextMenu () {
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
    
    UI_log("Custom ContextMenu ✅")

}
export function navBar () {
    const themeBtn  = document.querySelector("#theme-button")
    const nav       = document.querySelector("nav")
    const main      = document.querySelector("main")
    const navGroups = document.querySelectorAll(".nav-group")
    const contents  = document.querySelectorAll(".content")
    navGroups.forEach(nav => {
        nav.onclick = () => {
            navGroups.forEach(nv => nv.classList.remove("white"))
            nav.classList.add("white")
            contents.forEach(content => {
                if (content.id == nav.dataset.nav) content.classList.remove("dis-none")
                else content.classList.add("dis-none")
            })
        }
    })
    
    UI_log("Navbar ✅")
}
export function themeChange () {
    const themeBtn  = document.querySelector("#theme-button")
    const nav       = document.querySelector("nav")
    const main      = document.querySelector("main")

    themeBtn.onclick = () => {
        if (themeBtn.classList.contains("on")) {
            themeBtn.classList.remove("on")
            nav.classList.remove("green")
            nav.classList.add("black")
            main.classList.remove("white")
            main.classList.add("black")
        } else {
            themeBtn.classList.add("on")
            nav.classList.add("green")
            nav.classList.remove("black")
            main.classList.add("white")
            main.classList.remove("black")
        }
        
    }
    
    UI_log("Theme Change ✅")
}
export async function setChart (data) {
    Chart.register(ChartDataLabels)

    const lineData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
        datasets: [{
            label: 'Barang Masuk',
            data: data.lineMasuk,
            fill: false,
            borderColor: 'deepskyblue',
            tension: 0.4,
            fill: true, 
            backgroundColor: 'rgba(66, 184, 131, 0.2)', // Warna area (transparan)
        },
        {
            label: 'Barang Keluar',
            data: data.lineKeluar,
            fill: false,
            borderColor: 'limegreen',
            tension: 0.4,
            fill: true, 
            backgroundColor: 'rgba(3, 175, 255, 0.2)', // Warna area (transparan)
        }]
    };
    const lineConfig = {
        type: 'line',
        data: lineData,
        options: {
            layouts : {
                padding : {
                    left : "40",
                    right : "40",
                    top: "0",
                    bottom: "0"
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display:  true,
                    text: 'Barang Masuk dan Keluar - 2026',
                    font : {size: 20},
                    family: "barlow, san-serif"
                },
                datalabels : {display: false}
            },
            maintainAspectRatio: false, // INI KUNCINYA
            scales: {
                y: {
                    grid: {
                        borderDash: [7, 7]
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        },
    }
    const lineCanvas = document.querySelector("#line-chart")
    new Chart(lineCanvas, lineConfig)
    
    UI_log("Line Chart ✅")
    

    const availableData = {
        labels: ['Ready','Habis'],
        datasets: [{
            data: [data.available, data.unavailable],
            fill: true, 
            backgroundColor: ['#00ab00', "darkgrey"], // Warna area (transparan)
            spacing: 2,
            borderColor: "transparent",                    
            borderRadius: 4,              // Biar ujungnya tetap tumpul
            hoverOffset: 15        // Efek membesar saat di-hover (biar makin keren)
        }]
    };
    const availableConfig = {
        type: 'doughnut',
        data: availableData,
        options: {
            // cutout : "75%",
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Kondisi Barang',
                    font : {size: 20}
                },
                datalabels: {
                    display: false,
                    color: '#fff',
                    font: {
                        size: 12
                    },
                    formatter: (value, ctx) => {
                        // 1. Hitung total semua data
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        // 2. Hitung persentase
                        let percentage = (value * 100 / sum).toFixed(0) + "%";
                        return percentage; // Tampilkan persentase di chart
                    },
                },
                tooltip: {
                    callbacks: {
                        // Modifikasi teks label di dalam tooltip
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw; // Nilai asli (misal: 300)

                            // 1. Hitung total data
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                            // 2. Hitung persentase
                            const percentage = ((value / total) * 100).toFixed(1) + '%';

                            // 3. Gabungkan: "Label: Value (Percentage)"
                            return ` ${label}: ${value} (${percentage})`;
                        }
                    }
                }
            },
            maintainAspectRatio: false, // INI KUNCINYA
        },
    }
    const availCanvas = document.querySelector("#available-chart")
    new Chart(availCanvas, availableConfig)

    UI_log("Round Chart ✅")
    
}

export function generateUUID() {
    try {
        return crypto.randomUUID();
    } catch (e) {
        // Fallback jika browser sangat lama (misal HP Android jadul staf)
        return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }) + "-" + Date.now();
    }
}
export function bufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
export function UI_ClearShimmer (elm = null) {
    console.log("")
    console.log("[UI] Clear shimmer")
    if (!elm) return document.querySelectorAll(".content-loader").forEach(content => content.classList.add("dis-none"))
    elm.classList.add("dis-none")
    }
export function UI_log() { 
    try { 
        var args = Array.prototype.slice.call(arguments);
        console.log.apply(console, ["[UI Control]" ].concat(args)); 
    } catch(_) {}
}
export function UI_clearPopUp () {
    document.querySelector("#pop-up").classList.add("dis-none")
    document.querySelectorAll(".pop-up").forEach(popup => popup.classList.add("dis-none"))
}
export async function UI_Login(text = "") {
    // return UI_Main()
    const isOnline = await isReallyOnline()
    if (!isOnline.confirm) return UI_Offline()
    console.log("UI Login " + text)
    UI_clearPopUp()
    document.querySelector("#login").classList.remove("dis-none")
    document.querySelector("#main").classList.add("dis-none")
    document.querySelector("#login-content").classList.remove("dis-none")
    initGoogleLogin()
}
export function UI_Loader (text ="", all = false) {
    console.log("UI Loader")
    UI_clearPopUp()
    document.querySelector("#pop-up").classList.remove("dis-none")
    document.querySelector("#loader").classList.remove("dis-none")
    document.querySelector("#loader-text").textContent = text
}
export async function UI_Main () {
    console.log("UI Main")
    document.querySelector("#login").classList.add("dis-none")
    document.querySelector("#main").classList.remove("dis-none")
    document.querySelector("#login-content").classList.add("dis-none")
    UI_Play()
    UI_clearPopUp()
    await formStart()
    await updateDashboard()
    TRANSACTION.play()
    UI_ClearShimmer()
}
export function UI_Offline(text = "OFFLINE") {
    document.querySelector("#pop-up").classList.remove("dis-none")
    document.querySelectorAll(".pop-up").forEach(popup => popup.classList.add("dis-none"))
    document.querySelector("#loader-text").textContent = ""
    document.querySelector("#offline-text").textContent = text
    document.querySelector("#offline").classList.remove("dis-none")
}
export function UI_Alert(text = "") {
    console.log("UI Alert")
    UI_clearPopUp()

    document.querySelector("#pop-up").classList.remove("dis-none")
    document.querySelector("#alert").classList.remove("dis-none")
    document.querySelector("#alert-text").textContent = text
}
export function UI_Notif (text = "", color = "green", timeout = 4000) {
    const notifBox  = document.querySelector("#notif-box")
    const ntf       = document.createElement("div")
    ntf.className = "notif-box items-start gap-10 flex-end " + color
    ntf.innerHTML = `
        <p class="p-0 m-0">${text}</p>
        <i class="fas fa-close p-3 pointer notif-close"></i>
    `
    notifBox.appendChild(ntf)
    setTimeout(()=> ntf.remove(), timeout)
}
export function UI_Play () {
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    UI_log("Play ✅")
    CustomContextMenu()
    CustomMore()
    CustomSelect()

    navBar()
    themeChange()

    document.querySelectorAll(".content-loader").forEach(content => content.classList.remove("dis-none"))
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("notif-close")) e.target.closest(".notif-box").remove()
    })
}

export async function updateDashboard () {
    
    const counter = await window.DB.getAll("counter")

    const trxHeader     = counter.find(data => data.type === "trxHeader")
    const hedaerCount   = trxHeader.count
    const headerMonth   = trxHeader?.month
    const lineMasuk     = [headerMonth.januari.in, headerMonth.februari.in, headerMonth.maret.in, headerMonth.april.in, headerMonth.mei.in, headerMonth.juni.in, headerMonth.juli.in, headerMonth.agustus.in, headerMonth.september.in, headerMonth.oktober.in, headerMonth.november.in, headerMonth.desember.in]
    const lineKeluar    = [headerMonth.januari.out, headerMonth.februari.out, headerMonth.maret.out, headerMonth.april.out, headerMonth.mei.out, headerMonth.juni.out, headerMonth.juli.out, headerMonth.agustus.out, headerMonth.september.out, headerMonth.oktober.out, headerMonth.november.out, headerMonth.desember.out]

    const stocks        = counter.find(data => data.type === "stocks")
    const available     = stocks?.available
    const unavailable   = stocks?.unavailable
    const total         = stocks.total

    const items         = counter.find(data => data.type === "items")
    const itemsCount    = items.count

    document.querySelector("#trx-boxes").textContent    = hedaerCount
    document.querySelector("#items-boxes").textContent  = itemsCount
    document.querySelector("#qty-boxes").textContent    = total

    setChart({
        lineMasuk   : lineMasuk,
        lineKeluar  : lineKeluar,
        available   : available,
        unavailable : unavailable
    })
}