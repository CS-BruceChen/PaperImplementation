/*
value's name 'vsSource' means vertex shader source
value's name 'fsSource' means fragment shader source 
value's name 'vsPath' means vertex shader file path
value's name 'fsPath' means fragment shader file path
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

function getShaderVarLocation(gl,varNameArray,shaderProgram){
    var varLocation = {};
    if(varNameArray.length != 0 && typeof(varNameArray)!="undefined") {
        for(var i = 0; i < varNameArray.length; i++){
            varLocation[varNameArray[i]] = gl.getAttribLocation(shaderProgram,varNameArray[i]);
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

/**
 * generate a shader object from shader infomation
 * @param gl context  
 * @param shaderInfo shader's infomation
 * @returns shader object promise
 */ 
async function initShader(gl,shaderInfo) {
    var vsPath = shaderInfo.vsPath;
    var fsPath = shaderInfo.fsPath;
    var shaderVar = shaderInfo.shaderVar;
    
    let vsSource = await getShaderString(vsPath);
    let fsSource = await getShaderString(fsPath);

    const shader = new Shader(gl,vsSource,fsSource);

    const shaderObject = {
        program : shader.shaderProgram,
        attribLocations : getShaderVarLocation(gl,shaderVar['attribute'],shader.shaderProgram),
        uniformLocations : getShaderVarLocation(gl,shaderVar['uniform'],shader.shaderProgram),
    };
    return shaderObject;//is a Promise
}



