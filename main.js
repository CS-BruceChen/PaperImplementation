let canvasShader = null;
const CANVAS = document.querySelector('#canvas');
const CANVASUNUSE = document.querySelector('#canvasUnuse');

function RasterJoin(){
    const glUnuse = CANVASUNUSE.getContext('webgl2');//change to webgl ctx
    rasterJoin(glUnuse,canvasShader.primitives);
    // clearCanvas(gl);
    
}

async function main() { 
    var canvas = CANVAS;
    clearCanvas(canvas.getContext('webgl2'));
    canvasShader = await initCanvas(canvas);
}