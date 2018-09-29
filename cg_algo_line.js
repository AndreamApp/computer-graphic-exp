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
async function drawline_mid (x1, y1, x2, y2, color) {
    let a, b, d, x, y, flag = 0;
    function log(){
        let _x = flag ? y : x;
        let _y = flag ? x : y;
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
    if(Math.abs(x2 - x1) < Math.abs(y2 - y1)){
        // 斜率大于1，交换坐标
        [x1, y1] = [y1, x1];
        [x2, y2] = [y2, x2];
        flag = 1;
    }
    if(x1 > x2){
        // 交换左右坐标
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
    }
    a = y1 - y2;
    b = x2 - x1;
    d = a + b / 2;
    if(y1 < y2){
        x = x1; y = y1;
        log();
        await screen.drawpixel(x, y, color, flag);
        while(x < x2){
            if(d < 0) {
                x++; y++; d = d+a+b;
            }
            else{
                x++; d += a;
            }
            log();
            await screen.drawpixel(x, y, color, flag);
        }
    }
    else{
        x = x2; y = y2;
        log();
        await screen.drawpixel(x, y, color, flag);
        while(x > x1){
            if(d < 0){
                x--; y++; d = d-a+b;
            }
            else{
                x--; d -= a;
            }

            log();
            await screen.drawpixel(x, y, color, flag);
        }
    }
}
async function drawline_bresenham (x1, y1, x2, y2, color) {
    // await this.drawpixel(x1, y1, color);
    let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    let flag = 0;
    // 将斜率变为 0 < |k| < 1
    if(dx < dy){
        flag = 1;
        [x1, y1] = [y1, x1];
        [x2, y2] = [y2, x2];
        [dx, dy] = [dy, dx];
    }
    let tx = (x2 - x1) > 0 ? 1 : -1;
    let ty = (y2 - y1) > 0 ? 1 : -1;
    let curx = x1, cury = y1;
    let dS = 2 * dy, dT = 2 * (dy - dx);
    let d = dS - dx;

    function log(){
        let _x = flag ? cury : curx;
        let _y = flag ? curx : cury;
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
    await screen.drawpixel(curx, cury, color, flag);
    while(curx !== x2) {
        if(d < 0) {
            d += dS;
        }
        else {
            cury += ty;
            d += dT;
        }
        curx += tx;
        log();
        await screen.drawpixel(curx, cury, color, flag);
    }
}