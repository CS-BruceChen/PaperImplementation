var canvasShader = null;
const CANVAS = document.querySelector('#canvas');

function RasterJoin(){
    // console.log(canvasShader.primitives);
    const gl = CANVAS.getContext('webgl');
    // console.log(canvasShader.primitives);
    rasterJoin(gl,canvasShader.primitives);
}

function main() { 
    var canvas = CANVAS;
    clearCanvas(canvas);
    canvasShader = initCanvas(canvas);
}