const canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");


let isPainting = false;
let lastX = 0;
let lastY = 0;

const memCanvas = document.createElement("canvas");

memCanvas.width = canvas.width;
memCanvas.height = canvas.height;
const memCtx = memCanvas.getContext("2d");

let points = [];
let stack = [];

let currentState = "stroke";
displaycurrentState(currentState, currentState);

// controlles
const clearBtn = document.getElementById("clear");
const colorPicker = document.getElementById("colorPickerInput");
const strokeWidth = document.getElementById("strokeWidthInput");
const saveBtn = document.getElementById("save");
const strokeBtn = document.getElementById("stroke");
const rectangleBtn = document.getElementById("rectangle");
const circleBtn = document.getElementById("circle");
const lineBtn = document.getElementById("line");
const arrowBtn = document.getElementById("arrow");

resizeCanvas();
configCtx(ctx);

function initCtx(canvas) {
    const ctx = canvas.getContext("2d");
    let err = null;

    if (ctx === null) {
        err = Error("unable to initialize webgl");
    }
    
    return {
        ctx: ctx,
        err: err,
    }
}

function configCtx(ctx) {
    ctx.lineWidth = strokeWidth.value;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    memCanvas.width = window.innerWidth;
    memCanvas.height = window.innerHeight;
}

function getMousePosition(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    return {
       x: canvasX,
       y: canvasY
    };
}

function changecurrentState(newcurrentState) {
    const oldcurrentState = currentState;
    currentState = newcurrentState;
    displaycurrentState(oldcurrentState, newcurrentState);
}

function save(e) {
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href=image;
}

function onKeyDown(e) {
    // ctrl + z
    if (e.keyCode == 90) {
        undo();
    } // s -> stroke
    else if (e.keyCode == 83) {
        changecurrentState("stroke");
    } // r -> rectangle 
    else if (e.keyCode == 82) {
        changecurrentState("rectangle");
    } // c -> circle
    else if (e.keyCode == 67) {
        changecurrentState("circle");
    } // l -> line
    else if (e.keyCode == 76) {
        changecurrentState("line");
    }
    else if (e.keyCode == 65) {
        changecurrentState("arrow");
    }
    else if (e.keyCode == 88) {
        clear();
    }
}

function displaycurrentState(oldcurrentState, newcurrentState) {
    const status = document.getElementById("state");
    status.innerText = currentState;
    status.classList.remove(oldcurrentState);
    status.classList.add(newcurrentState);
}

function undo(e) {
    if (stack.length > 0) {
        lastCanvas = stack.pop();
        clear();
        ctx.drawImage(lastCanvas, 0, 0);
        memCtx.drawImage(lastCanvas, 0, 0);
    }
}

function pushToStack(c) {
    const auxCanvas = document.createElement('canvas');
    const auxCtx = auxCanvas.getContext('2d');
    auxCanvas.height = c.height;
    auxCanvas.width = c.width;
    auxCtx.drawImage(c, 0, 0);
    stack.push(auxCanvas);
}

const rectangle = {
    onmousedown: function(e) {
        points = [];
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
    },
    onmousemove: function(e) {
        const pos = getMousePosition(canvas, e);
        ctx.beginPath();
        ctx.rect(points[0].x, points[0].y, pos.x - points[0].x, pos.y - points[0].y);
        ctx.stroke();
    },
    onmouseup: function(e) {
        points = [];
    },
};

const circle = {
    onmousedown: function(e) {
        points = [];
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
    },
    onmousemove: function(e) {
        const pos = getMousePosition(canvas, e);
        ctx.beginPath();
        const cx = points[0].x + Math.floor((pos.x - points[0].x) / 2);
        const cy = points[0].y + Math.floor((pos.y - points[0].y) / 2);
        const ry = Math.abs(pos.y - cy);
        const rx = Math.abs(pos.x - cx);
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
    },
    onmouseup: function(e) {
        points = [];
    }
}

const line = {
    onmousedown: function(e) {
        points = [];
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
    },
    onmousemove: function(e) {
        const pos = getMousePosition(canvas, e);
        const tox = pos.x;
        const toy = pos.y;
        ctx.beginPath();
        // arrow base
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    },
    onmouseup: function(e) {
        points = [];
    }
}

const arrow = {
    onmousedown: function(e) {
        points = [];
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
    },
    onmousemove: function(e) {
        const headlen = 20;
        const pos = getMousePosition(canvas, e);
        const tox = pos.x;
        const toy = pos.y;
        const dy = toy - points[0].y;
        const dx = tox - points[0].x;
        var angle = Math.atan2(dy, dx);
        ctx.beginPath();
        // arrow base
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(tox, toy);
        // arrow tip
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    },
    onmouseup: function(e) {
        points = [];
    }
}

const stroke = {
    onmousedown: function(e) {
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
    },
    onmousemove: function(e) {
        const pos = getMousePosition(canvas, e);
        points.push({
            x: pos.x,
            y: pos.y,
        });
        
        if (points.length < 4) {
            var b = points[0];
            ctx.beginPath();
            ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, 1);
            ctx.closePath();
            ctx.fill();
            return null;
        }
    
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        let i = 0;
        for (i = 1; i < points.length - 3; i ++) {
            var c = (points[i].x + points[i + 1].x) / 2;
            var d = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
        }
    
        ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        ctx.stroke();
    },
    onmouseup: function(e) {
        points = [];
    }
}

const states = {
    rectangle: rectangle,
    circle: circle,
    line: line,
    arrow: arrow,
    stroke: stroke,
};

function onClear() {
    pushToStack(memCanvas);
    clear();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    memCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function onMouseDown(e) {
    isPainting = true;
    pushToStack(memCanvas);
    configCtx(ctx);
    states[currentState].onmousedown(e);
}

function onMouseMove(e) {
    if (isPainting) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(memCanvas, 0, 0);
        states[currentState].onmousemove(e);
    }
}

function onMouseUp(e) {
    isPainting = false;
    memCtx.drawImage(canvas, 0, 0);
    states[currentState].onmouseup(e);
}

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mouseup", onMouseUp, false);
clearBtn.addEventListener("click", onClear, false);
window.addEventListener("keydown", onKeyDown, false);
saveBtn.addEventListener("click", save, false);
strokeBtn.addEventListener("click", () => changecurrentState("stroke"), false);
rectangleBtn.addEventListener("click", () => changecurrentState("rectangle"), false);
circleBtn.addEventListener("click", () => changecurrentState("circle"), false);
lineBtn.addEventListener("click", () => changecurrentState("line"), false);
arrowBtn.addEventListener("click", () => changecurrentState("arrow"), false);