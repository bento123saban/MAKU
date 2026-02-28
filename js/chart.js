import { Chart, layouts } from "chart.js/auto"
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels)

const lineData = {
    labels: [
    "",'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
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
                text: 'Barang Masuk dan Keluar Januari - Desember 2026',
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

export const lineChart = (elm) => {
    const cx = new Chart(elm, lineConfig)
}




const roundData = {
    labels: ['Tersedia', 'Habis'],
    datasets: [{
        data: [30, 10],
        fill: false,
        borderColor: 'transparent',
        tension: 0.4,
        fill: true, 
        backgroundColor: ['#0eb00e', 'darkgrey'],// Warna area (transparan)\
        borderWidth: 2,                // Ini akan jadi lebar gap-nya
        borderColor: '#f5f5f5',        // SAMAKAN dengan warna background box lu
        borderAlign: 'inner',          // Memastikan gap tidak memakan ukuran luar
        
        // Matikan spacing jika pakai cara ini agar tidak tabrakan
        spacing: 0,                    
        
        borderRadius: 10,              // Biar ujungnya tetap tumpul
        hoverOffset: 15  
    }]
};
const roundConfig = {
    type: 'doughnut',
    data: roundData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                usePointStyle: true,   // Pakai gaya titik sebagai simbol
                pointStyle: 'rect',    // Paksa bentuk jadi Rectangle (Persegi)
                boxWidth: 15,          // Ukuran lebar kotak (px)
                boxHeight: 15,         // Ukuran tinggi kotak (px)
                padding: 20,           // Jarak antar label
            },
            title: {
                display: true,
                text: 'Ketersediaan Barang',
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
export const roundChart = (elm) => {
    const cx = new Chart(elm, roundConfig)
}




const availableData = {
    labels: ['Ready', 'Maintenance', 'Rusak'],
    datasets: [{
        data: [37, 2, 1],
        fill: false,
        borderColor: 'transparent',
        tension: 0.4,
        fill: true, 
        backgroundColor: ['#0eb00e', "#ffd700", '#e6002a'], // Warna area (transparan)
        borderWidth: 2,                // Ini akan jadi lebar gap-nya
        borderColor: '#f5f5f5',        // SAMAKAN dengan warna background box lu
        borderAlign: 'inner',          // Memastikan gap tidak memakan ukuran luar
        
        // Matikan spacing jika pakai cara ini agar tidak tabrakan
        spacing: 0,                    
        
        borderRadius: 10,              // Biar ujungnya tetap tumpul
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
export const availableChart = (elm) => {
    const cx = new Chart(elm, availableConfig)
}



