const T = [
    [[1, 0], [0, 1]], // x>0, y>0, k<=1, (2, 1) -> (2, 1)
    [[0, 1], [1, 0]], // x>0, y>0, k>1, (1, 2) -> (2, 1)
    [[1, 0], [0, -1]], // x>0, y<0, k<=1, (2, -1) -> (2, 1)
    [[0, 1], [-1, 0]], // x>0, y<0, k>1, (1, -2) -> (2, 1)
    [[-1, 0], [0, 1]], // x<0, y>0, k<=1, (-2, 1) -> (2, 1)
    [[0, -1], [1, 0]], // x<0, y>0, k>1, (-1, 2) -> (2, 1)
    [[-1, 0], [0, -1]], // x<0, y<0, k<=1, (-2, -1) -> (2, 1)
    [[0, -1], [-1, 0]], // x<0, y<0, k>1, (-1, -2) -> (2, 1)
];

function trans(x1, y1, x2, y2){
    let x = x2 - x1, y = y2 - y1;
    let xsign = x < 0, ysign = y < 0, k_over_1 = Math.abs(x) < Math.abs(y);
    let index = (xsign << 2) + (ysign << 1) + k_over_1;
    let w = T[index];
    let w_ = math.inv(w);
    [x, y] = math.multiply([x, y], w);
    return [0, 0, x, y, w_];
}

async function drawline_dda (x1, y1, x2, y2, color) {
    let dm = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); // 迭代次数
    let dx = (x2 - x1) / dm; // x步长
    let dy = (y2 - y1) / dm; // y步长
    let x = x1 + 0.5;
    let y = y1 + 0.5;
    function log(){
        panel.log_list.push({
            pix: {
                x: Math.floor(x),
                y: Math.floor(y),
                color: color
            },
            log: 'x = ' + x.toFixed(2) + ', y = ' + y.toFixed(2) +
            ', dx = ' + dx.toFixed(2) + ', dy = ' + dy.toFixed(2)
        });
    }
    for(let i = 0; i <= dm; i++){
        log();
        await screen.drawpixel(Math.floor(x), Math.floor(y), color);
        x += dx;
        y += dy;
    }
}
async function drawline_mid (_x1, _y1, _x2, _y2, color) {
    [x1, y1, x2, y2, w_] = trans(_x1, _y1, _x2, _y2);

    let a, b, d, x, y, tmpx, tmpy;
    function log(){
        panel.log_list.push({
            pix: {
                x: x,
                y: y,
                color: color
            },
            log: 'x = ' + x + ', y = ' + y +
            ', d = ' + d.toFixed(2)
        });
    }
    a = y1 - y2;
    b = x2 - x1;
    d = a + b / 2;
    x = x1; y = y1;
    log();
    await screen.drawpixel(x, y, color);
    while(x < x2){
        if(d < 0) {
            x++; y++; d = d+a+b;
        }
        else{
            x++; d += a;
        }
        log();
        [tmpx, tmpy] = math.add(math.multiply([x, y], w_), [_x1, _y1]);
        await screen.drawpixel(tmpx, tmpy, color);
    }
}

async function drawline_bresenham(_x1, _y1, _x2, _y2, color) {
    [x1, y1, x2, y2, w_] = trans(_x1, _y1, _x2, _y2);

    let dx = x2, dy = y2;
    let x = x1, y = y1;
    let d = 2 * dy - dx;

    function log(){
        let _x = x;
        let _y = y;
        panel.log_list.push({
            pix: {
                x: _x,
                y: _y,
                color: color
            },
            log: 'x = ' + _x + ', y = ' + _y +
            ', d = ' + d.toFixed(2)
        });
    }
    log();
    let tmpx, tmpy;
    await screen.drawpixel(x, y, color);
    while(x !== x2) {
        if(d < 0) {
            d += 2 * dy;
        }
        else {
            y += 1;
            d += 2 * (dy - dx);
        }
        x += 1;
        log();
        [tmpx, tmpy] = math.add(math.multiply([x, y], w_), [_x1, _y1]);
        await screen.drawpixel(tmpx, tmpy, color);
    }
}
