import logo from './logo.svg';
import './App.css';

import React from "react";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.strokes = [new Stroke()];
        this.animations = [new Animation()];
        this.iterations = 10;
    }

    draw() {
        const {ctx, canvas} = this;

        ctx.fillStyle = 'gray';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Things we can do; fractally changing colors. Fractally changing scale. Fractally transposing
        // Fractially:
        //  Changing Scale
        //  Changing colors.
        //  Translating
        //  Flipping (gradually)
        //  Rotating
        //  All of these can be done as numbers between 0-1 and we fade in new ones and old ones.
        // Meanwhile we have some effects that happen on the foreground color & brush.
        // And some features for mirror drawing

        let start = window.performance.now();
        this.strokes[0].draw(ctx);
        let end = window.performance.now();
        this.drawTime = end - start;
        if (this.drawTime + this.computeTime > 1 / 2) {
            this.iterations /= 2;
            if (this.iterations < 1) {
                this.iterations = 1;
            }
        } else {
            this.iterations += 1;
        }
        requestAnimationFrame(this.draw.bind(this));
    }

    update() {
        let start = window.performance.now();
        this.animations[0].rotate.add(0.01);
        this.strokes[0].calcDraw(1000, this.animations, this.iterations);
        let end = window.performance.now();
        this.computeTime = end - start;
    }

    componentDidMount() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        requestAnimationFrame(this.draw.bind(this));
        setInterval(this.update.bind(this), 50);
    }

    onMouseEnter(e) {

    }

    onMouseLeave(e) {

    }

    onMouseDown(e) {

    }

    onMouseUp(e) {

    }

    onMouseMove(e) {
        let rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.canvas.width;
        const y = (e.clientY - rect.top) / this.canvas.height;
        this.strokes[0].addBrush(x, y, 0.01, TEXTURE.Plain, 'orange');
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <canvas id="canvas" width={1000} height={1000}>
                    </canvas>
                </header>
            </div>
        );
    }
}

export default App;

const TEXTURE = {
    Plain: 0,
};

class Stroke {
    constructor() {
        this.brushes = [];
        this.calcedInstructions = [];
    }

    addBrush(x, y, radius, texture, color) {
        this.brushes.push([x, y, radius, texture, color]);
    }

    calcDraw(scale, animations, iterations) {
        this.calcedInstructions = [];
        for (let brush of this.brushes) {
            for (let animation of animations) {
                let [x, y, radius, texture, color] = brush;
                this.calcedInstructions.push([x * scale, y * scale, radius * scale, color]);
                for (let i = 0; i < iterations; i++) {
                    [x, y, radius, color] = animation.apply(x, y, radius, color);
                    this.calcedInstructions.push([x * scale, y * scale, radius * scale, color]);
                }
            }
        }
    }

    draw(ctx) {
        for (let instructions of this.calcedInstructions) {
            const [x, y, radius, color] = instructions;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, radius, radius);
        }
    }
}

class Animation {
    constructor() {
        this.rotate = new Range(-1, 1, RangeStyle.WRAP);
        this.dx = new Range(-1, 1);
        this.dy = new Range(-1, 1);
        this.flipX = new Range(-1, 1);
        this.flipY = new Range(-1, 1);
        this.scale = new Range(-1, 1);
        this.hueShift = new Range(-1, 1);
    }

    apply(x, y, size, color) {
        x -= this.dx.v;
        y -= this.dy.v;

        [x, y] = this.applyRotate(0.5, 0.5, x, y, this.rotate.v * Math.PI * 2);

        size *= 1 + this.scale.v;

        return [x, y, size, color];
    }

    applyRotate(cx, cy, x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }
}

const RangeStyle = {
    REVERSE: 0,
    WRAP: 1,
}

class Range {

    constructor(min, max, style) {
        this.min = min;
        this.max = max;
        this.v = 0;
        this.dir = 1;
        if (style === undefined) {
            this.style = RangeStyle.REVERSE;
        } else {
            this.style = style;
        }
    }

    add(dv) {
        this.v += dv * this.dir;
        if (this.style === RangeStyle.REVERSE) {
            if (this.v > this.max) {
                this.dir *= -1;
            } else if (this.v < this.min) {
                this.dir *= -1;
            }
        } else if (this.style === RangeStyle.WRAP) {
            if (dv < 0 && this.v < this.min) {
                this.v = this.max + this.min - this.v;
            } else if (dv > 0 && this.v > this.max) {
                this.v = this.max + this.min - this.v;
            }
        }
    }
}
