# Paper Implementation

## 1.Shder API in the project

封装了webgl的上下文之后，在canvas上的绘制就变得十分简介优雅

```JavaScript
const gl = document.querySelector('#canvas').getContext('webgl');
const testInfo = new ShaderInfo(
    './shaderSrc/vs.glsl',//顶点着色器路径
    './shaderSrc/fs.glsl',//片段着色器路径
    {//顶点属性对象，对象键是顶点属性名，应当与着色器中变量名命名一致，对象值是二维数组形式的点数据
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
    {//uniform对象，对象键是uniform变量名，应当与着色器中uniform变量名一致，对象值形式任意

    }
); 
initShader(gl,testInfo).then((shader)=>{//异步方法initShader，返回值是一个Shader类
    draw(gl,shader,()=>{});//draw函数，自动分配显存，在第三个参数回调函数中指定对uniform的处理
})
```

