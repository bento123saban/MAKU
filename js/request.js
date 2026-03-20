export async function requestBarang() {
  const URL_GAS = "https://maku.dlhpambon2025.workers.dev/";
  // const indexedDB = new DBStart()
  
  try {
    const response = await fetch(URL_GAS);
    const data = await response.json();

    // await DB().upsert(data)
    await window.DB.upsert("barang", data)

    // console.log(DB)
    

    
    
    
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
}