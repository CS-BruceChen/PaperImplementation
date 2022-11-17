/*
value's name 'vsSource' means vertex shader source
value's name 'fsSource' means fragment shader source 
value's name 'vsPath' means vertex shader file path
value's name 'fsPath' means fragment shader file path
value's name 'shaderVarDescription' means a type of object like this
{
    attribute : {'aPos':[[1,1],[2,2]],'aColor':[],'aNorm':[]},
    uniform : {},
}
 

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

function getShaderVarLocation(gl,type,shaderVarDescription,shaderProgram){
    var varArray = Object.keys(shaderVarDescription[type]);
    var varLocation = {};
    if(varArray.length != 0 && typeof(varArray)!="undefined") {
        for(var i = 0; i < varArray.length; i++){
            varLocation[varArray[i]] = gl.getAttribLocation(shaderProgram,varArray[i]);
        }
    }
    return varLocation;
}

function initVertexBuffers(gl,valueMatrix){
    var valueArray = [];
    var valueDimension = valueMatrix[0];
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
    };
}

function getVertexAttributeValues(gl,shaderVarDescription) {
    var varNameArray = Object.keys(shaderVarDescription['attribute']);
    var vertexAttributeValues = {};
    for(var i = 0; i < varNameArray.length; ++i){
        vertexAttributeValues[varNameArray[i]] = initVertexBuffers(gl,shaderVarDescription['attribute'][varNameArray[i]]);
    }
    return vertexAttributeValues;
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
    var shaderVarDescription = shaderInfo.shaderVarDescription;
    
    let vsSource = await getShaderString(vsPath);
    let fsSource = await getShaderString(fsPath);

    const shader = new Shader(gl,vsSource,fsSource);

    const shaderObject = {
        vertexAttributeValues : getVertexAttributeValues(gl,shaderVarDescription),
        program : shader.shaderProgram,
        attribLocations : getShaderVarLocation(gl,'attribute',shaderVarDescription,shader.shaderProgram),
        uniformLocations : getShaderVarLocation(gl,'uniform',shaderVarDescription,shader.shaderProgram),
    };
    return shaderObject;//is a Promise
}



