import { availableChart, lineChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";
import trx from "./js/transaksi"
import inv from "./js/inventory";


const TRX = new trx()
TRX.play()
const INV = new inv()
INV.play()


lineChart()
availableChart()

// setTimeout(()=> document.querySelector(".date-box").classList.add("shake"), 3000)

navigation()
themeChange()

document.querySelector("[data-nav='add']").click()
document.querySelector("#theme-button").click()
// document.querySelector("#type-barang").click()

document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Mencegah menu klik kanan bawaan browser
  // document.getElementById("context-menu").style.display = "none"
});


async function checkDomain(domain) {
  try {
    const response = await fetch(`https://rdap.arin.net/registry/domain/${domain}`);
    const data = await response.json();
    console.log("Data Domain:", data);
  } catch (error) {
    console.error("Domain tidak ditemukan atau bersifat privat");
  }
}

// checkDomain('ct.wt');