export async function getInventory() {
  const URL_GAS = "https://maku.dlhpambon2025.workers.dev/";
  
  try {
    const response = await fetch(URL_GAS);
    const data = await response.json();
    
    console.log(data); // Cek di console browser
    
    // Contoh akses data pertama:
    // console.log(data[0].nama); 
    
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
}