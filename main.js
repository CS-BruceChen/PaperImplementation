let canvasShader = null;
const CANVAS = document.querySelector('#canvas');

function RasterJoin(){
    // console.log(canvasShader.primitives);
    const gl = CANVAS.getContext('webgl');
    // console.log(canvasShader.primitives);
    rasterJoin(gl,canvasShader.primitives);
}

async function main() { 
    var canvas = CANVAS;
    clearCanvas(canvas);
    canvasShader = await initCanvas(canvas);
    console.log(canvasShader);
}