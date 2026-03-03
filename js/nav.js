
const navGroups = document.querySelectorAll(".nav-group")
const contents  = document.querySelectorAll(".content")
export const navigation = () => {
    navGroups.forEach(nav => {
        nav.onclick = () => {
            navGroups.forEach(nv => nv.classList.remove("white"))
            nav.classList.add("white")
            contents.forEach(content => {
                if (content.id == nav.dataset.nav) content.classList.remove("dis-none")
                else content.classList.add("dis-none")
            })
        }
    })
}

const themeBtn  = document.querySelector("#theme-button")
const nav       = document.querySelector("nav")
const main      = document.querySelector("main")
export const themeChange = () => {
    themeBtn.onclick = () => {
        if (themeBtn.classList.contains("on")) {
            themeBtn.classList.remove("on")
            nav.classList.remove("green")
            nav.classList.add("black")
            main.classList.remove("white")
            main.classList.add("black")
        } else {
            themeBtn.classList.add("on")
            nav.classList.add("green")
            nav.classList.remove("black")
            main.classList.add("white")
            main.classList.remove("black")
        }
        
    }
}
