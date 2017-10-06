//remove-start
const STATUS_LEFT = -1
const STATUS_RIGHT = 0
const STATUS_START = 1
const STATUS_NORMAL = 2

const STATUS_DOWN_START = 3
const STATUS_DOWN_END = 14//--> top 爆炸 end

const STATUS_BOOM_START = 15
const STATUS_BOOM_END = 26//--> 开始下落

const STATUS_GAME_OVER = 27

//
let c: any
let timeReverses: number
let timeCount: number
let newX: number
let state: number
let downEndTag: number

//
let x: number
let y: number
let i: number
let A: any
let a: any
let b: any

type Box = {
    i?: number
    x?: number
    y?: number
    startX?: number
    startY?: number
    endX?: number
    endY?: number
    step?: number
    isOver?: number
    toPoint?: number
    toX?: number
    toY?: number
}


let gameMap: Box[]
let timeArr: {
    newX: number,
    state: number,
    gameMap: Box[]
}[]
let tweenTo: (v: Box, n: number, y: number) => Box
let render: any
//remove-end

c = c.getContext('2d');
c.font = '40px A';

timeReverses = timeCount = 0;
newX = state = 1;
timeArr = [];
gameMap = [];

gameMap.length = 54;
gameMap.fill(null);

tweenTo = (v, n, y) => Object.assign({}, v, { startX: v.x, startY: v.y, endX: n, endY: y, step: 0 });

onkeydown = (v, n, y) => {
    ;
    if (v.keyCode == 87) timeReverses = 1;
    if (state == STATUS_NORMAL && !timeReverses) {
        ;
        if (v.keyCode == 65 && newX && newX--) state = STATUS_LEFT;
        if (v.keyCode == 68 && newX < 3 && ++newX) state = STATUS_RIGHT;
        if (v.keyCode == 83) state = STATUS_DOWN_START
    }
};

onkeyup = (v, n, y) => { ; if (v.keyCode == 87) timeReverses = 0 };

render = (v, n, y) => {
    requestAnimationFrame(render);

    if (timeReverses && timeArr.length > 0) {
        timeCount = 0;
        v = timeArr.pop();
        newX = v.newX;
        state = v.state;
        gameMap = v.gameMap
    } else {
        timeCount = state == STATUS_NORMAL || state == STATUS_GAME_OVER ? timeCount + 1 : 0;
        timeCount < 11 && timeArr.push({ newX, state, gameMap });

        //map
        if (state < STATUS_START)
            gameMap = gameMap.map((v, n, y) =>
                n > 47 && (v = state == STATUS_LEFT ? y[n + 1] : n == 48 ? null : y[n - 1]) ? tweenTo(v, n % 6, 8) : v
            );

        if (state == STATUS_START)
            gameMap = gameMap.map((v, n, y) =>
                n > 47 + newX && n < 51 + newX ? tweenTo({ x: n % 6, y: 10, i: Math.random() > 0.5 ? 1 : 2 }, n % 6, 8) : v
            );

        if (state == STATUS_BOOM_START)
            gameMap = gameMap.map((v, n, y) =>
                v.toPoint ? tweenTo(v, v.toX, v.toY) : v
            );

        if (state == STATUS_BOOM_END)
            gameMap = gameMap.map((v, n, y) =>
                v.isOver && !v.toPoint ? Object.assign({}, v, { isOver: 0, i: v.i + 1 }) : v
            );

        if (state == STATUS_DOWN_START)
            gameMap = gameMap.map(
                (v, n, y) => (
                    x = n % 6,
                    v = y.filter((v, n, y) => v && !v.isOver && n % 6 == x)[~~(n / 6)] //lazy
                ) ? tweenTo(v, x, ~~(n / 6)) : null
            );

        //结束下落
        downEndTag = STATUS_START;

        //!!!
        if (state == STATUS_DOWN_END) gameMap.map((v, n, y) => {
            A = [6, 1, 7, - 5];
            for (i = 0; i < (n % 6 == 0 || n % 6 == 5 ? 1 : 4); i++) {
                a = gameMap[A[i] + n];
                b = gameMap[- A[i] + n];
                if (a && b && a.i == v.i && b.i == v.i) {
                    downEndTag = STATUS_BOOM_START;


                    v.isOver = 1;
                    v.toPoint = 0;
                    A = v;
                    v = a;
                    if (!v.isOver) {
                        v.toPoint = v.isOver = 1;
                        v.toX = n % 6;
                        v.toY = ~~(n / 6)
                    }
                    v = b;
                    if (!v.isOver) {
                        v.toPoint = v.isOver = 1;
                        v.toX = n % 6;
                        v.toY = ~~(n / 6)
                    }
                    v = A
                }
            }
            ;
            if (v && n > 47 && downEndTag == STATUS_START)
                downEndTag = STATUS_GAME_OVER
        });


        //动画  
        gameMap = gameMap.map((v, n, y) => v ? Object.assign({}, v, {
            step: v.step == 11 ? 11 : v.step + 1,
            x: - v.startX * (v.step / 11) + v.endX * (v.step / 11) + v.startX,
            y: - v.startY * (v.step / 11) + v.endY * (v.step / 11) + v.startY
        }) : null);

        state = state == STATUS_NORMAL || state == STATUS_GAME_OVER ? state :
            state < STATUS_START ? STATUS_NORMAL :
                state == STATUS_DOWN_END ? downEndTag :
                    state == STATUS_BOOM_END ? STATUS_DOWN_START : state + 1

    }
    //draw
    i = 0;
    c.fillStyle = 'hsla(' + i + ',40%,0%,0.2)';
    c.fillRect(0, 0, 300, 500);
    gameMap.map((v, n, y) => {
        x = 50 * v.x;
        y = 450 - 50 * v.y;
        i = v.i * 35;
        c.fillStyle = 'hsla(' + i + ',40%,65%,1)';
        c.fillRect(x, y, 50, 50);
        c.fillStyle = 'hsla(' + i + ',40%,20%,1)';
        c.fillText(v.i, x + 12, y + 40);
    });
};
render()