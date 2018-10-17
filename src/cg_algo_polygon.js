function border(x, y, color) {
    return color === screen.getpixel(x, y);
}

async function fill_polygon_seed(x, y, color){
    let L = screen.dim;
    if(x >= -L && x <= L && y >= -L && y <= L && !border(x, y, color)){
        await screen.drawpixel(x, y, color);
        await fill_polygon_seed(x + 1, y, color);
        await fill_polygon_seed(x, y + 1, color);
        await fill_polygon_seed(x - 1, y, color);
        await fill_polygon_seed(x, y - 1, color);
    }
}

async function fill_polygon_seed_eight_way(x, y, color){
    let L = screen.dim;
    if(x >= -L && x <= L && y >= -L && y <= L && !border(x, y, color)){
        await screen.drawpixel(x, y, color);
        for(let i = -1; i <= 1; i++) {
            for(let j = -1; j <= 1; j++) {
                if(i !== 0 || j !== 0) {
                    await fill_polygon_seed_eight_way(x + i, y + j, color);
                }
            }
        }
    }
}

async function fill_polygon_scan(_x, _y, _color){
    let L = screen.dim;
    let stack = [];
    stack.push([_x, _y, _color]);
    while(stack.length) {
        let [x, y, color] = stack.pop();
        // scan left pixels
        let l = x;
        while(l >= -L && color !== screen.getpixel(l, y)) {
            await screen.drawpixel(l, y, color);
            l--;
        }
        // scan right pixels
        let r = x + 1;
        while(r <= L && color !== screen.getpixel(r, y)) {
            await screen.drawpixel(r, y, color);
            r++;
        }
        // check the above scan line, push the rightest seed
        if(y > -L){
            // 使用两个bool变量，把2n次border减少到n次border
            let rightIsBorder = 1, thisIsBorder;
            for(let nx = r - 1; nx > l; nx--){
                if(!(thisIsBorder = border(nx, y - 1, color)) && rightIsBorder){
                    stack.push([nx, y - 1, color]);
                }
                rightIsBorder = thisIsBorder;
            }
        }
        // check the below scan line, push the rightest seed
        if(y < L){
            let rightIsBorder = 1, thisIsBorder;
            for(let nx = r - 1; nx > l; nx--){
                if(!(thisIsBorder = border(nx, y + 1, color)) && rightIsBorder){
                    stack.push([nx, y + 1, color]);
                }
                rightIsBorder = thisIsBorder;
            }
        }
    }
}
