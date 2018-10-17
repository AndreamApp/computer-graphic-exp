async function clip_line(x1, y1, x2, y2, xmin, xmax, ymin, ymax) {
    let x, y, code, code1, code2; await bp(ln());
    code1 = encode(x1, y1, xmin, xmax, ymin, ymax); await bp(ln());
    code2 = encode(x2, y2, xmin, xmax, ymin, ymax);
    while(await bp(ln()) && code1 !== 0 || code2 !== 0) {
        if(await bp(ln()) && (code1 & code2) !== 0) return;
        code = code1 === 0 ? code2 : code1; await bp(ln());
        if(await bp(ln()) && LEFT & code) {
            x = xmin; await bp(ln());
            y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1); await bp(ln());
        }
        else if(await bp(ln()) && RIGHT & code) {
            x = xmax; await bp(ln());
            y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1); await bp(ln());
        }
        else if(await bp(ln()) && BOTTOM & code) {
            y = ymin; await bp(ln());
            x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1); await bp(ln());
        }
        else if(await bp(ln()) && TOP & code) {
            y = ymax; await bp(ln());
            x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1); await bp(ln());
        }
        if(await bp(ln()) && code1 === code) {
            [x1, y1] = [x, y]; await bp(ln()); [panel.crop_x1, panel.crop_y1] = [x, y];
            code1 = encode(x, y, xmin, xmax, ymin, ymax); await bp(ln());
        }
        else if(await bp(ln()) && code2 === code) {
            [x2, y2] = [x, y]; await bp(ln()); [panel.crop_x2, panel.crop_y2] = [x, y];
            code2 = encode(x, y, xmin, xmax, ymin, ymax); await bp(ln());
        }
    }
    await drawline_dda(x1, y1, x2, y2, COLOR_HIGHLIGHT); await bp(ln());
    // breakpoint
    // goto related line in panel
    // refresh variable info
    // wait for resume
    async function bp(line_number) {
        panel.goto_line(line_number);
        panel.variable_info = 'code = ' + code + ', ' +
            'code1 = ' + code1 + ', ' +
            'code2 = ' + code2 + '\n' +
            'x = ' + Math.round(x) + ', ' +
            'y = ' + Math.round(y) + '\n';
        await panel.next_step();
        return true;
    }
}

/* source code
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
    await drawline_dda(x1, y1, x2, y2, COLOR_HIGHLIGHT);
}
*/

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

function ln() {
    let e = new Error();
    if (!e.stack) try {
        // IE requires the Error to actually be throw or else the Error's 'stack'
        // property is undefined.
        throw e;
    } catch (e) {
        if (!e.stack) {
            return 0; // IE < 10, likely
        }
    }
    let stack = e.stack.toString().split(/\r\n|\n/);
    // We want our caller's frame. It's index into |stack| depends on the
    // browser and browser version, so we need to search for the second frame:
    let frameRE = /:(\d+):(?:\d+)[^\d]*$/;
    do {
        var frame = stack.shift();
    } while (!frameRE.exec(frame) && stack.length);
    return frameRE.exec(stack.shift())[1];
}
