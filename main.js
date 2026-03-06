import { availableChart, lineChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";
import trx from "./js/transaksi"



const TRX = new trx()
TRX.play()


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


