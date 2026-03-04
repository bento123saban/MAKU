/**
 * initCustomSelect - Inisialisasi dropdown kustom
 * @param {string} selector - Class utama container
 * 
 * 
 */
/**
 * initCustomSelect - Versi Final (Optimized)
 * Menggunakan data-clr dan sinkronisasi Span data-value
 */
/**
 * initCustomSelect - Versi Independent Scoped
 * Mengatur teks, value pada span, hidden input, dan class warna pada .select-custom
 */
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