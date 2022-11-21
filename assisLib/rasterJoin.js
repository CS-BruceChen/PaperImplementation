function getPointsAndPolygons(primitives){
    var points = [], polygons = [];
    for(var i = 0; i < primitives.length; ++i){
        var primitiveObject = primitives[i];
        delete primitiveObject.data.aColor;//泛用性有待商榷
        if(primitiveObject.type == 'point') points.push(primitiveObject); 
        else if (primitiveObject.type == 'polygon') {
            primitiveObject.type = 'region';
            polygons.push(primitiveObject);
        }
    }
    return {points:points,polygons:polygons};
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
    draw(gl,pointShader,fbo,width,height);

    //step2 : draw polygon on fbo
    gl.uniform1i(polygonShader.uniformLocations['uFBO'],0);

    draw(gl,polygonShader,fbo,width,height);

    var pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var sum=0;
    for(var i=0;i<pixels.length;++i){
        sum+=pixels[i];
    }
    console.log(sum);

}