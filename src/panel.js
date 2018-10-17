
const POLYGON_STATE_PREPARE = 0, POLYGON_STATE_PENDING = 1,
      POLYGON_STATE_FINISHED = 2;
const CROP_STATE_CLEARED = 0, CROP_STATE_SCREEN_P1 = 1, CROP_STATE_SCREEN_P2 = 2,
      CROP_STATE_LINE_P1 = 3, CROP_STATE_LINE_P2 = 4, CROP_STATE_PENDING = 5, CROP_STATE_FINISHED = 6;

let panel = new Vue({
    el: '#panel',
    data: {
        x1: 0, y1: 0, x2: 16, y2: 18,
        
        circle_x0: 0, circle_y0: 0, circle_r: 10,

        ellipse_x0: 0, ellipse_y0: 0, ellipse_a: 10, ellipse_b: 6,

        polygon_points: [],
        polygon_description: '点选多边形顶点',
        polygon_way: 'FourWay',
        polygon_state: POLYGON_STATE_PREPARE,

        crop_xmin: null, crop_xmax: null, crop_ymin: null, crop_ymax: null,
        crop_x1: null, crop_y1: null, crop_x2: null, crop_y2: null,
        crop_description: '请选择裁剪矩形左上顶点',
        crop_state: CROP_STATE_SCREEN_P1,
        variable_info: '',
        crop_source_code: null,

        algo_line: 'DDA',
        algo_circle: 'MidPoint',
        algo_polygon: 'Recursive',

        myobject: 'line',
        log_list: [],
    },
    computed: {
        object: {
            get: function() {
                return this.myobject;
            },
            set: function(value) {
                this.myobject = value;
                this.clear();
            }
        }
    },
    methods: {
        clear: function() {
            if('polygon' === this.object) {
                this.polygon_points = [];
                this.polygon_state = POLYGON_STATE_PREPARE;
                this.polygon_description = '屏幕已清空，请重新点选多边形顶点';
            }
            else if('crop' === this.object) {
                this.crop_xmin = this.crop_ymin = this.crop_xmax = this.crop_ymax = null;
                this.crop_x1 = this.crop_y1 = this.crop_x2 = this.crop_y2 = null;
                this.crop_state = CROP_STATE_SCREEN_P1;
                this.crop_description = '已清空屏幕。请选择裁剪矩形左上顶点';
                setTimeout(this.goto_line, 0, -1); // render syntax highlight
            }
            this.log_list = [];
            screen.clear();
        },
        line: async function() {
            if('DDA' === this.algo_line){
                await drawline_dda(this.x1, this.y1, this.x2, this.y2, COLOR_LIGHT);
            }
            else if('MidPoint' === this.algo_line){
                await drawline_mid(this.x1, this.y1, this.x2, this.y2, COLOR_LIGHT);
            }
            else if('Bresenham' === this.algo_line){
                await drawline_bresenham(this.x1, this.y1, this.x2, this.y2, COLOR_LIGHT);
            }
        },
        circle: async function() {
            if('MidPoint' === this.algo_circle){
                await draw_circle_mid(this.circle_x0, this.circle_y0, this.circle_r, COLOR_LIGHT);
            }
            else if('Bresenham' === this.algo_circle){
                await draw_circle_bresenham(this.circle_x0, this.circle_y0, this.circle_r, COLOR_LIGHT);
            }
        },
        ellipse: async function() {
            await draw_ellipse(this.ellipse_x0, this.ellipse_y0, this.ellipse_a, this.ellipse_b, COLOR_LIGHT);
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
        __onclick_polygon: async function(pix) {
            if(POLYGON_STATE_PREPARE === this.polygon_state){
                this.polygon_points.push(pix);
                let L = this.polygon_points.length;
                this.polygon_description = '';
                for(let i = 0; i < L; i++){
                    this.polygon_description += '(' + this.polygon_points[i].x + ', ' + this.polygon_points[i].y + ') ';
                }
                if(L > 1){
                    if(pix.x === this.polygon_points[0].x && pix.y === this.polygon_points[0].y) {
                        this.polygon_description += '\n输入完毕，请在多边形内部选取一个像素作为种子点';
                        this.polygon_state = POLYGON_STATE_PENDING;
                    }
                    else {
                        this.polygon_description += '\n点击屏幕继续输入顶点，点击起点结束';
                    }
                    let drawline = this.polygon_way === 'FourWay' ? drawline_dda : drawborder;
                    await drawline(this.polygon_points[L-2].x, this.polygon_points[L-2].y,
                        this.polygon_points[L-1].x, this.polygon_points[L-1].y, COLOR_LIGHT)
                }
            }
            else if(POLYGON_STATE_PENDING === this.polygon_state){
                this.polygon_description = '种子点坐标为(' + pix.x + ', ' + pix.y + ')';
                if('Recursive' === this.algo_polygon) {
                    this.polygon_description += '\n使用递归种子填充算法';
                    if('FourWay' === this.polygon_way) {
                        await fill_polygon_seed(pix.x, pix.y, COLOR_LIGHT);
                    }
                    else{
                        await fill_polygon_seed_eight_way(pix.x, pix.y, COLOR_LIGHT);
                    }
                }
                else if('ScanLine' === this.algo_polygon){
                    this.polygon_description += '\n使用扫描线种子填充算法';
                    await fill_polygon_scan(pix.x, pix.y, COLOR_LIGHT);
                }
                this.polygon_state = POLYGON_STATE_FINISHED;
                this.polygon_description = '填充完毕';
            }
            else if(POLYGON_STATE_FINISHED === this.polygon_state) {
                this.clear();
            }
        },
        __onclick_crop: async function(pix) {
            if(CROP_STATE_SCREEN_P1 === this.crop_state) {
                this.crop_xmin = pix.x;
                this.crop_ymax = pix.y;
                this.crop_state = CROP_STATE_SCREEN_P2;
                this.crop_description = '请选择裁剪矩形右下顶点';
            }
            else if(CROP_STATE_SCREEN_P2 === this.crop_state) {
                if(pix.x === this.crop_xmin || pix.y === this.crop_ymax) {
                    this.crop_description = '左上角和右下角顶点不能共线！请重新选择裁剪矩形右下顶点';
                    return;
                }
                if(pix.x < this.crop_xmin || pix.y > this.crop_ymax) {
                    this.crop_description = '必须满足xmax > xmin && ymax > ymin！请重新选择裁剪矩形右下顶点';
                    return;
                }
                this.crop_xmax = pix.x;
                this.crop_ymin = pix.y;
                drawline_dda(this.crop_xmin, this.crop_ymax, this.crop_xmax, this.crop_ymax, COLOR_LIGHT);
                drawline_dda(this.crop_xmax, this.crop_ymax, this.crop_xmax, this.crop_ymin, COLOR_LIGHT);
                drawline_dda(this.crop_xmax, this.crop_ymin, this.crop_xmin, this.crop_ymin, COLOR_LIGHT);
                drawline_dda(this.crop_xmin, this.crop_ymin, this.crop_xmin, this.crop_ymax, COLOR_LIGHT);
                this.crop_state = CROP_STATE_LINE_P1;
                this.crop_description = '请选择直线第一个顶点';
            }
            else if(CROP_STATE_LINE_P1 === this.crop_state) {
                this.crop_x1 = pix.x;
                this.crop_y1 = pix.y;
                this.crop_state = CROP_STATE_LINE_P2;
                this.crop_description = '请选择直线第二个顶点';
            }
            else if(CROP_STATE_LINE_P2 === this.crop_state) {
                this.crop_x2 = pix.x;
                this.crop_y2 = pix.y;
                this.crop_state = CROP_STATE_PENDING;
                this.crop_description = '正在裁剪并绘制直线';
                await drawline_bresenham(this.crop_x1, this.crop_y1, this.crop_x2, this.crop_y2, COLOR_LIGHT);
                await clip_line(this.crop_x1, this.crop_y1, this.crop_x2, this.crop_y2,
                                                 this.crop_xmin, this.crop_xmax, this.crop_ymin, this.crop_ymax);
                this.crop_state = CROP_STATE_FINISHED;
                this.crop_description = '绘制完成';
            }
            else if(CROP_STATE_PENDING === this.crop_state) {
            }
            else if(CROP_STATE_FINISHED === this.crop_state) {
                await this.clear();
            }
        },
        onclick: async function(pix) {
            if('polygon' === this.object) {
                this.__onclick_polygon(pix);
            }
            else if('crop' === this.object){
                this.__onclick_crop(pix);
            }
        },
        onhover: async function(pix) {
        },
        goto_line: async function(line_number) {
            let code = document.getElementById('code');
            if(!this.crop_source_code){
                this.crop_source_code = code.innerText;
            }
            let lines = this.crop_source_code.split('\n');
            let newcode = '';
            for(let i = 0; i < lines.length; i++){
                if(i === line_number - 1){
                    newcode += '<mark>' + lines[i] + '</mark>';
                }
                else {
                    newcode += lines[i];
                }
                if(i !== lines.length - 1) {
                    newcode += '\n';
                }
            }
            code.innerHTML = newcode;
            hljs.highlightBlock(code);
        },
        next_step: async function() {
            return new Promise((resolve, reject) => {
                let btn = document.getElementById('next_step');
                function step(event) {
                    btn.removeEventListener('click', step);
                    resolve();
                }
                btn.addEventListener('click',step);
            });
        },
    }
});

