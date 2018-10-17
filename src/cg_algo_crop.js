const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

function encode(x, y, xmin, xmax, ymin, ymax){
    let c = 0;
    if(x < xmin) c |= LEFT;
    if(x > xmax) c |= RIGHT;
    if(y < ymin) c |= BOTTOM;
    if(y > ymax) c |= TOP;
    return c;
}

async function clip_line(x1, y1, x2, y2, xmin, xmax, ymin, ymax) {
    let x, y;
    let code1 = encode(x1, y1, xmin, xmax, ymin, ymax);
    let code2 = encode(x2, y2, xmin, xmax, ymin, ymax);
    while(code1 !== 0 || code2 !== 0) {
        if((code1 & code2) !== 0) return; // the same side of clip area
        let code = code1 === 0 ? code2 : code1;
        if(LEFT & code) {
            x = xmin;
            y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1);
        }
        else if(RIGHT & code) {
            x = xmax;
            y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
        }
        else if(BOTTOM & code) {
            y = ymin;
            x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
        }
        else if(TOP & code) {
            y = ymax;
            x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
        }
        if(code1 === code) {
            [x1, y1] = [x, y];
            code1 = encode(x, y, xmin, xmax, ymin, ymax);
        }
        else if(code2 === code) {
            [x2, y2] = [x, y];
            code2 = encode(x, y, xmin, xmax, ymin, ymax);
        }
    }
    //return [x1, y1, x2, y2];
    await drawline_dda(x1, y1, x2, y2, 0);
}
