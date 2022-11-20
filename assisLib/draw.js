/*
primitives应当是一个数组，里面存放了各种几何对象（PO : primitive object）
一个典型的几何对象应当包含以下字段：

eg: a point's PO
{
    type : 'point',
    data : {
        aPos : [
            [1,0]
        ],
        aColor : [
            [0.5,0.5,0.5]
        ]
    }
}
eg: a polygon's PO
{
    type : 'polygon',
    data : {
        aPos : [
            [1,0],
            [0,1],
            [0.5,0.5],
        ],
        aColor : [
            [0.5,0.5,0.5],
            [0.5,0.5,0.5],
            [0.5,0.5,0.5],
        ]
    }
}
当然，我这里的设想是，data对象的键名称和着色器的变量名保持一致，可能需要专门写一个构造primitives的函数？

*/

function draw(gl,shader,/*drawType,uniformOperation,*/primitives) {
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    // gl.clearDepth(1.0);                 // Clear everything
    // gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var glTypeMap = {
        point : gl.POINTS,
        polyline : gl.LINE_STRIP,
        polygon : gl.LINE_LOOP,
        line : gl.LINES,
        region : gl.TRIANGLE_STRIP,
    }

    for(var i = 0; i < primitives.length; ++i){
        var primitiveObject = primitives[i];
        var primitiveBuffers = getVertexBuffer(gl,primitiveObject.data);
        var primitiveVarNames = Object.keys(primitiveBuffers);

        for(var j = 0; j < primitiveVarNames.length; ++j){
            const varName = primitiveVarNames[j];//means var name now
            const bufferObject = primitiveBuffers[varName];//bufferObject means BufferObject for the var now
            
            const dimension = bufferObject.dimension;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferObject.buffer);
            gl.vertexAttribPointer(
                shader.attribLocations[varName],
                dimension,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(shader.attribLocations[varName]);
        }

        gl.useProgram(shader.program);
        // if(!uniformOperation) uniformOperation(gl,shader.uniformLocations);

        {
            // console.log('drawType:'+primitiveObject.type);
            const glDrawType = glTypeMap[primitiveObject.type]
            const offset = 0;
            const vertexCount = primitiveBuffers[primitiveVarNames[0]].vertexNum;
            gl.drawArrays(glDrawType, offset, vertexCount);

            //unbind
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
        }

        
        
    }



    // for(var i = 0; i < attributeNameArray.length; i++){
    //     var attributeValueBuffer = shader.vertexAttributeValues[attributeNameArray[i]];
    //     const dimension = attributeValueBuffer.dimension;
    //     const type = gl.FLOAT;
    //     const normalize = false;
    //     const stride = 0;
    //     const offset = 0;

    //     gl.bindBuffer(gl.ARRAY_BUFFER, attributeValueBuffer.buffer);
    //     gl.vertexAttribPointer(
    //         shader.attribLocations[attributeNameArray[i]],
    //         dimension,
    //         type,
    //         normalize,
    //         stride,
    //         offset);
    //     gl.enableVertexAttribArray(shader.attribLocations[attributeNameArray[i]]);
    // }

    // gl.useProgram(shader.program);
    // if(!uniformOperation) uniformOperation(gl,shader.uniformLocations);

    // {
    //     console.log('drawType:'+drawType);
    //     const glDrawType = glTypeMap[drawType];
    //     const offset = 0;
    //     const vertexCount = shader.vertexAttributeValues[attributeNameArray[0]].vertexNum;
    //     gl.drawArrays(glDrawType, offset, vertexCount);
    // }
    
    
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / (rect.width / 2) - 1);
    var y = (1 - (event.clientY - rect.top) / (rect.height / 2));
    return [x,y];
}

function rgb(r,g,b) {
    return [r/255,g/255,b/255];
}

function drawUrlToCanvas(url,canvas){
    /////////////////////////utils/////////////////////////
    var createShader=function(gl, type, source) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    var createProgram=function(gl, vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
    var initWebGL=function(gl, vertexSource, fragmentSource) {
        let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
        let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        let program = createProgram(gl, vertexShader, fragmentShader);
        return program;
    }
    var createTexture=function(gl) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    }
    //////////////////////////////////////////////////////
      
    // 将顶点的位置数据修改为：
    const gl = canvas.getContext("webgl");

    const vertexShader = `
        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main () {
            gl_Position = a_position;
            v_texCoord = a_texCoord;
        }  
    `;

    const fragmentShader = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        void main () {
            gl_FragColor = texture2D(u_texture, v_texCoord);
        }
    `;
    const pointPos = [
        -1, 1,
        -1, -1,
        1, -1,
        1, -1,
        1, 1,
        -1, 1,
    ];
    const texCoordPos = [
        0, 1,
        0, 0,
        1, 0,
        1, 0,
        1, 1,
        0, 1
    ];

    const program = initWebGL(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordPos), gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(program, "a_position");
    const a_texCoord = gl.getAttribLocation(program, "a_texCoord");

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        a_position,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
    );
    gl.enableVertexAttribArray(a_position);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(
        a_texCoord,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
    );
    gl.enableVertexAttribArray(a_texCoord);

    const texture = createTexture(gl);
    const image = new Image();
    image.src = url;
    image.onload = function () {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }   

}


function renderPrimitive(canvas,primitiveType,color) {
    var aPos = [];
    var aColor = [];
    
    canvas.onclick = function(event) {
        aPos.push(getMousePos(canvas, event));
        aColor.push(color);
        const gl = canvas.getContext('webgl');
        const primitiveShader = new ShaderInfo(
            './shaderSrc/vs.glsl',
            './shaderSrc/fs.glsl',
            {aPos:aPos,aColor:aColor},
            {}
        );
        initShader(gl,primitiveShader).then((shader)=>{
            draw(gl,shader,primitiveType,()=>{});
        });
    }
    
}

function clearCanvas(canvas) {
    var gl = canvas.getContext('webgl');
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// function initCanvas(canvas) {
//     var aPos = [];
//     var aColor = [];
    
//     canvas.onclick = function(event) {
//         aPos.push(getMousePos(canvas, event));
//         aColor.push(color);
//         const gl = canvas.getContext('webgl');
//         const primitiveShader = new ShaderInfo(
//             './shaderSrc/vs.glsl',
//             './shaderSrc/fs.glsl',
//             {aPos:aPos,aColor:aColor},
//             {}
//         );
//         initShader(gl,primitiveShader).then((shader)=>{
//             draw(gl,shader,primitiveType,()=>{});
//         });
//     }
// }