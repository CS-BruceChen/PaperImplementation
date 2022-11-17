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

class Shader{
    constructor(gl, vsSource, fsSource) {
        if(!gl){
            alert("fail to initialize WebGL, check if your browser support it.");
            return;
        }

        const vertexShader = this.generateShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.generateShader(gl, gl.FRAGMENT_SHADER, fsSource);
      
        // 创建着色器程序
      
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        // 创建失败，alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
          return;
        }
      
        this.shaderProgram = shaderProgram;
        this.gl = gl;
    }
    generateShader(gl, type, source) {
        const shader = gl.createShader(type);
      
        // Send the source to the shader object
      
        gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
      
        return shader;
      }
    
    
};

async function initShader(gl,vsPath,fsPath) {


    let vsSource = await getShaderString(vsPath);
    let fsSource = await getShaderString(fsPath);

    return new Shader(gl,vsSource,fsSource);

}

