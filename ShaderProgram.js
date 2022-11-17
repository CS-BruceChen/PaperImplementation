class Shader {
    constructor(gl,vsSource,fsSource) {
        if(!gl) {
            alert('fail to init webgl, your browser maybe not support');
            return;
        }

        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // 创建着色器程序

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // 创建失败，alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            this.shaderProgram = null;
            return;
        }

        this.shaderProgram = shaderProgram;
        return;
    }
    loadShader(gl,type,source) {
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
}