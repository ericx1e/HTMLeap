const mapDict = {
    '~': 'blank',
    '#': 'wall',
    '=': 'wall',
    '⚑': 'spawn',
    '⚐': 'checkpoint',
    'o': 'finish',
    '^': 'kill',
    '+': 'kill',
    '>': 'kill',
    '<': 'kill',
    'O': 'wall',
    '5': 'wall',
    '4': 'wall',
    '3': 'wall',
    '2': 'wall',
    '1': 'wall',
}

let keyInputs = {
    "ArrowLeft": false,
    "ArrowRight": false,
    "ArrowUp": false,
    "ArrowDown": false,
}

let startTime = new Date().getTime()
let time = 0
let deaths = 0

let mapGrid = []

let scale = 1

let player = {
    r: 0,
    c: 0,
    speed: 0.5,
    jump: 0.7,
    char: '0',
    yv: 0,
    touchingWall: false,
}

// generateLevel()
// update()

let rawFile = new XMLHttpRequest();
let allText;
rawFile.open("GET", 'map.txt', false);
rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
            allText = rawFile.responseText;
        }
    }
}
rawFile.send(null)

let generating = false
let genR = 0
let genC = 0
let allTextSplit = allText.split('\n')

let totalRows = allTextSplit.length
let totalCols = allTextSplit[0].length

allTextSplit.forEach(row => {
    totalCols = Math.max(totalCols, row.length)
})

let spawn = {
    r: 0,
    c: 0
}

let animation = false

if (animation) {
    generating = true
    let genTimer = window.setInterval(() => {
        if (!mapGrid[genR]) {
            mapGrid[genR] = []
        }
        let nextChar = allTextSplit[genR].charAt(genC)
        mapGrid[genR][genC] = nextChar
        if (mapDict[nextChar] == 'spawn') {
            player.r = genR
            player.c = genC
            spawn.r = genR
            spawn.c = genC
        }
        genC++
        if (genC >= allTextSplit[genR].length) {
            genR++
            genC = 0
        }
        if (genR >= allTextSplit.length) {
            clearInterval(genTimer)
            generating = false
            return
        }
    }, 5)
} else {
    allText.split('\n').forEach((line, r) => {
        mapGrid.push(line.split(''))
        for (let c = 0; c < line.length; c++) {
            if (mapDict[line.charAt(c)] == 'spawn') {
                player.r = r
                player.c = c
                spawn.r = r
                spawn.c = c
            }
        }
    })
}

window.setInterval(update, 30)
window.setInterval(slowUpdate, 10)
window.setInterval(slowerUpdate, 700)

function update() {
    let text = []
    let hidden = false

    for (let r = 0; r < totalRows; r++) {
        for (let a = 0; a < scale; a++) {
            for (let c = 0; c < totalCols; c++) {
                for (let b = 0; b < scale; b++) {
                    if (generating) {
                        if (!mapGrid[r]) {
                            // text.push(String.fromCharCode(parseInt(Math.random() * 12) + 35))
                        } else {
                            if (mapGrid[r][c]) {
                                if (mapGrid[r][c] == ',' || mapGrid[r][c] == '=') {
                                    text.push('&nbsp')
                                } else {
                                    text.push(mapGrid[r][c])
                                }
                            } else {
                                // text.push(String.fromCharCode(parseInt(Math.random() * 12) + 35))
                            }
                        }
                    } else {
                        curChar = mapGrid[r][c]
                        if (r == parseInt(player.r) && c == parseInt(player.c)) {
                            text.push(player.char)
                            if (mapDict[curChar] == 'checkpoint') {
                                spawn.r = r
                                spawn.c = c
                                mapGrid[r][c] = Object.keys(mapDict).find(key => mapDict[key] === 'spawn')
                            }
                        } else {
                            if (curChar == 'H') {
                                hidden = !hidden
                            }
                            if (hidden) {
                                let dr = r - parseInt(player.r)
                                let dc = c - parseInt(player.c)
                                if (dr * dr + dc * dc < 15) {
                                    if (curChar == ',' || curChar == 'H') {
                                        text.push('&nbsp')
                                    } else {
                                        text.push(curChar)
                                    }
                                } else {
                                    text.push('@')
                                }
                            } else {
                                if (curChar == ',' || curChar == 'H' || mapGrid[r][c] == '=') {
                                    let dr = r - parseInt(player.r)
                                    let dc = c - parseInt(player.c)
                                    if (mapGrid[r][c] == '=' && dr * dr + dc * dc < 9) {
                                        text.push(curChar)
                                    } else {
                                        text.push('&nbsp')
                                    }
                                } else {
                                    switch (curChar) {
                                        case '<':
                                            text.push('&lt')
                                            break
                                        case '>':
                                            text.push('&gt')
                                            break
                                        default:
                                            text.push(curChar)
                                            break
                                    }
                                }
                            }
                        }
                    }
                }
            }
            text.push('<br>')
        }
    }
    document.getElementById("game").innerHTML = text.join('')

    if (!generating) {

        if (keyInputs["ArrowLeft"]) {
            leftHandler()
        }

        if (keyInputs["ArrowRight"]) {
            rightHandler()
        }

        if (keyInputs["ArrowUp"]) {
            upHandler()
        }

        if (keyInputs["ArrowDown"]) {
            downHandler()
        }

        checkCollision()

        player.r += player.yv
        checkCollision()
        if (player.yv < 0 && player.touchingWall) {
            player.r -= player.yv
            player.yv = 0
        }

        if (touchingGround()) {
            player.yv = 0
        } else {
            player.yv += 0.05
        }

        player.yv = Math.min(player.yv, 1)
    }

    time = parseInt((new Date().getTime() - startTime) / 1000)
    document.getElementById("scoreboard").innerHTML = `Time: ${time} &emsp; Deaths: ${deaths}`
}

function slowUpdate() {
    let newMapGrid = []
    for (let r = 0; r < totalRows; r++) {
        newMapGrid[r] = []
        for (let c = 0; c < totalCols; c++) {
            let curChar = mapGrid[r][c]
            newMapGrid[r][c] = curChar
        }
    }
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            let curChar = mapGrid[r][c]
            if (mapGrid[r][c]) {
                switch (curChar) {
                    case '<':
                        newMapGrid[r][c] = ','
                        if (mapDict[mapGrid[r][c - 1]] != 'wall') {
                            newMapGrid[r][c - 1] = '<'
                        }
                        break
                    case '>':
                        newMapGrid[r][c] = ','
                        if (mapDict[mapGrid[r][c + 1]] != 'wall') {
                            newMapGrid[r][c + 1] = '>'
                        }
                        break
                }
            }
        }
    }
    mapGrid = newMapGrid
}

function slowerUpdate() {
    let newMapGrid = []
    for (let r = 0; r < totalRows; r++) {
        newMapGrid[r] = []
        for (let c = 0; c < totalCols; c++) {
            let curChar = mapGrid[r][c]
            newMapGrid[r][c] = curChar
        }
    }
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            let curChar = mapGrid[r][c]
            if (mapGrid[r][c]) {
                switch (curChar) {
                    case 'O':
                        if (mapGrid[r - 1][c] == '·') {
                            if (parseInt(player.r) == r - 1 && parseInt(player.c) == c) {
                                player.r--
                            }
                            newMapGrid[r - 1][c] = 'O'
                            newMapGrid[r][c] = '5'
                        }
                        else if (mapGrid[r + 1][c] == '·') {
                            newMapGrid[r + 1][c] = 'O'
                            newMapGrid[r][c] = '5'
                        }
                        else if (mapGrid[r][c - 1] == '·') {
                            newMapGrid[r][c - 1] = 'O'
                            newMapGrid[r][c] = '5'
                        }
                        else if (mapGrid[r][c + 1] == '·') {
                            newMapGrid[r][c + 1] = 'O'
                            newMapGrid[r][c] = '5'
                        }
                        break
                    case '5':
                        newMapGrid[r][c] = '4'
                        break
                    case '4':
                        newMapGrid[r][c] = '3'
                        break
                    case '3':
                        newMapGrid[r][c] = '2'
                        break
                    case '2':
                        newMapGrid[r][c] = '1'
                        break
                    case '1':
                        newMapGrid[r][c] = '·'
                        break
                    case '+':
                        if (mapDict[newMapGrid[r][c + 1]] != 'wall') {
                            newMapGrid[r][c + 1] = '>'
                        }
                        if (mapDict[newMapGrid[r][c - 1]] != 'wall') {
                            newMapGrid[r][c - 1] = '<'
                        }
                        break
                }
            }
        }
    }
    mapGrid = newMapGrid
}

window.addEventListener('click', () => {
})

window.addEventListener('keydown', (event) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
        keyInputs[event.key] = true
    }
    // const callback = {
    //     "ArrowLeft": leftHandler,
    //     "ArrowRight": rightHandler,
    //     "ArrowUp": upHandler,
    //     "ArrowDown": downHandler,
    // }[event.key]
    // callback?.()
}, false)

window.addEventListener('keyup', (event) => {
    keyInputs[event.key] = false
})

function leftHandler() {
    player.c -= player.speed
    checkCollision()
    if (player.touchingWall) {
        player.c += player.speed
        return
    }
    player.r += player.yv
    checkCollision()
    if (player.touchingWall) {
        player.c += player.speed
    }
    player.r -= player.yv
}

function rightHandler() {
    player.c += player.speed
    checkCollision()
    if (player.touchingWall) {
        player.c -= player.speed
        return
    }

    player.r += player.yv
    checkCollision()
    if (player.touchingWall) {
        player.c -= player.speed
    }
    player.r -= player.yv
}

function upHandler() {
    if (touchingGround()) {
        player.yv = -player.jump
    }
}

function downHandler() {
}

function checkCollision() {
    if (player.r < 0 || player.r >= totalRows || player.c < 0 || player.c >= totalCols) {
        die()
        return
    }
    player.touchingWall = false
    switch (mapDict[mapGrid[parseInt(player.r)][parseInt(player.c)]]) {
        case 'wall':
            player.touchingWall = true
            break;
        case 'kill':
            die()
            break
    }
    // return mapDict[mapGrid[parseInt(player.r)][parseInt(player.c)]] == 'wall'
}

function touchingGround() {
    if (player.r < 0 || player.r + 1 >= totalRows || player.c < 0 || player.c >= totalCols) return false
    return mapDict[mapGrid[parseInt(player.r + 1)][parseInt(player.c)]] == 'wall'
}

function die() {
    player.r = spawn.r
    player.c = spawn.c
    deaths++
}