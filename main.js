import { availableChart, lineChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";
import trx from "./js/transaksi"



const TRX = new trx()
TRX.play()
// TRX.monthControl()
// TRX.makuChange()
// TRX.CustomMore()
// TRX.CustomSelect()


lineChart()
availableChart()

setTimeout(()=> document.querySelector(".date-box").classList.add("shake"), 3000)

navigation()
themeChange()

document.querySelector("[data-nav='transaksi']").click()
document.querySelector("#theme-button").click()

document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Mencegah menu klik kanan bawaan browser
});


