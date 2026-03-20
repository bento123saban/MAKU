

const cloudFlare = "https://maku.dlhpambon2025.workers.dev/"




export async function requestBarang() {
  const URL_GAS = "https://maku.dlhpambon2025.workers.dev/";
  try {
    const response = await fetch(URL_GAS);
    const data = await response.json();
    // await window.DB.upsert("barang", data)
    return true
  } catch (error) {
    console.error("Gagal memuat data:", error);
    return false
  }
}
