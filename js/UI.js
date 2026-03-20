import { Chart } from "chart.js/auto"
import ChartDataLabels from 'chartjs-plugin-datalabels';




Chart.register(ChartDataLabels)

const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
    datasets: [{
        label: 'Barang Masuk',
        data: [0,65,90, 59, 80, 81, 56, 55, 40, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'deepskyblue',
        tension: 0.4,
        fill: true, 
        backgroundColor: 'rgba(66, 184, 131, 0.2)', // Warna area (transparan)
    },
    {
        label: 'Barang Keluar',
        data: [0,56, 89, 30, 23, 1, 55, 89, 56, 89, 30, 23, 1, 55],
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

export const lineChart = () => {
    const lineCanvas = document.querySelector("#line-chart")
    new Chart(lineCanvas, lineConfig)
}


const availableData = {
    labels: ['Ready','Habis'],
    datasets: [{
        data: [37, 2],
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
export const availableChart = () => {
    const availCanvas = document.querySelector("#available-chart")
    new Chart(availCanvas, availableConfig)
}



const navGroups = document.querySelectorAll(".nav-group")
const contents  = document.querySelectorAll(".content")
export const navigation = () => {
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
}

const themeBtn  = document.querySelector("#theme-button")
const nav       = document.querySelector("nav")
const main      = document.querySelector("main")
export const themeChange = () => {
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
}






export const CustomSelect   = (selector = '.custom-select-container', callback = null) => {
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
                triggerSpan.className = triggerSpan.dataset.class
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

export const CustomMore     = (selector = ".more-box", callback = null) => {
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
export const CustomContextMenu  = () => {

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

