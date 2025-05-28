import * as THREE from 'three';

const CustomShaderFirstPerson = {
  uniforms: {
    "tDiffuse": { value: null },                             // Rendered texture
    "center": { value: new THREE.Vector2(0.5, 0.5) },        // Center of effect
    "crosshairSize": { value: 0.001 },                       // Size of the crosshair (radius of the dot)
    "crosshairThickness": { value: 0.001 }                   // Thickness of the crosshair border
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec2 center;
uniform sampler2D tDiffuse;
uniform float crosshairSize;
uniform float crosshairThickness;

varying vec2 vUv;

void main() {
  vec2 dir = vUv - center;

  float aspect = 1.0;
  if (gl_FragCoord.x / gl_FragCoord.y > 1.0) {
    aspect = gl_FragCoord.x / gl_FragCoord.y;
  }

  float dist = length(vec2(dir.x * aspect, dir.y));
  vec4 texColor = texture2D(tDiffuse, vUv);  // DO NOT CLAMP vUv

  float borderSize = crosshairSize + crosshairThickness;

  vec4 finalColor = texColor;

  if (dist < crosshairSize) {
    finalColor = vec4(1.0, 1.0, 1.0, 1.0);  // White dot
  } else if (dist < borderSize) {
    finalColor = vec4(0.0, 0.0, 0.0, 1.0);  // Black border
  }

  gl_FragColor = finalColor;
}


  `,
};

export { CustomShaderFirstPerson };
