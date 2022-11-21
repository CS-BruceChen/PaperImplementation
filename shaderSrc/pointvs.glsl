#ifdef GL_ES
    precision mediump float;
#endif

attribute vec2 aPos;

void main(){
    gl_Position = vec4(aPos,0,1);
    gl_PointSize = 1.0;
}
