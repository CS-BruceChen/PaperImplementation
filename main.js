function main() {
    console.log('running');
    const gl = document.querySelector('#canvas').getContext('webgl');
    const testInfo = new ShaderInfo(
        './shaderSrc/vs.glsl',
        './shaderSrc/fs.glsl',
        {
            aPos : [
                [ 1.0, 1.0],
                [-1.0, 1.0],
                [ 1.0,-1.0],
                [-1.0,-1.0]
            ],
            aColor : [
                [1.0,1.0,1.0],
                [1.0,0.0,0.0],
                [0.0,1.0,0.0],
                [0.0,0.0,1.0]
            ],
        },
        {

        }
    ); 
    initShader(gl,testInfo).then((shader)=>{
        draw(gl,shader,()=>{});
    })
    
    // 
    // console.log(shader);
}