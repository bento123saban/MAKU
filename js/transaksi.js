


const container     = document.querySelector("#calendar")
const monthCtrl     = document.querySelector("#month-control")
const headSelect    = document.querySelector("#cal-head-select")
const selectClose   = document.querySelector("#cal-select-close")
export const monthControl = () => {
    monthCtrl.addEventListener("click", () => headSelect.classList.remove("dis-none"))
    selectClose.addEventListener("click", () => headSelect.classList.add("dis-none"))
}


// Maku Buttons
const makuEvent = document.querySelector("#maku-event")
let dataBar     = document.querySelectorAll(".data-bar")
let fronts      = document.querySelectorAll(".front") 
function makuMasuk (dataBar, fronts) {
    dataBar.forEach(bar => 
        (bar.classList.contains("green")) ?
            bar.classList.remove("dis-none") : bar.classList.add("dis-none")
    )
    fronts.forEach(front => {
        if (front.classList.contains("green")) front.closest(".cal-trx-group").classList.remove("dis-none")
        else front.closest(".cal-trx-group").classList.add("dis-none")
    })
}
function makuKeluar (dataBar, fronts) {
    dataBar.forEach(bar => 
        (bar.classList.contains("blue")) ?
            bar.classList.remove("dis-none") : bar.classList.add("dis-none")
    )
    fronts.forEach(front => {
        if (front.classList.contains("blue")) front.closest(".cal-trx-group").classList.remove("dis-none")
        else front.closest(".cal-trx-group").classList.add("dis-none")
    })
}
function makuSemua (dataBar, fronts) {
    dataBar.forEach(bar => bar.classList.remove("dis-none"))
    fronts.forEach(front => front.closest(".cal-trx-group").classList.remove("dis-none"))
}
export const makuChange = () => {
    makuEvent.addEventListener("change", (e) => {
        const value = e.target.value
        dataBar = document.querySelectorAll(".data-bar")
        fronts  = document.querySelectorAll(".front")
        if (value == "masuk") return makuMasuk(dataBar, fronts)
        if (value == "keluar") return makuKeluar(dataBar, fronts)
        makuSemua(dataBar, fronts)
    })
}

// Custom Select
export function CustomSelect(selector = '.custom-select-container') {
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

// Custom More
export function CustomMore(selector = ".more-box", callback = null) {
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


// Tabulator



