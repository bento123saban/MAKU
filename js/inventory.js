


export default class inventory {
    constructor () {
        this.readyButton = document.querySelector("#inven-ready-button")
        this.habisButton = document.querySelector("#inven-habis-button")
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
    
    async renderInvenTable () {
        const data = await window.DB.getAll("stocks")
        // console.log(data)
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = data.map((data, i) => `
            <tr>
                <td class="p-5"><span class="pointer borad-5 w-100 h-100  p-5 tr-front grid-center">${(i + 1).toString().padStart(2, '0')}</span></td>
                <td>${data.code}</td>
                <td>${data.name}</td>
                <td>${data.stock}</td>
                <td>${data.in}</td>
                <td>${data.out}</td>
            </tr>
        `).join('');
    }

    async play () {
        await this.renderInvenTable()
        const trs = document.querySelectorAll("#inventory-table tr td:nth-child(4)")
        this.readyButton.onclick = (e) => {
            if (trs.length == 0) return
            this.habisButton.dataset.status = "off"
            const status = e.target.dataset.status
            console.log(status)
            if (status == "on") {
                trs.forEach(tr => tr.parentElement.classList.remove("dis-none"))
                e.target.dataset.status = "off"
            }else {
                trs.forEach(tr => tr.parentElement.classList.toggle("dis-none", (parseInt(tr.textContent) > 0) ? false : true))
                e.target.dataset.status = "on"
            }
        }
        this.habisButton.onclick = (e) => {
            if (trs.length == 0) return
            this.readyButton.dataset.status = "off"
            const status = e.target.dataset.status
            console.log(status)
            if (status == "on") {
                trs.forEach(tr => tr.parentElement.classList.remove("dis-none"))
                e.target.dataset.status = "off"
            }else {
                trs.forEach(tr => tr.parentElement.classList.toggle("dis-none", (parseInt(tr.textContent) > 0) ? true : false))
                e.target.dataset.status = "on"
            }    
        }
    }
}
