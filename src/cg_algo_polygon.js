async function fill_polygon_seed(x, y, color){
    let L = screen.dim;
    if(x >= -L && x <= L && y >= -L && y <= L && color !== screen.getpixel(x, y)){
        await screen.drawpixel(x, y, color);
        await fill_polygon_seed(x + 1, y, color);
        await fill_polygon_seed(x, y + 1, color);
        await fill_polygon_seed(x - 1, y, color);
        await fill_polygon_seed(x, y - 1, color);
    }
}
