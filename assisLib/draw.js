function draw(gl,shader,drawType,uniformOperation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var glTypeMap = {
        point : gl.POINTS,
        polyline : gl.LINE_STRIP,
        polygon : gl.LINE_LOOP,
        line : gl.LINES,
        region : gl.TRIANGLE_STRIP,
    }

    var attributeNameArray = Object.keys(shader.vertexAttributeValues);
    for(var i = 0; i < attributeNameArray.length; i++){
        var attributeValueBuffer = shader.vertexAttributeValues[attributeNameArray[i]];
        const dimension = attributeValueBuffer.dimension;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, attributeValueBuffer.buffer);
        gl.vertexAttribPointer(
            shader.attribLocations[attributeNameArray[i]],
            dimension,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(shader.attribLocations[attributeNameArray[i]]);
    }

    gl.useProgram(shader.program);
    if(!uniformOperation) uniformOperation(gl,shader.uniformLocations);

    {
        const glDrawType = glTypeMap[drawType];
        console.log('!');
        const offset = 0;
        const vertexCount = shader.vertexAttributeValues[attributeNameArray[0]].vertexNum;
        gl.drawArrays(glDrawType, offset, vertexCount);
    }
    
    
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();

    var x = ((event.clientX - rect.left) / (rect.width / 2) - 1).toFixed(2);
    var y = (1 - (event.clientY - rect.top) / (rect.width / 2)).toFixed(2);

    return [x,y];
}

function initMouseControl(canvas) {    
    var aPos = [];
    canvas.addEventListener("click", function(event) {
        aPos.push(getMousePos(canvas, event));
        console.log(aPos); 
    });
}


function renderPrimitive(canvas,primitiveType,color) {
    var aPos = [];
    var aColor = [];
    canvas.addEventListener("click", function(event) {
        aPos.push(getMousePos(canvas, event));
        aColor.push(color);
        const gl = canvas.getContext('webgl');
        const pointShader = new ShaderInfo(
            './shaderSrc/vs.glsl',
            './shaderSrc/fs.glsl',
            {aPos:aPos,aColor:aColor},
            {}
        );
        initShader(gl,pointShader).then((shader)=>{
            draw(gl,shader,primitiveType,()=>{});
        });
    });
}

function rgb(r,g,b) {
    return [r/255,g/255,b/255];
}