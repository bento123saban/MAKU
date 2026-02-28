import { availableChart, lineChart, roundChart } from "./js/chart";



const lineCanvas = document.querySelector("#line-chart")
const roundCanvas = document.querySelector("#round-chart")
const availCanvas = document.querySelector("#available-chart")

lineChart(lineCanvas)
roundChart(roundCanvas)
availableChart(availCanvas)