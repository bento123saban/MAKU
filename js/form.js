import { request } from "./request"


export default class form {
    constructor () {
        this.jenisInput = document.querySelector("#form-jenis-input")
        this.submitBtn  = document.querySelector("#form-submit-button")
        this.forms      = document.querySelectorAll(".forms")

        this.itemsUpdateButtons = document.querySelectorAll(".items-update-button")
    }

    async updateBarang () {
        this.itemsUpdateButtons.array.forEach(element => {
            element.onclick = () => {
                
            }
        });
        return await window.DB.getAll("barang")
    }





    play () {
        // const dataBarang = this.getBarang()
        // console.log(dataBarang)
        this.jenisInput.onchange = (e) => {
            const value = e.target.value
            console.log(value)
            if (value == "masuk") {
                this.submitBtn.classList.remove("blue", "orange", "grey", "purple")
                this.submitBtn.classList.add("green")
            }
            else if (value == "keluar") {
                this.submitBtn.classList.remove("green", "orange", "grey", "purple")
                this.submitBtn.classList.add("blue")
            }
            else if (value == "tambah") {
                this.submitBtn.classList.remove("blue", "green", "grey", "purple")
                this.submitBtn.classList.add("orange")
            }
            else if (value == "edit") {
                this.submitBtn.classList.remove("blue", "green", "grey", "orange")
                this.submitBtn.classList.add("purple")
            }
            else return
            this.forms.forEach(form => {
                if (form.dataset.form == value) form.classList.remove("dis-none")
                else form.classList.add("dis-none") 
            })
        }
    }
}