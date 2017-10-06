
let cccc = 0

const getMaxSave = (sourceCode) => {
    let arr = sourceCode.split('')//!!!!!!!!!!
    let saveArr = []// as { str: string, count: number, save: number }[]

    let f = (n) => {
        let dic = Object.create(null)

        arr.forEach((v, i) => {
            if (i < arr.length - n + 1) {
                v = arr.slice(i, i + n).join('')
                if (dic[v] == null) dic[v] = 0
                dic[v]++
            }
        })

        // a | b | c | AAAA

        for (let k in dic) {
            let count = dic[k]
            if (count != 1) {
                saveArr.push({
                    str: k,
                    count,
                    save: n * count - count - n - 1//
                })
            }
        }
    }

    for (let i = 2; i < 32; i++) {//
        f(i)
    }

    saveArr.sort((a, b) => b.save - a.save)
    if (saveArr[0] && saveArr[0].save > 0)
        return saveArr[0]
    else
        return null
}


const getTable = (sourceCode) => {
    let table = []//string[]ƒ
    for (let i = 1; i < 128; i++) {
        let s = String.fromCharCode(i)
        if (
            i != '`'.charCodeAt(0) &&
            i != '\\'.charCodeAt(0) &&
            i != '\r'.charCodeAt(0) &&
            sourceCode.indexOf(s) == -1)
            table.push(s)
    }
    return table
}

const compress = sourceCode => {
    let table = getTable(sourceCode)
    let tableStr = ''
    while (table.length > 0) {
        let oneChar = table.pop()
        let obj = getMaxSave(sourceCode)
        if (obj == null) break
        let s = obj.str
        console.log(`${++cccc} "${s}"  ${oneChar.charCodeAt(0)} count:${obj.count}  save:${obj.save}`)
        tableStr += oneChar
        sourceCode = sourceCode.split(s).join(oneChar) + oneChar + s
    }
    tableStr = tableStr.split('').reverse().join('')
    let output = '_=`' + sourceCode + '`;for(Y in $=`' + tableStr + '`)with(_.split($[Y]))_=join(pop());eval(_)'
    return output
}



let fs = require('fs')


let s = fs.readFileSync('src.ts', 'utf-8')


//
s = s.replace(/\/\/remove-start[\s\S\r\n]+?\/\/remove-end/g, '')

s = s.replace(/null/g, '0')

//去单行注释
s = s.replace(/\/\/.*/g, '')

// //去空格回车
s = s.replace(/40px /g, 'zzzzzzzzzzzzzz')
s = s.replace(/[ \r\n]+/g, '')
s = s.replace(/zzzzzzzzzzzzzz/g, '40px ')





let unesed = 'defghklmopqrstuw'
let ok = unesed.split('')

let r = (a, b) => s = s.split(a).join(b)

r('STATUS_LEFT', -1)
r('STATUS_RIGHT', 0)

r('STATUS_START', 1)
r('STATUS_NORMAL', 2)

r('STATUS_DOWN_START', 3)
r('STATUS_DOWN_END', 14)//--> top 爆炸 end

r('STATUS_BOOM_START', 15)
r('STATUS_BOOM_END', 26)//--> 开始下落

r('STATUS_GAME_OVER', 27)


let abc = unesed.split('')

    ;[
        'startX', 'startY',
        'endX', 'endY',
        'step', 'isOver',
        'toPoint', 'toX', 'toY'
    ].forEach(v => {
        s = s.split(v).join(abc.pop())
    })

    //关键词
    ;[
        'downEndTag',
        'state', 'newX',
        'gameMap', 'tweenTo',
        'render', 'timeArr', 'timeReverses', 'timeCount'
    ].forEach(v => {
        s = s.split(v).join(ok.pop())
    })


s = compress(s)
fs.writeFileSync('./../index.js', s)
console.log(s.length, s.length - 1024)