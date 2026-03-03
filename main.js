import { availableChart, lineChart, roundChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";



const lineCanvas = document.querySelector("#line-chart")
const roundCanvas = document.querySelector("#round-chart")
const availCanvas = document.querySelector("#available-chart")

lineChart(lineCanvas)
availableChart(availCanvas)


navigation()
themeChange()
// setTimeout(() => {
    document.querySelector("[data-nav='transaksi']").click()
    document.querySelector("#theme-button").click()
// }, 1000)

document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Mencegah menu klik kanan bawaan browser
//   alert("Klik kanan terdeteksi!");
});