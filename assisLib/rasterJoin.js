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

    // 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
    // var depthBuffer = gl.createRenderbuffer();
    // gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);//?也许需要适配视口？暂时先定为256x256

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

    return framebuffer;
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

    polygonShader.inputPrimitives(polygons);

    
    //create Texture and fbo

    // var texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // var fbo = gl.createFramebuffer();
    // gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // //unbind
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.bindTexture(gl.TEXTURE_2D, null);


    

    //step I : draw points on fbo 
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything  must be 1.0
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var fbo = initFramebufferObject(gl,width,height,false);
    draw(gl,pointShader,fbo,width,height);


    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var pixelsPoint = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelsPoint);
    // console.log(pixels);
    
    var sumPoint=0;
    for(var i=0;i < pixelsPoint.length;++i){
        sumPoint += pixelsPoint[i];
    }
    if(sumPoint == 0) sumPoint=0;
    else sumPoint = sumPoint/255 - width*height + 1; 
    // console.log(sum);
    // console.log(sum/255 - width*height + 1);


    //step2 : draw polygon on fbo
    gl.useProgram(polygonShader.program);
    gl.uniform1i(polygonShader.uniformLocations['uFBO'],0);

    // console.log(polygonShader);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    draw(gl,polygonShader,fbo,width,height);



    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var pixelsPolygon = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelsPolygon);
    // console.log(pixels);
    
    var sumPolygon=0;
    for(var i=0;i < pixelsPolygon.length;++i){
        sumPolygon += pixelsPolygon[i];
    }
    if(sumPolygon == 0) sumPolygon=0;
    else sumPolygon = sumPolygon/255 - width*height + 1; 
    // console.log(sum);
    // console.log(sum/255 - width*height + 1);

    console.log(sumPoint-sumPolygon);
    

    
    

}