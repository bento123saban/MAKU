import { availableChart, lineChart } from "./js/chart";
import { navigation, themeChange } from "./js/nav";
import { monthControl, makuChange, CustomSelect, CustomMore } from "./js/transaksi";
import Tabulator from "tabulator-tables/src/js/core/Tabulator.js";
import 'tabulator-tables/dist/css/tabulator_modern.min.css'; 
import { jsPDF } from "jspdf";
import "jspdf-autotable";

window.jsPDF = jsPDF;



lineChart()
availableChart()

CustomSelect()
CustomMore()

setTimeout(()=> document.querySelector(".date-box").classList.add("shake"), 3000)

navigation()
themeChange()
document.querySelector("[data-nav='transaksi']").click()
document.querySelector("#theme-button").click()


monthControl()
makuChange()

document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Mencegah menu klik kanan bawaan browser
});


