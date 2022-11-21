/*
Here are some APIs that help to init Shader Class

variable's name 'vsSource' means vertex shader source
variable's name 'fsSource' means fragment shader source 
variable's name 'vsPath' means vertex shader file path
variable's name 'fsPath' means fragment shader file path
*/ 


async function loadShaderFile(filename) {

    return new Promise((resolve, reject) => {
        const loader = new THREE.FileLoader();

        loader.load(filename, (data) => {
            resolve(data);
            //console.log(data);
        });
    });
}

async function getShaderString(filename) {

    let val = ''
    await this.loadShaderFile(filename).then(result => {
        val = result;
    });
    //console.log(val);
    return val;
}

function getShaderVarLocation(gl,varNameArray,shaderProgram,varType){
    var varLocation = {};
    if(varNameArray.length != 0 && typeof(varNameArray)!="undefined") {
        for(var i = 0; i < varNameArray.length; i++){
            if(varType=='attribute') varLocation[varNameArray[i]] = gl.getAttribLocation(shaderProgram,varNameArray[i]);
            else if(varType=='uniform') varLocation[varNameArray[i]] = gl.getUniformLocation(shaderProgram,varNameArray[i]);
        }
    }
    return varLocation;
}

function initVertexBuffers(gl,valueMatrix){
    var valueArray = [];
    var valueDimension = valueMatrix[0].length; 
    var vertexNum = valueMatrix.length;
    for(var i = 0; i < valueMatrix.length; ++i){
        if(valueMatrix[i].length != valueDimension || valueDimension == 0) {
            alert("format ERR::make sure every groups of data has the same length");
            return;
        } else {
            for(var j = 0; j < valueMatrix[i].length; ++j){
                valueArray.push(valueMatrix[i][j]);
            }
        }
    }
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(valueArray),
                  gl.STATIC_DRAW);

    return {
        dimension : valueDimension,
        buffer : buffer,
        vertexNum : vertexNum
    };
}

function getVertexBuffer(gl,shaderVar) {
    var varNameArray = Object.keys(shaderVar);
    var vertexBuffer = {};
    var arrayToCheckVertexNum = [];
    for(var i = 0; i < varNameArray.length; ++i){
        var bufferObject = initVertexBuffers(gl,shaderVar[varNameArray[i]]);
        vertexBuffer[varNameArray[i]] = bufferObject;
        arrayToCheckVertexNum.push(bufferObject.vertexNum);
    }
    var firstElementValue = arrayToCheckVertexNum[0];
    for(var i = 0; i < arrayToCheckVertexNum.length; ++i){
        if(arrayToCheckVertexNum[i]!=firstElementValue) {
            alert('ERR::num of vertex data is not consistent');
        }
    }
    return vertexBuffer;
}

function generateShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
 
function getShaderProgram (gl, vsSource, fsSource) {
    if (!gl) {
        alert("fail to initialize WebGL, check if your browser support it.");
        return;
    }

    const vertexShader = this.generateShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.generateShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // 创建失败，alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}




