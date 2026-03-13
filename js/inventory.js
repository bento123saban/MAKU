



export default class inv {
    constructor () {
        this.jenisInput = document.querySelector("#form-jenis-input")
        this.submitBtn  = document.querySelector("#form-submit-button")
        this.forms      = document.querySelectorAll(".forms")
    }



    play () {
        this.jenisInput.onchange = (e) => {
            const value = e.target.value
            console.log(value)
            if (value == "masuk") {
                this.submitBtn.classList.remove("blue", "orange", "grey")
                this.submitBtn.classList.add("green")
            }
            else if (value == "keluar") {
                this.submitBtn.classList.remove("green", "orange", "grey")
                this.submitBtn.classList.add("blue")
            }
            else if (value == "barang") {
                this.submitBtn.classList.remove("blue", "green", "grey")
                this.submitBtn.classList.add("orange")
            }
            else return
            this.forms.forEach(form => {
                if (form.dataset.form == value) form.classList.remove("dis-none")
                else form.classList.add("dis-none") 
            })
        }
    }
}