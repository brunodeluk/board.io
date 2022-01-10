const initCanvasHeight = window.innerHeight;
const initCanvasWidth = window.innerWidth;

const initColor = "#000000";
const initTool = 68;

let points = [];
let memStack = [];

/**
 * Mapping of keyCodes -> tools
 */
const tool = {
    68: {
        name: "draw",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("crosshair");
            ctx.lineWidth = style.getStrokeWidth();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = style.getColor();
            ctx.fillStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);
        },
        render: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);

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
                let c = (points[i].x + points[i + 1].x) / 2;
                let d = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
            }
    
            ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            ctx.stroke();
        },
        postRender: function(canvas, ctx, e) {
            clear();
        },
    },
    82: {
        name: "rectangle",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("default");
            ctx.lineWidth = style.getStrokeWidth();
            ctx.lineJoin = '';
            ctx.lineCap = '';
            ctx.strokeStyle = style.getColor();
            ctx.fillStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);
        },
        render: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            ctx.beginPath();
            ctx.rect(points[0].x, points[0].y, pos.x - points[0].x, pos.y - points[0].y);
            ctx.stroke();
        },
        postRender: function(canvas, ctx, e) {
            clear();
        },
    },
    67: {
        name: "circle",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("default");
            ctx.lineWidth = style.getStrokeWidth();
            ctx.lineJoin = '';
            ctx.lineCap = '';
            ctx.strokeStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);
        },
        render: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            ctx.beginPath();
            const cx = points[0].x + Math.floor((pos.x - points[0].x) / 2);
            const cy = points[0].y + Math.floor((pos.y - points[0].y) / 2);
            const ry = Math.abs(pos.y - cy);
            const rx = Math.abs(pos.x - cx);
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            ctx.stroke();
        },
        postRender: function(canvas, ctx, e) {
            clear();
        },
    },
    76: {
        name: "line",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("default");
            ctx.lineWidth = style.getStrokeWidth();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = style.getColor();
            ctx.fillStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);
        },
        render: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        },
        postRender: function(canvas, ctx, e) {
            clear();
        },
    },
    65: {
        name: "arrow",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("default");
            ctx.lineWidth = style.getStrokeWidth();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = style.getColor();
            ctx.fillStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            const pos = getMousePosition(canvas, e);
            pushPosition(pos);
        },
        render: function(canvas, ctx, e) {
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
        postRender: function(canvas, ctx, e) {
            clear();
        },
    },
    84: {
        name: "text",
        shouldDisplay: true,
        config: function(ctx) {
            style.setCursor("text");
            const fontSizeStr = style.getFontSize().str;
            const fontFamilyStr = style.getFontFamily();
            const fontStr = fontSizeStr + " " + fontFamilyStr;            
            ctx.font = fontStr;
            ctx.strokeStyle = style.getColor();
            ctx.fillStyle = style.getColor();
        },
        preRender: function(canvas, ctx, e) {
            updateState({...state, isWritting: true});

            // check if the floating input has already been created
            let id = "text_input";
            let floatingInput = document.getElementById(id);
            if (floatingInput) {
                // remove it
                document.getElementById("input_area").removeChild(floatingInput);
            }

            floatingInput = document.createElement("spam");

            const pos = getMousePosition(canvas, e);

            // add properties
            floatingInput.id = id;
            floatingInput.contentEditable = true;
            floatingInput.style.color = style.getColor();
            floatingInput.style.left = pos.x + "px";
            floatingInput.style.top = (pos.y - style.getFontSize().value) + "px";
            floatingInput.style.fontFamily = style.getFontFamily();
            floatingInput.style.fontSize = style.getFontSize().str;
            floatingInput.classList.add("text-option");

            document.getElementById("input_area").appendChild(floatingInput);
            // to prevent the action of clicking to remove the
            // focus from the input
            e.preventDefault();
            floatingInput.focus();
            
            floatingInput.addEventListener("keydown", (e) => {
                // shift + enter
                if (e.shiftKey && e.code === "Enter") {
                    // remove floating element
                    document.getElementById("input_area").removeChild(floatingInput);

                    // render text to canvas
                    let innerHTML = floatingInput.innerHTML;
                    innerHTML = innerHTML.replaceAll("</div>", "");
                    const lines = innerHTML.split("<div>");
                    for (let i = 0; i < lines.length; i++) {
                        ctx.fillText(lines[i], pos.x + 9, pos.y + 7 + (style.getFontSize().value + 3) * i);    
                    }
                    updateState({...state, isWritting: false});
                    updateState({...state, isPainting: false});
                    saveToMem(canvas, ctx);
                }

                if (e.code === "Escape") {
                    // remove floating element
                    document.getElementById("input_area").removeChild(floatingInput);
                    updateState({...state, isWritting: false});
                    updateState({...state, isPainting: false});
                }
            });
        },
        render: function(canvas, ctx, e) {
            return true;
        },
        postRender: function(canvas, ctx, e) {
            isPainting = false;
        },
    },
};

const cmd = {
    undo: function(ctx, memCtx, canvas) {
        if (memStack.length > 0) {
            lastCanvas = memStack.pop();
            lastCanvasCtx = lastCanvas.getContext("2d");

            clear();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            memCtx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(lastCanvas, 0, 0);
            memCtx.drawImage(lastCanvas, 0, 0);
        }
    },
    clear: function(ctx, memCtx, canvas) {
        clear();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        memCtx.clearRect(0, 0, canvas.width, canvas.height);
    },
};

const colorsCmd = {
    49: "#000000",
    50: "#FF0000",
    51: "#00FF00",
    52: "#0000FF"
};

const style = {
    getColor: function() {
        return document.getElementById("colorPickerInput").value;
    },
    getStrokeWidth: function() {
        return document.getElementById("strokeWidthInput").value;
    },
    getFontFamily: function() {
        return "Helvetica";
    },
    getFontSize: function() {
        const value = 20;
        const unit = "px";

        return {
            value: value,
            unit: unit,
            str: value + unit,
        }
    },
    setCursor: function(cursor) {
        document.getElementsByTagName("body")[0].style.cursor = cursor;
    },
    setColor: function(color) {
        document.getElementById("colorPickerInput").value = color;
        displayColor(color);
    }
}

let state = {
    currentTool: 83,
    isPainting: false,
    isWritting: false,
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
resizeCanvas(canvas, initCanvasWidth, initCanvasHeight);

const memCanvas = document.createElement("canvas");
const memCtx = memCanvas.getContext("2d");
resizeCanvas(memCanvas, canvas.width, canvas.height);

function resizeCanvas(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
};

canvas.addEventListener("mousedown", onCanvasMouseDown, false);
function onCanvasMouseDown(e) {
    updateState({...state, isPainting: true});
    pushToMemStack(memCanvas);

    const t = tool[state.currentTool];
    t.preRender(canvas, ctx, e);
};

canvas.addEventListener("mousemove", onCanvasMouseMove, false);
function onCanvasMouseMove(e) {
    if (state.isPainting) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        copyToCanvas(memCanvas);
        tool[state.currentTool].render(canvas, ctx, e);
    }
};

canvas.addEventListener("mouseup", onCanvasMouseUp, false);
function onCanvasMouseUp(e) {
    updateState({...state, isPainting: false});
    saveToMem(canvas, ctx);
    tool[state.currentTool].postRender(canvas, ctx, e);
};

window.addEventListener("keydown", onWindowKeyDown, false);
function onWindowKeyDown(e) {
    // return if user is writting on the canvas
    if (state.isWritting) {
        return true;
    }

    const t = tool[e.keyCode];
    if (t) {
        updateState({...state, currentTool: e.keyCode});
        t.config(ctx);
        if (t.shouldDisplay) {
            displayTool(t.name);
        }
        return true;
    }

    const color = colorsCmd[e.keyCode];
    if (color) {
        style.setColor(color);
        tool[state.currentTool].config(ctx);
        return true;
    }

    switch(e.keyCode) {
        case 88:
            pushToMemStack(canvas);
            cmd.clear(ctx, memCtx, memCanvas);
            return true;
        case 90:
            cmd.undo(ctx, memCtx, canvas);
            return true;
    }
};

function updateState(newState) {
    state = newState;
};

function displayTool(toolName) {
    const currentToolElm = document.getElementById("current-tool");
    currentToolElm.innerText = toolName;
    currentToolElm.className = "key-fig-container";
    currentToolElm.classList.add(toolName);
};

function displayColor(color) {
    const currentColorElm = document.getElementById("current-color");
    currentColorElm.style.backgroundColor = color;
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

function pushPosition(pos) {
    points.push({x: pos.x, y: pos.y});
};

function clear() {
    points = [];
};

function copyToCanvas(csv) {
    ctx.drawImage(csv, 0, 0);
};

function saveToMem(canvas, ctx) {
    const w = canvas.width;
    const h = canvas.height;
    const cvsImageData = ctx.getImageData(0, 0, w, h);
    memCtx.putImageData(cvsImageData, 0, 0);
};

function pushToMemStack(canvas) {
    const auxCanvas = document.createElement("canvas");
    const auxCtx = auxCanvas.getContext("2d");
    auxCanvas.height = canvas.height;
    auxCanvas.width = canvas.width; 
    auxCtx.drawImage(canvas, 0, 0);
    memStack.push(auxCanvas);
};

updateState({...state, currentTool: initTool});
tool[state.currentTool].config(ctx);
style.setColor(initColor);
