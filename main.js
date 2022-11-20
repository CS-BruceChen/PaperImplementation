const canvas = document.querySelector('#canvas');

function drawPoint() {
    // console.log('point');
    // renderPrimitive(canvas,'point',rgb(128,209,200));
    drawType='point';
    drawPolygonFirst=true;
}

function drawPolygon() {
    // console.log('polygon');
    // renderPrimitive(canvas,'polygon',rgb(127,127,127));
    drawType='polygon';
    drawPolygonFirst=true;
}

var primitives = [];
var drawType = 'point';
var drawPolygonFirst = true;

function main() { 
    clearCanvas(canvas);
    const gl = canvas.getContext('webgl');
    const shaderInfo = new ShaderInfo(
        './shaderSrc/vs.glsl',
        './shaderSrc/fs.glsl',
        ['aPos','aColor'],
        [],
    )
    canvas.onclick = function(event){
        var po = {
            type : '',
            data : {
                aPos : [],
                aColor : []
            }
        }
        if(drawType == 'point'){
            po.type = 'point';
            po.data.aPos.push(getMousePos(canvas,event));
            po.data.aColor.push(rgb(128,209,200));
            primitives.push(po);
        }
        else if(drawType == 'polygon'){
            if(drawPolygonFirst){
                drawPolygonFirst = false;
                po.type = 'polygon';
                po.data.aPos.push(getMousePos(canvas,event));
                po.data.aColor.push(rgb(128,128,128));
                primitives.push(po);
            }
            else{
                primitives[primitives.length-1].data.aPos.push(getMousePos(canvas,event));
                primitives[primitives.length-1].data.aColor.push(rgb(128,128,128));
            }
        }
        initShader(gl,shaderInfo).then((shader)=>{
            // console.log(primitives);
            draw(gl,shader,primitives)
        })
        
    }
}