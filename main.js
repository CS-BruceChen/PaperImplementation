let canvasShader = null;
const CANVAS = document.querySelector('#canvas');

function RasterJoin(){
    const gl = CANVAS.getContext('webgl');
    rasterJoin(gl,canvasShader.primitives);
}

async function main() { 
    var canvas = CANVAS;
    clearCanvas(canvas);
    canvasShader = await initCanvas(canvas);
}