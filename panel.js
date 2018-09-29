
let panel = new Vue({
    el: '#panel',
    data: {
        x1: 0,
        y1: 0,
        x2: 16,
        y2: 18,
        x0: 0,
        y0: 0,
        r: 10,
        ellipse_x0: 0,
        ellipse_y0: 0,
        ellipse_a: 10,
        ellipse_b: 6,
        algo_line: 'DDA',
        algo_circle: 'MidPoint',
        log_list: []
    },
    computed: {
    },
    methods: {
        clear: function() {
            this.log_list = [];
            screen.clear();
        },
        line: async function() {
            this.clear();
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
            this.clear();
            if('MidPoint' === this.algo_circle){
                await draw_circle_mid(this.x0, this.y0, this.r, 1);
            }
            else if('Bresenham' === this.algo_circle){
                await draw_circle_bresenham(this.x0, this.y0, this.r, 1);
            }
        },
        ellipse: async function() {
            this.clear();
            await draw_ellipse(this.ellipse_x0, this.ellipse_y0, this.ellipse_a, this.ellipse_b, 1);
        },
    }
});
