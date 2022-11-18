#ifdef GL_ES
    precision mediump float;
#endif

uniform sampler2D uTex;
varying vec4 vColor;
varying vec2 vTexCord;

void main() {
    vec4 originColor = texture2D(uTex,vTexCord); 
    gl_FragColor = vColor;
}