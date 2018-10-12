
const STATE_PREPARE = 0, STATE_PENDING = 1, STATE_FINISHED = 2;

let panel = new Vue({
    el: '#panel',
    data: {
        x1: 0,
        y1: 0,
        x2: 16,
        y2: 18,
        circle_x0: 0,
        circle_y0: 0,
        circle_r: 10,
        ellipse_x0: 0,
        ellipse_y0: 0,
        ellipse_a: 10,
        ellipse_b: 6,
        polygon_points: [],
        poligon_state: STATE_FINISHED,
        algo_line: 'DDA',
        algo_circle: 'MidPoint',
        algo_polygon: 'Recursive',
        myobject: 'line',
        log_list: [],
    },
    computed: {
        object: {
            get: function() { return this.myobject; },
            set: function(value) {
                this.myobject = value;
                if('polygon' === this.myobject){
                }
            },
        }
    },
    methods: {
        clear: function() {
            this.polygon_points = [];
            this.poligon_finished = false;
            this.log_list = [];
            screen.clear();
        },
        line: async function() {
            if('DDA' === this.algo_line){
                await drawline_dda(this.x1, this.y1, this.x2, this.y2, 1);
            }
            else if('MidPoint' === this.algo_line){
                await drawline_mid(this.x1, this.y1, this.x2, this.y2, 1);
            }
            else if('Bresenham' === this.algo_line){
                await drawline_bresenham(this.x1, this.y1, this.x2, this.y2, 1);
            }
        },
        circle: async function() {
            if('MidPoint' === this.algo_circle){
                await draw_circle_mid(this.circle_x0, this.circle_y0, this.circle_r, 1);
            }
            else if('Bresenham' === this.algo_circle){
                await draw_circle_bresenham(this.circle_x0, this.circle_y0, this.circle_r, 1);
            }
        },
        ellipse: async function() {
            await draw_ellipse(this.ellipse_x0, this.ellipse_y0, this.ellipse_a, this.ellipse_b, 1);
        },
        draw: async function() {
            this.clear();
            if('line' === this.object) {
                await this.line();
            }
            else if('circle' === this.object) {
                await this.circle();
            }
            else if('ellipse' === this.object) {
                await this.ellipse();
            }
        },
        onclick: async function(pix) {
            if(this.object !== 'polygon') return;
            if(STATE_PREPARE === this.poligon_state){
                this.polygon_points.push(pix);
                let L = this.polygon_points.length;
                if(L > 1){
                    if(pix.x === this.polygon_points[0].x && pix.y === this.polygon_points[0].y){
                        this.poligon_state = STATE_PENDING;
                    }
                    await drawline_dda(this.polygon_points[L-2].x, this.polygon_points[L-2].y,
                        this.polygon_points[L-1].x, this.polygon_points[L-1].y, 1)
                }
            }
            else if(STATE_PENDING === this.poligon_state){
                if('Recursive' === this.algo_polygon) {
                    await fill_polygon_seed(pix.x, pix.y, 1);
                }
                else if('ScanLine' === this.algo_polygon){
                    await fill_polygon_scan(pix.x, pix.y, 1);
                }
                this.poligon_state = STATE_FINISHED;
            }
            else if(STATE_FINISHED === this.poligon_state) {
                this.clear();
                this.poligon_state = STATE_PREPARE;
                this.onclick(pix);
            }
        },
        onhover: async function(pix) {
            // if(!this.poligon_finished){
            //     let L = this.polygon_points.length;
            //     if(L >= 1){
            //         screen.delay = 0;
            //         await drawline_dda(this.polygon_points[L-1].x, this.polygon_points[L-1].y, screen.highlight_pix.x, screen.highlight_pix.y, 0);
            //         await drawline_dda(this.polygon_points[L-1].x, this.polygon_points[L-1].y, pix.x, pix.y, 1);
            //     }
            // }
        }
    }
});
