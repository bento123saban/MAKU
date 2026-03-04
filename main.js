import { availableChart, lineChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";
import { CustomSelect } from "./js/custom-element";




lineChart()
availableChart()

CustomSelect()

setTimeout(()=> document.querySelector(".date-box").classList.add("shake"), 3000)

navigation()
themeChange()
document.querySelector("[data-nav='transaksi']").click()
document.querySelector("#theme-button").click()


document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Mencegah menu klik kanan bawaan browser
});


