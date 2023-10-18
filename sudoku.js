const url = new URL(window.location.href);
const grid = url.searchParams.get("grid");

const inputEls = document.getElementsByTagName("input")
init()
function init() {
    for(let inputEl of inputEls){
        const value = grid[(parseInt(inputEl.dataset.row)-1) * 9 + parseInt(inputEl.dataset.column) - 1]
        if(!value || value == '*'){
            inputEl.value = ''
        } else {
            inputEl.value = value
        }
        inputEl.classList.add("valid-value")
        inputEl.classList.remove("invalid-value")
        
    }
}
for(let inputEl of inputEls){
    inputEl.addEventListener("input", inputListener)
}


function inputListener() {
    let figures = ['1','2','3','4','5','6','7','8','9']
    this.classList.remove("valid-value")
    this.classList.remove("invalid-value")
    // Valid input
    if(!(this.value in figures)){
        if(this.value == ''){
            this.classList.add("valid-value")
            return
        }
        this.classList.add("invalid-value")
        return
    }
    // Valid box
    let box = this.dataset.box
    if(box){
        let boxInputEls = document.querySelectorAll("input[data-box='"+box+"']")
        for(let boxInputEl of boxInputEls){
            if(boxInputEl != this && boxInputEl.value == this.value){
                this.classList.add("invalid-value")
                return
            }
        }
    }
    // Valid column
    let column = this.dataset.column
    if(column){
        let columnInputEls = document.querySelectorAll("input[data-column='"+column+"']")
        for(let columnInputEl of columnInputEls){
            if(columnInputEl != this && columnInputEl.value == this.value){
                this.classList.add("invalid-value")
                return
            }
        }
    }

    // Valid row
    let row = this.dataset.row
    if(row){
        let rowInputEls = document.querySelectorAll("input[data-row='"+row+"']")
        for(let rowInputEl of rowInputEls){
            if(rowInputEl != this && rowInputEl.value == this.value){
                this.classList.add("invalid-value")
                return
            }
        }
    }

    this.classList.add("valid-value")
}

const resetButtonEl = document.getElementById("resetButton")
resetButtonEl.addEventListener("click", () => {
    init()
})

function replaceChar(string, index, replacement) {
    return string.substring(0, index) + replacement + string.substring(index + replacement.length);
}
const exportButtonEl = document.getElementById("exportButton")
exportButtonEl.addEventListener("click", () => {
    let exportValue = "*".repeat(81)
    for(let inputEl of inputEls){
        const index = (parseInt(inputEl.dataset.row)-1) * 9 + parseInt(inputEl.dataset.column) - 1
        if(inputEl && inputEl.value != ''){
            exportValue = replaceChar(exportValue, index, inputEl.value)
            console.log("if",inputEl.value)
        } else {
            console.log("else",inputEl.value)
        }
    }
    console.log(exportValue)
    navigator.clipboard.writeText(exportValue);
    alert("Le sudoku a été copié !");
})