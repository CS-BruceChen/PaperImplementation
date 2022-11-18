#ifdef GL_ES
    precision mediump float;
#endif

attribute vec2 aPos;
attribute vec3 aColor;

varying vec4 vColor;
varying vec2 vTexCord;

void main(void) {
    gl_Position = vec4(aPos,0.0,1.0);
    gl_PointSize = 5.0;
    vColor = vec4(aColor,1.0);
    vTexCord = vec2((aPos.x+1)/2,(1-aPos.y)/2);
}