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

    //step I : draw points on fbo 
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // draw(gl,pointShader)//,fbo,width,height);


    // var pixels = new Uint8Array(width * height * 4);
    // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // // console.log(pixels);
    // var sum=0;
    // for(var i=0;i<pixels.length;++i){
    //     sum+=pixels[i];
    // }
    // console.log(sum);


    //step2 : draw polygon on fbo
    // gl.uniform1i(polygonShader.uniformLocations['uFBO'],0);

    // console.log(polygonShader);
    draw(gl,polygonShader);//,fbo,width,height);

    

    
    

}