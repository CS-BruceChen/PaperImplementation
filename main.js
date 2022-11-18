const canvas = document.querySelector('#canvas');

function drawPoint() {
    console.log('point');
    renderPrimitive(canvas,'point',rgb(128,209,200));
}

function drawPolygon() {
    console.log('polygon');
    renderPrimitive(canvas,'polygon',rgb(127,127,127));
}

function main() { 
    clearCanvas(canvas);
}