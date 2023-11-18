const url = new URL(window.location.href);
const grid = url.searchParams.get("grid");
let selectedCell = []
let isClicking = false
const typingModes = {
    Main: 0,
    Middle: 1,
    Upper: 2,
}
let currentTypingMode = typingModes.Main
let shiftReleaseTime;

let wrongKeyValueEl = document.getElementById("wrongKeyValue");
let popupWrongKeyEl = document.getElementById("popupWrongKey")
let timer;

init()
function init(){
    const cellEls = document.querySelectorAll("div.cell")
    for(let i=0 ; i<cellEls.length ; i++){
        const cellEl = cellEls[i]
        if(cellEl){
            const value = grid[(parseInt(cellEl.dataset.row)-1) * 9 + parseInt(cellEl.dataset.column) - 1]
            const mainCellEl = cellEl.getElementsByClassName("main")
            if(mainCellEl && mainCellEl.length > 0 && mainCellEl[0]){
                if(!value || value == '*'){
                    mainCellEl[0].textContent = ''
                } else {
                    mainCellEl[0].textContent = value
                    mainCellEl[0].parentElement.classList.add("initial-value")
                }
                mainCellEl[0].parentElement.classList.add("valid-value")
                mainCellEl[0].parentElement.classList.remove("invalid-value")
            }
        }
    }
}

document.addEventListener('keydown',function (event) {

    let isShiftPressed = (Date.now() - shiftReleaseTime) < 50
    
    const figures = ['1','2','3','4','5','6','7','8','9']
    const ctrlFiguresKey = ['&','é','"',"'",'(','-','è','_','ç']
    const shiftFiguresKey = ["End", "ArrowDown", "PageDown", "ArrowLeft", "Clear", "ArrowRight", "Home", "ArrowUp", "PageUp"]
    const unprocessedKeys = ["Alt", "AltGraph", "CapsLock", "Tab", "Escape", "Meta", "Insert", "Home", "End", "PageUp", "PageDown", "ScrollLock", "Pause", "NumLock", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]

    // ctrl + figure changes tab
    if(((figures.includes(event.key) || ctrlFiguresKey.includes(event.key)) && event.ctrlKey)){
        event.preventDefault();
    }

    if (figures.includes(event.key) || ctrlFiguresKey.includes(event.key) || (shiftFiguresKey.includes(event.key) && isShiftPressed) || (event.key == "Backspace" || event.key == "Delete")) {
        const isDelete = (event.key == "Backspace" || event.key == "Delete")
        // Set value
        for(let i=0 ; i<selectedCell.length ; i++){
            let actualFigure = event.key
            if(ctrlFiguresKey.includes(event.key)){
                actualFigure = ctrlFiguresKey.indexOf(event.key) + 1
            }
            if(shiftFiguresKey.includes(event.key)){
                actualFigure = shiftFiguresKey.indexOf(event.key) + 1
            }
            const cellEl = document.querySelector("div.cell[data-column='"+selectedCell[i].column+"'][data-row='"+selectedCell[i].row+"']")
            if(cellEl && !cellEl.classList.contains("initial-value")){
                if(currentTypingMode == typingModes.Main && !isShiftPressed){
                    const mainEls = cellEl.getElementsByClassName("main")
                    if(mainEls && mainEls.length > 0 && mainEls[0]){
                        if(isDelete || mainEls[0].textContent == actualFigure){
                            mainEls[0].textContent = ""
                            const upperNoteEls = cellEl.getElementsByClassName("upper-note")
                            if(upperNoteEls && upperNoteEls.length > 0 && upperNoteEls[0])
                                upperNoteEls[0].classList.remove("hidden")
                            const middleNoteEls = cellEl.getElementsByClassName("middle-note")
                            if(middleNoteEls && middleNoteEls.length > 0 && middleNoteEls[0])
                                middleNoteEls[0].classList.remove("hidden")
                        } else {
                            mainEls[0].textContent = actualFigure
                            const upperNoteEls = cellEl.getElementsByClassName("upper-note")
                            if(upperNoteEls && upperNoteEls.length > 0 && upperNoteEls[0])
                                upperNoteEls[0].classList.add("hidden")
                            const middleNoteEls = cellEl.getElementsByClassName("middle-note")
                            if(middleNoteEls && middleNoteEls.length > 0 && middleNoteEls[0])
                                middleNoteEls[0].classList.add("hidden")
                        }
                    }
                } else if(currentTypingMode == typingModes.Upper || isShiftPressed) {
                    const upperNoteEls = cellEl.getElementsByClassName("upper-note")
                    if(upperNoteEls && upperNoteEls.length > 0 && upperNoteEls[0]){
                        if(isDelete){
                            upperNoteEls[0].textContent = ""
                        } else {
                            upperNoteEls[0].textContent = addOrRemove(upperNoteEls[0].textContent,actualFigure)
                        }
                    }
                } else if (currentTypingMode == typingModes.Middle) {
                    const middleNoteEls = cellEl.getElementsByClassName("middle-note")
                    if(middleNoteEls && middleNoteEls.length > 0 && middleNoteEls[0]){
                        if(isDelete){
                            middleNoteEls[0].textContent = ""
                        } else {
                            middleNoteEls[0].textContent = addOrRemove(middleNoteEls[0].textContent,actualFigure)
                        }
                    }
                }
            }
        }
            
        // Check for errors
        // Set everything to valid
        const cellEls = document.querySelectorAll("div.cell")
        for(let i=0 ; i<cellEls.length ; i++){
            const cellEl = cellEls[i]
            if(cellEl){
                cellEl.classList.remove("invalid-value")
                cellEl.classList.add("valid-value")
            }
        }
        // Set to invalid if needed
        for(let i=1 ; i<=9 ; i++){
            // Columns
            const columnCellEls = document.querySelectorAll("div.cell[data-column='"+i+"'] > .main")
            const usedFiguresCol = {}
            for(let j=0 ; j<columnCellEls.length ; j++){
                const columnCellEl = columnCellEls[j]
                if(columnCellEl.textContent && columnCellEl.textContent != ''){
                    if(usedFiguresCol[columnCellEl.textContent] >= 1){
                        usedFiguresCol[columnCellEl.textContent] = 2
                    } else {
                        usedFiguresCol[columnCellEl.textContent] = 1
                    }
                }
            }
            for(let j=0 ; j<columnCellEls.length ; j++){
                const columnCellEl = columnCellEls[j]
                if(columnCellEl.textContent && columnCellEl.textContent != '' && usedFiguresCol[columnCellEl.textContent] == 2){
                    columnCellEl.parentElement.classList.remove("valid-value")
                    columnCellEl.parentElement.classList.add("invalid-value")
                }
            }

            // Row
            const rowCellEls = document.querySelectorAll("div.cell[data-row='"+i+"'] > .main")
            const usedFiguresRow = {}
            for(let j=0 ; j<rowCellEls.length ; j++){
                const rowCellEl = rowCellEls[j]
                if(rowCellEl.textContent && rowCellEl.textContent != ''){
                    if(usedFiguresRow[rowCellEl.textContent] >= 1){
                        usedFiguresRow[rowCellEl.textContent] = 2
                    } else {
                        usedFiguresRow[rowCellEl.textContent] = 1
                    }
                }
            }
            for(let j=0 ; j<rowCellEls.length ; j++){
                const rowCellEl = rowCellEls[j]
                if(rowCellEl.textContent && rowCellEl.textContent != '' && usedFiguresRow[rowCellEl.textContent] == 2){
                    rowCellEl.parentElement.classList.remove("valid-value")
                    rowCellEl.parentElement.classList.add("invalid-value")
                }
            }

            // Boxes
            const boxCellEls = document.querySelectorAll("div.cell[data-box='"+i+"'] > .main")
            const usedFiguresBox = {}
            for(let j=0 ; j<boxCellEls.length ; j++){
                const boxCellEl = boxCellEls[j]
                if(boxCellEl.textContent && boxCellEl.textContent != ''){
                    if(usedFiguresBox[boxCellEl.textContent] >= 1){
                        usedFiguresBox[boxCellEl.textContent] = 2
                    } else {
                        usedFiguresBox[boxCellEl.textContent] = 1
                    }
                }
            }
            for(let j=0 ; j<boxCellEls.length ; j++){
                const boxCellEl = boxCellEls[j]
                if(boxCellEl.textContent && boxCellEl.textContent != '' && usedFiguresBox[boxCellEl.textContent] == 2){
                    boxCellEl.parentElement.classList.remove("valid-value")
                    boxCellEl.parentElement.classList.add("invalid-value")
                }
            }
        }
            
    } else if (event.key == "Shift"){
        changeTypingMode(typingModes.Upper)
    } else if (event.key == "Control"){
        changeTypingMode(typingModes.Middle)
    } else if (!unprocessedKeys.includes(event.key)){
        wrongKeyValueEl.textContent = event.key == ' ' ? '␣' : event.key == 'Enter' ? '⏎' : event.key
        let opacity = 0
        let direction = 1;
        popupWrongKeyEl.style.display = 'flex';
        clearInterval(timer);
        timer = setInterval(function () {
            if (opacity > 170 && direction == 1){
                direction = -1
            } else if(opacity < 5 && direction == -1){
                clearInterval(timer);
                popupWrongKeyEl.style.display = 'none';
            }
            popupWrongKeyEl.style.opacity = opacity / 100.;
            popupWrongKeyEl.style.filter = 'alpha(opacity=' + opacity + ")";
            opacity += 10 * direction;
        }, 10);
    }
})

document.addEventListener("keyup", function(event) {
    if(event.key == "Shift") {
        shiftReleaseTime = Date.now();
        changeTypingMode(typingModes.Main)
    } else if(event.key == "Control"){
        changeTypingMode(typingModes.Main)
    }
})

const cellEls = document.getElementsByClassName("cell")
for(let i=0 ; i<cellEls.length ; i++){
    const cellEl = cellEls[i]
    cellEl.addEventListener("mousedown", function(e) {
        isClicking = true
        if(e.ctrlKey || e.shiftKey){
            addSelectedCells({column: cellEl.dataset.column, row: cellEl.dataset.row})
        } else {
            setSelectedCells([{column: cellEl.dataset.column, row: cellEl.dataset.row}])
        }
    })
    cellEl.addEventListener("mouseenter", function(e) {
        if(isClicking){
            addSelectedCells({column: cellEl.dataset.column, row: cellEl.dataset.row})
        }
    })
}

document.addEventListener("mouseup", function(e) {
    if(e.button == 0){
        isClicking = false
    }
})

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
        } else {
        }
    }
    navigator.clipboard.writeText(exportValue);
    alert("Le sudoku a été copié !");
})

function setSelectedCells(cells){
    const oldFocusedEls = document.querySelectorAll(".cell.focused");
    for(let i=0 ; i<oldFocusedEls.length ; i++){
        if(oldFocusedEls[i]){
            oldFocusedEls[i].classList.remove("focused")
        }
    }
    selectedCell = cells
    for(let i=0 ; i<cells.length ; i++){
        const cellEl = document.querySelector("div.cell[data-column='"+cells[i].column+"'][data-row='"+cells[i].row+"']")
        if(cellEl){
            cellEl.classList.add("focused")
        }
    }
}
function addSelectedCells(cell){
    let cellFound = false
    for(let i=0 ; i<selectedCell.length ; i++){
        if(selectedCell[i].column == cell.column && selectedCell[i].row == cell.row){
            selectedCell.splice(i,1)
            cellFound = true
            const cellEl = document.querySelector("div.cell[data-column='"+cell.column+"'][data-row='"+cell.row+"']")
            if(cellEl){
                cellEl.classList.remove("focused")
            }
            break;
        }
    }
    if(!cellFound){
        selectedCell.push(cell)
        const cellEl = document.querySelector("div.cell[data-column='"+cell.column+"'][data-row='"+cell.row+"']")
        if(cellEl){
            cellEl.classList.add("focused")
        }
    }
    
}

// Disable draging the board as an image
document.ondragstart = function() { return false; };

const mainTypingModeButtonEl = document.getElementById("mainTypingModeButton")
const upperTypingModeButtonEl = document.getElementById("upperTypingModeButton")
const middleTypingModeButtonEl = document.getElementById("middleTypingModeButton")
if(mainTypingModeButtonEl){
    mainTypingModeButtonEl.addEventListener("click", function() {
        changeTypingMode(typingModes.Main)
    })
}
if(upperTypingModeButtonEl){
    upperTypingModeButtonEl.addEventListener("click", function() {
        changeTypingMode(typingModes.Upper)
    })
}
if(middleTypingModeButtonEl){
    middleTypingModeButtonEl.addEventListener("click", function() {
        changeTypingMode(typingModes.Middle)
    })
}

function changeTypingMode(newTypingMode){
    if(mainTypingModeButtonEl)
        mainTypingModeButtonEl.classList.remove("active-button")
    if(upperTypingModeButtonEl)
        upperTypingModeButtonEl.classList.remove("active-button")
    if(middleTypingModeButtonEl)
        middleTypingModeButtonEl.classList.remove("active-button")
    currentTypingMode = newTypingMode
    switch(newTypingMode){
        case typingModes.Main:
            if(mainTypingModeButtonEl)
            mainTypingModeButtonEl.classList.add("active-button")
            break;
        case typingModes.Upper:
            if(upperTypingModeButtonEl)
                upperTypingModeButtonEl.classList.add("active-button")
            break;
        case typingModes.Middle:
            if(middleTypingModeButtonEl)
                middleTypingModeButtonEl.classList.add("active-button")
            break;
    }
}

function addOrRemove(str, char){
    if(str.includes(char)){
        const index = str.indexOf(char)
        return str.substring(0, index) + str.substring(index + 1);
    } else {
        return str + char
    }
}