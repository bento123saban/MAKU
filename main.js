



const buttonMasuk   = document.querySelector("#maku-button-masuk"),
    buttonKeluar    = document.querySelector("#maku-button-keluar"),

    makuGroups      = document.querySelectorAll(".maku-group"),
    detailBox       = document.querySelector("#detail-box"),
    detailGroups    = document.querySelectorAll(".detail-group"),
    detailClose     = document.querySelector("#detail-box-close"),
    detailPhoto     = document.querySelector("#detail-photo-box"),
    detailPhotoCls  = document.querySelector("#detail-photo-close"),
    inventoryGroups = document.querySelectorAll(".inven-group"),
    inventoryDetail = document.querySelector("#inventory-detail"),
    inventoryClose  = document.querySelector("#inventory-detail-close"),
    inventorySearch = document.querySelector("#inven-search")





buttonMasuk.onclick = function() {
    const bars = document.querySelectorAll(".bar-masuk")
    // console.log(bars)
    if (this.dataset.status == "on") {
        this.classList.remove("green")
        this.classList.add("br-none", "clr-grey")
        this.dataset.status = "off"
        bars.forEach(bar => bar.classList.add("dis-none"))
    } else {
        this.classList.add("green")
        this.classList.remove("br-none", "clr-grey")
        this.dataset.status = "on"
        bars.forEach(bar => bar.classList.remove("dis-none"))
    }
}

buttonKeluar.onclick = function() {
    const bars = document.querySelectorAll(".bar-keluar")
    // console.log(bars)
    if (this.dataset.status == "on") {
        this.classList.remove("blue")
        this.classList.add("br-none", "clr-grey")
        this.dataset.status = "off"
        bars.forEach(bar => bar.classList.add("dis-none"))
    } else {
        this.classList.add("blue")
        this.classList.remove("br-none", "clr-grey")
        this.dataset.status = "on"
        bars.forEach(bar => bar.classList.remove("dis-none"))
    }
}

makuGroups.forEach(group => {group.onclick = () => detailBox.classList.remove("dis-none")})
detailClose.onclick = () => detailBox.classList.add("dis-none")
detailGroups.forEach(group => {group.onclick = () => detailPhoto.classList.remove("dis-none")})
detailPhotoCls.onclick = () => detailPhoto.classList.add("dis-none")


inventorySearch.onkeyup = function () {
    const value = this.value.toUpperCase()
    inventoryGroups.forEach(group => {
        const text = group.textContent.toUpperCase()
        if (text.indexOf(value) >= 0) group.classList.remove("dis-none")
        else group.classList.add("dis-none")
    })
}
inventoryClose.onclick = () => inventoryDetail.classList.add("dis-none")
inventoryGroups.forEach(group => group.onclick = () => inventoryDetail.classList.remove("dis-none"))
