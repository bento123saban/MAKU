


class inventory {
    constructor () {

    }

    getData () {
        
        const inventoryData = Array.from({ length: 75 }, (_, i) => ({
            id: (i + 1).toString().padStart(2, '0'),
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            item: [
                "Keyboard Mechanical Keychron", 
                "Logitech MX Master 3S", 
                "Monitor Dell UltraSharp", 
                "SteelSeries Arctis Nova", 
                "Razer DeathAdder V3"
            ][i % 5],
            stok: Math.floor(Math.random() * 20) + 1,
            thumbsUp: Math.floor(Math.random() * 10),
            tools: Math.floor(Math.random() * 5),
            square: Math.random() > 0.5 ? 1 : "-",
            xMark: Math.random() > 0.8 ? 1 : "-",
            note: "Keterangan item ke-" + (i + 1)
        }));

        return inventoryData
    }
    
    renderInvenTable () {
        const tbody = document.querySelector('#inventory-table tbody');

        tbody.innerHTML = this.getData().map(data => `
            <tr>
                <td class="p-5"><span class="blue borad-5 w-100 h-100 green p-5 tr-front grid-center">${data.id}</span></td>
                <td>${data.code}</td>
                <td>${data.item}</td>
                <td>${data.stok}</td>
                <td>${data.thumbsUp}</td>
                <td>${data.square}</td>
                <td>${data.note}</td>
            </tr>
        `).join('');
    }

    play () {

        this.renderInvenTable()
    }
}

const INVENTORY = new inventory()
export default INVENTORY

