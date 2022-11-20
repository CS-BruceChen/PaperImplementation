function getPointsAndPolygons(primitives){
    var points = [], polygons = [];
    for(var i = 0; i < primitives.length; ++i){
        var primitiveObject = primitives[i];
        delete primitiveObject.data.aColor;//泛用性有待商榷
        if(primitiveObject.type == 'point') points.push(primitiveObject); 
        else if (primitiveObject.type == 'polygon') polygons.push(primitiveObject);
    }
    return {points:points,polygons:polygons};
}

function rasterJoin(gl,primitives){
    const width = 1000;
    const height = 600;

    var pointsAndPolygons = getPointsAndPolygons(primitives);
    var points = pointsAndPolygons.points;
    var polygons = pointsAndPolygons.polygons;


    const pointShader = new Shader(
        gl,
        './shaderSrc/pointvs.glsl',
        './shaderSrc/pointfs.glsl',
        ['aPos'],
        [],
    );

    const polygonShader = new Shader(
        gl,
        './shaderSrc/polygonvs.glsl',
        './shaderSrc/polygonfs.glsl',
        ['aPos'],
        ['uFBO']
    );

    //create Texture and fbo

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    //step I : draw points on fbo 
    for(var i = 0; i < points.length; ++i) {
        const pointObject = points[i];
        const pointBufferObject = getVertexBuffer(gl,pointObject.data).aPos;
        
        const dimension =pointBufferObject.dimension;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, pointBufferObject.buffer);
        gl.vertexAttribPointer(
            pointShader.attributeLocations['aPos'],
            dimension,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(pointShader.attributeLocations['aPos']);

        gl.useProgram(pointShader.program);

        {
            const offset = 0;
            const pointVertexCount = pointBufferObject.vertexNum;
            
            gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
            gl.viewport(0,0,width,height); //不太清楚需不需要设置
            gl.drawArray(gl.POINTS,offset,pointVertexCount);

            //unbind
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            
        }
    }

    //step2 : draw polygon on fbo
    gl.uniform1i(polygonShader.uniformLocations['uFBO'],0);

    for(var i = 0; i < points.length; ++i) {
        const polygonObject = polygons[i];
        const polygonBufferObject = getVertexBuffer(gl,polygonObject.data).aPos;
        
        const dimension =polygonBufferObject.dimension;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, polygonBufferObject.buffer);
        gl.vertexAttribPointer(
            polygonShader.attributeLocations['aPos'],
            dimension,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(polygonShader.attributeLocations['aPos']);

        gl.useProgram(polygonShader.program);

        {
            const offset = 0;
            const polygonVertexCount = polygonBufferObject.vertexNum;
            
            gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
            gl.viewport(0,0,width,height); //不太清楚需不需要设置
            gl.drawArray(gl.POINTS,offset,polygonVertexCount);

            //unbind
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            
        }

        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        console.log(pixels);

    }



    
    

    
}