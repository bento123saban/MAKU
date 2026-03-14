




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