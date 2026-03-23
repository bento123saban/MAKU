import DB_Play from "./js/indexedDB"
import {UI_Play} from "./js/UI";


import trx from "./js/transaksi"
import form from "./js/form";
import inv from "./js/inventory"

// alert("tes")
class appCTRL {
	constructor () {
		this.TRX 	= new trx()
		this.FORM	= new form()
		this.INV 	= new inv()
	}
	init () {
		
	}
	auth () {

	}

	play () {
		document.addEventListener("DOMContentLoaded", () => {
			DB_Play()
			UI_Play()
			
			this.TRX.play()
			this.FORM.play()
			this.INV.play()
		})
	}
}

new appCTRL().play()