function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const COLOR_AXIS = '#222222', COLOR_DARK = '#333333', COLOR_LIGHT = '#f0f0f0',
    COLOR_HIGHLIGHT = '#f04444';

let screen = new Vue({
    el: '#screen',
    data: {
        matrix: [],
        screen_view: 'Grid',
        width: 31,
        delay: 50,
        highlight_pix: { x: null, y: null, color: null },
    },
    computed: {
        view: {
            get: function() {
                return this.screen_view;
            },
            set: function(value) {
                this.screen_view = value;
                setTimeout(this.clear, 0);
            }
        },
        range: {
            get: function() {
                return Math.floor(this.width / 2);
            },
            set: function(value) {
                if(value > 50) value = 50;
                this.dim = value * 2 + 1;
            }
        },
        dim: {
            get: function() {
                return this.width
            },
            set: function (length) {
                this.width = length;
                let matrix = [];
                let L = Math.floor(length / 2);
                for(let i = -L; i <= L; i++){
                    let row = [];
                    for(let j = -L; j <= L; j++){
                        row.push({
                            x: i,
                            y: j,
                            color: 0
                        });
                    }
                    matrix.push(row);
                }
                this.matrix = matrix;
                this.clear();
            }
        }
    },
    methods: {
        __clear_grid: function () {
            this.log_list = [];
            let L = this.width;
            let mid = Math.floor(L / 2);
            for(let i = 0; i < L; i++) {
                for (let j = 0; j < L; j++) {
                    this.matrix[i][j] = {
                        x: i - mid,
                        y: mid - j,
                        color: (i === mid || j === mid) ? COLOR_AXIS : COLOR_DARK
                    }
                }
            }
            this.$forceUpdate();
        },
        __clear_canvas: function() {
            let canvas = document.getElementById("canvas");
            if (canvas.getContext) {
                let ctx = canvas.getContext("2d");

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.moveTo(0, 300);
                ctx.lineTo(600, 300);
                ctx.moveTo(300, 0);
                ctx.lineTo(300, 600);
                ctx.stroke();
            }
        },
        clear: function () {
            this.log_list = [];
            if('Grid' === this.view){
                this.__clear_grid();
            }
            else if('Canvas' === this.view){
                this.__clear_canvas();
            }
        },
        __drawpixel_grid: function(pix) {
            let L = this.dim;
            let x = Math.floor(pix.x + L / 2);
            let y = L - Math.floor(pix.y + L / 2) - 1;
            if(x >= 0 && y >= 0 && x < L && y < L){
                Vue.set(this.matrix[x], y, pix);
                return true;
            }
            return false;
        },
        __drawpixel_canvas: function(pix) {
            let canvas = document.getElementById("canvas");
            if (canvas.getContext) {
                let ctx = canvas.getContext("2d");
                let L = Math.floor(canvas.width / 2);
                let x = pix.x + L;
                let y = L - pix.y - 1;

                ctx.fillStyle = 'red';
                ctx.fillRect(x, y, 1, 1);
                return true;
            }
            return false;
        },
        drawpixel: async function(x, y, color, reversed = false) {
            let pix = {
                x: reversed ? y : x,
                y: reversed ? x : y,
                color: color
            };

            let drawed = false;
            if('Grid' === this.view){
                drawed = this.__drawpixel_grid(pix);
            }
            else if('Canvas' === this.view){
                drawed = this.__drawpixel_canvas(pix);
            }
            if(drawed && this.delay > 0){
                await sleep(this.delay);
            }
        },
        __getpixel_grid: function(_x, _y) {
            let L = this.dim;
            let x = Math.floor(_x + L / 2);
            let y = L - Math.floor(_y + L / 2) - 1;
            if(x >= 0 && y >= 0 && x < L && y < L){
                return this.matrix[x][y].color;
            }
            return 0;
        },
        getpixel: function(x, y) {
            if('Grid' === this.view){
                return this.__getpixel_grid(x, y);
            }
        },
        hover_pix: function(pix){
            this.highlight_pix = pix;
            for(let i = 0; i < panel.log_list.length; i++){
                panel.log_list[i].highlight = this.highlight_pix.x === panel.log_list[i].pix.x
                    && this.highlight_pix.y === panel.log_list[i].pix.y;
                Vue.set(panel.log_list, i, panel.log_list[i]);
            }
        },
        onclick: async function(pix) {
            await panel.onclick(pix);
        },
        onhover: async function(pix) {
            await panel.onhover(pix);
            this.hover_pix(pix);
        },
        leavehover: async function(pix) {
            this.highlight_pix = { x: '🙂', y: '🙃', color: null };
        },
    }
});
screen.range = 15;