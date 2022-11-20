#ifdef GL_ES
    precision mediump float;
#endif

attribute vec2 aPos;
varying vec2 vPos;

void main(){
    gl_Position = vec4(aPos,0,0);
    vPos = aPos;
}