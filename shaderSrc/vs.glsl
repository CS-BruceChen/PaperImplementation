#ifdef GL_ES
    precision mediump float;
#endif

attribute vec2 aPos;
attribute vec3 aColor;

varying vec4 vColor;

void main(void) {
    gl_Position = vec4(aPos,0.0,1.0);
    gl_PointSize = 5.0;
    vColor = vec4(aColor,1.0);
}