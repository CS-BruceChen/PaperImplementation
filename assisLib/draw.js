function draw(gl,shader,uniformOperation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

    // console.log(shader.vertexAttributeValues[attributeNameArray[0]].vertexNum);
    // console.log('draw');
    {
        const offset = 0;
        const vertexCount = shader.vertexAttributeValues[attributeNameArray[0]].vertexNum;
        // console.log(vertexCount);
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
    
    
}