function triangulate(vertexCoords){
    
    //use Delaunator to do triangulate
    const delaunay = Delaunator.from(vertexCoords);
    const triangles = delaunay.triangles;
    
    //get the 2D array of the result
    var triangulatedResult = [];
    for (let i = 0; i < triangles.length; i += 3) {
        for(let j = 0; j < 3; ++j){
            triangulatedResult.push(vertexCoords[triangles[i+j]])
        }
    }

    return triangulatedResult;
}

function getPointsAndPolygons(primitives){
    var points = [], polygons = [];
    for(var i = 0; i < primitives.length; ++i){
        var primitiveObject = primitives[i];
        delete primitiveObject.data.aColor;//泛用性有待商榷
        if(primitiveObject.type == 'point') points.push(primitiveObject); 
        else if (primitiveObject.type == 'polygon') {
            primitiveObject.type = 'region';
            primitiveObject.data.aPos = triangulate(primitiveObject.data.aPos);
            polygons.push(primitiveObject);
        }
    }
    return {points:points,polygons:polygons};
}

function initFramebufferObject(gl,width,height,debug) {
    if(debug) return null;
    var framebuffer = gl.createFramebuffer();

   // 新建纹理对象作为帧缓冲区的颜色缓冲区对象
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // framebuffer.texture = texture;
    // 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
    // var depthBuffer = gl.createRenderbuffer();
    // gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // 检测帧缓冲区对象的配置状态是否成功
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return {fb : framebuffer,tx : texture};
}

// function getFBO()

function getQueryResult(gl,width,height){
    var pixelsPolygon = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelsPolygon);
    var sumPolygon=0;
    for(var i=0;i < pixelsPolygon.length;++i){
        sumPolygon += pixelsPolygon[i];
    }
    // console.log(sumPolygon/255 - width * height);
    return sumPolygon/255 - width * height;
}

async function rasterJoin(gl,primitives){
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

    await pointShader.initShader();

    pointShader.inputPrimitives(points);

    const polygonShader = new Shader(
        gl,
        './shaderSrc/polygonvs.glsl',
        './shaderSrc/polygonfs.glsl',
        ['aPos'],
        ['uFBO']
    );

    await polygonShader.initShader();

    for(var i=0; i<polygons.length; ++i){
        var eachPolygon = [polygons[i]];
        polygonShader.inputPrimitives(eachPolygon);
        clearCanvas(gl);

        //step I : draw points on fbo 
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);

            var point = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, point);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D, point,0);
            gl.bindTexture(gl.TEXTURE_2D,null);

            if (gl.FRAMEBUFFER_COMPLETE !== gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
                console.log('Frame buffer object is incomplete: ' + gl.checkFramebufferStatus(gl.FRAMEBUFFER).toString());
                return;
            }

            // gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.NONE]);
            gl.viewport(0,0,width,height);
            draw(gl,pointShader);

            var allPoint = getQueryResult(gl,width,height);//this step prove that the point num is right;

            // gl.useProgram(polygonShader.program);
            // gl.activeTexture(gl.TEXTURE0);
            // gl.bindTexture(gl.TEXTURE_2D,point);
            // gl.uniform1i(polygonShader.uniformLocations['uFBO'],0);

            

            if (gl.FRAMEBUFFER_COMPLETE !== gl.checkFramebufferStatus(gl.FRAMEBUFFER)) {
                console.log('Frame buffer object is incomplete: ' + gl.checkFramebufferStatus(gl.FRAMEBUFFER).toString());
                return;
            }

            // gl.drawBuffers([gl.NONE,gl.COLOR_ATTACHMENT1]);
            gl.viewport(0,0,width,height);
            draw(gl,polygonShader);

            var outPoint = getQueryResult(gl,width,height);
            console.log('Polygon' + i + 'has ' + (allPoint-outPoint) + ' points inside'); 
            

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);

    }
    
}