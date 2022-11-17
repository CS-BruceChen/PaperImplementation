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

class ShaderInfo{
  constructor(vsPath,fsPath,attributeVar,uniformVar){
      this.vsPath = vsPath;
      this.fsPath = fsPath;
      if(Object.prototype.toString.call(attributeVar)!='[object Object]'
      ||Object.prototype.toString.call(uniformVar)!='[object Object]') {
          alert("ShaderInfo ERR::wrong type");
          return;
      }
      this.shaderVarDescription = {
          attribute : attributeVar,
          uniform : uniformVar,
      }
  }
};