#ifdef GL_ES
    precision mediump float;
#endif

uniform sampler2D uFBO;
varying vec2 vPos;

void main(){
    float x = (vPos.x + 1.0) / 2.0;
    float y = (1.0 - vPos.y) / 2.0;
    gl_FragColor = vec4(texture2D(uFBO,vec2(x,y)).x,0.0,0.0,1.0);
    // gl_FragColor = vec4(isInPolygon,0.0,0.0,1.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}