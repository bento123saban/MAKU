import DB from "./js/indexedDB"

Object.defineProperty(window, 'DB', {
    value: new DB(),
    writable: false, // Tidak bisa diubah (appDB = "sesuatu" akan error)
    configurable: false // Tidak bisa dihapus
});

import { availableChart, lineChart, navigation, themeChange, CustomContextMenu, CustomSelect, CustomMore } from "./js/UI";
import trx from "./js/transaksi"
import form from "./js/form";
import inv from "./js/inventory"
import { requestBarang }from "./js/request";
import { initGoogleLogin } from "./js/auth";



initGoogleLogin()
CustomContextMenu()
CustomMore()
CustomSelect()

requestBarang()



// DBStart()
















const TRX = new trx()
TRX.play()
const FORM = new form()
FORM.play()
const INV = new inv()
INV.play()


lineChart()
availableChart()

// setTimeout(()=> document.querySelector(".date-box").classList.add("shake"), 3000)

navigation()
themeChange()

document.querySelector("[data-nav='transaksi']").click()
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