async function drawpixel_eight_way(x0, y0, x, y, color) {
    await screen.drawpixel(x0 + x, y0 + y, color);
    await screen.drawpixel(x0 + x, y0 - y, color);
    await screen.drawpixel(x0 - x, y0 + y, color);
    await screen.drawpixel(x0 - x, y0 - y, color);
    await screen.drawpixel(x0 + y, y0 + x, color);
    await screen.drawpixel(x0 + y, y0 - x, color);
    await screen.drawpixel(x0 - y, y0 + x, color);
    await screen.drawpixel(x0 - y, y0 - x, color);
}

async function drawpixel_four_way(x0, y0, x, y, color) {
    await screen.drawpixel(x0 + x, y0 + y, color);
    await screen.drawpixel(x0 + x, y0 - y, color);
    await screen.drawpixel(x0 - x, y0 + y, color);
    await screen.drawpixel(x0 - x, y0 - y, color);
}

async function draw_circle_mid(x0, y0, r, color) {
    let x = 0, y = Math.floor(r);
    let d = 1 - r;

    function log(){
        panel.log_list.push({
            pix: {
                x: x,
                y: y,
                color: color
            },
            log: 'x = ' + x + ', y = ' + y +
            ', delta = ' + d
        });
    }
    while(x < y) {
        log();
        await drawpixel_eight_way(x0, y0, x, y, color);
        if(d < 0){
            d += 2 * x + 3;
        }
        else{
            d += 2 * (x - y) + 5;
            y--;
        }
        x++;
    }
    if(x === y) {
        await drawpixel_eight_way(x0, y0, x, y, color);
    }
}

async function draw_circle_bresenham(x0, y0, r, color) {
    let x = 0, y = Math.floor(r);
    let d = 2*(1 - r);
    let HD, DV;

    function log(){
        panel.log_list.push({
            pix: {
                x: x,
                y: y,
                color: color
            },
            log: 'x = ' + x + ', y = ' + y +
            ', delta = ' + d +
            ', HD = ' + HD +
            ', DV = ' + DV
        });
    }
    while(y > x) {
        await drawpixel_eight_way(x0, y0, x, y, color);
        HD = 2 * d + 2 * y - 1;
        DV = 2 * d - 2 * x - 1;
        log();
        if(d < 0 && HD < 0) {
            x++;
            d = d + 2 * x + 1;
        }
        else if(d > 0 && DV < 0) {
            y--;
            d = d - 2 * y + 1;
        }
        else{
            x++;
            y--;
            d = d + 2 * x - 2 * y + 2;
        }
    }
    if(x === y) {
        await drawpixel_eight_way(x0, y0, x, y, color);
    }
}

async function draw_ellipse(x0, y0, a, b, color) {
    let x = 0, y = b;
    let d = 0;
    while(a*a*y > b*b*x) {
        await drawpixel_four_way(x0, y0, x, y, color);
        d = b*b*(x+1)*(x+1) + a*a*(y-0.5)*(y-0.5) - a*a*b*b;
        if(d < 0){
            x++;
        }
        else{
            x++;
            y--;
        }
    }
    while(y >= 0){
        await drawpixel_four_way(x0, y0, x, y, color);
        d = b*b*(x+0.5)*(x+0.5) + a*a*(y-1)*(y-1) - a*a*b*b;
        if(d < 0){
            x++;
            y--;
        }
        else{
            y--;
        }
    }
}
