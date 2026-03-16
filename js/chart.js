import { Chart } from "chart.js/auto"
import ChartDataLabels from 'chartjs-plugin-datalabels';




Chart.register(ChartDataLabels)

const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
    datasets: [{
        label: 'Barang Masuk',
        data: [0,65,90, 59, 80, 81, 56, 55, 40, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'deepskyblue',
        tension: 0.4,
        fill: true, 
        backgroundColor: 'rgba(66, 184, 131, 0.2)', // Warna area (transparan)
    },
    {
        label: 'Barang Keluar',
        data: [0,56, 89, 30, 23, 1, 55, 89, 56, 89, 30, 23, 1, 55],
        fill: false,
        borderColor: 'limegreen',
        tension: 0.4,
        fill: true, 
        backgroundColor: 'rgba(3, 175, 255, 0.2)', // Warna area (transparan)
    }]
};
const lineConfig = {
    type: 'line',
    data: lineData,
    options: {
        layouts : {
            padding : {
                left : "40",
                right : "40",
                top: "0",
                bottom: "0"
            },
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display:  true,
                text: 'Barang Masuk dan Keluar - 2026',
                font : {size: 20},
                family: "barlow, san-serif"
            },
            datalabels : {display: false}
        },
        maintainAspectRatio: false, // INI KUNCINYA
        scales: {
            y: {
                grid: {
                    borderDash: [7, 7]
                }
            },
            x: {
                grid: { display: false }
            }
        }
    },
}

export const lineChart = () => {
    const lineCanvas = document.querySelector("#line-chart")
    new Chart(lineCanvas, lineConfig)
}


const availableData = {
    labels: ['Ready','Habis'],
    datasets: [{
        data: [37, 2],
        fill: true, 
        backgroundColor: ['#00ab00', "darkgrey"], // Warna area (transparan)
        spacing: 2,
        borderColor: "transparent",                    
        borderRadius: 4,              // Biar ujungnya tetap tumpul
        hoverOffset: 15        // Efek membesar saat di-hover (biar makin keren)
    }]
};
const availableConfig = {
    type: 'doughnut',
    data: availableData,
    options: {
        // cutout : "75%",
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Kondisi Barang',
                font : {size: 20}
            },
            datalabels: {
                display: false,
                color: '#fff',
                font: {
                    size: 12
                },
                formatter: (value, ctx) => {
                    // 1. Hitung total semua data
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    // 2. Hitung persentase
                    let percentage = (value * 100 / sum).toFixed(0) + "%";
                    return percentage; // Tampilkan persentase di chart
                },
            },
            tooltip: {
                callbacks: {
                    // Modifikasi teks label di dalam tooltip
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.raw; // Nilai asli (misal: 300)

                        // 1. Hitung total data
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                        // 2. Hitung persentase
                        const percentage = ((value / total) * 100).toFixed(1) + '%';

                        // 3. Gabungkan: "Label: Value (Percentage)"
                        return ` ${label}: ${value} (${percentage})`;
                    }
                }
            }
        },
        maintainAspectRatio: false, // INI KUNCINYA
    },
}
export const availableChart = () => {
    const availCanvas = document.querySelector("#available-chart")
    new Chart(availCanvas, availableConfig)
}



