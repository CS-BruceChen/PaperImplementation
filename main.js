function main() {
    console.log('running');
    const gl = document.querySelector('#canvas').getContext('webgl');
    const testInfo = new ShaderInfo(
        './vs.glsl',
        './fs.glsl',
        {
            aPos : [
                [0.0,0.5],
                [-0.5,-0.5],
                [0.5,-0.5]
            ],
            aColor : [
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