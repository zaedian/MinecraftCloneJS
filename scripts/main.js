import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Physics } from './physics.js';
import { createUI } from './ui.js';
import { ModelLoader } from './modelLoader.js';

const stats = new Stats();
document.body.append(stats.dom);

//Setup Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//Setup Camera
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(-32, 16, -32);
orbitCamera.layers.enable(1);

//Setup Controls
const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(16, 0, 16);
controls.update();

//Setup Scene
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world);

//Setup Skybox
const skyboxloader = new THREE.CubeTextureLoader();
scene.background = skyboxloader.load([
    'skybox/clouds1_east_iq8cr6.png', 'skybox/clouds1_west_gwd0gs.png', 'skybox/clouds1_up_tnxqka.png',
    'skybox/clouds1_down_p10z7n.png', 'skybox/clouds1_north_anykiq.png', 'skybox/clouds1_south_bek22d.png'
]);

//Setup Fog
scene.fog = new THREE.Fog(0x80a0e0, 5, 175);

//Setup player
const player = new Player(scene, world);

//Setup physics
const physics = new Physics(scene);

// Setup crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'fixed';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.width = '2px';
crosshair.style.height = '2px';
crosshair.style.background = 'white';
crosshair.style.borderRadius = '50%';
crosshair.style.pointerEvents = 'none';
crosshair.style.zIndex = '1000';
document.body.appendChild(crosshair);



//Setup optional first person shader
/*const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, player.camera));
import { EffectComposer } from 'effectcomposer';
import { RenderPass } from 'renderpass';
import { ShaderPass } from 'shaderpass';
import { CustomShaderFirstPerson } from 'firstpersonshader';
const customShaderFirstPersonPass = new ShaderPass(CustomShaderFirstPerson);
customShaderFirstPersonPass.renderToScreen = true;
customShaderFirstPersonPass.material.transparent = true;
composer.addPass(customShaderFirstPersonPass);*/

//Setup tool model
const modelLoader = new ModelLoader((models) => {
  player.setTool(models.pickaxe);
})

//Setup Light
let sun;
function setupLights() {
  sun = new THREE.DirectionalLight();
  sun.intensity = 2;
  sun.position.set(50, 50, 50);
  sun.castShadow = true;

  // Set the size of the sun's shadow box
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = 0.0002;
  sun.shadow.normalBias = 0.055; 

  sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
  
  scene.sun = sun;
  
  scene.add(sun);
  scene.add(sun.target);

  const ambient = new THREE.AmbientLight();
  ambient.intensity = 0.2;
  scene.add(ambient);
}

//Render loop
let previousTime = performance.now();
function animate() {
	let currentTime = performance.now();
	let dt = (currentTime - previousTime) / 1000;
	
	requestAnimationFrame(animate);
	
	if (player.controls.isLocked) {
	player.update(world, dt);	
	physics.update(dt, player, world);
	world.update(player);
	
	sun.position.copy(player.camera.position);
    sun.position.sub(new THREE.Vector3(-50, -50, -50));
    sun.target.position.copy(player.camera.position);
	}

	if (player.controls.isLocked) {
	  crosshair.style.visibility = 'visible';
	} else {
	  crosshair.style.visibility = 'hidden';
	} 

	//composer.render();
    renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
	
	stats.update();
	
	previousTime = currentTime;
}


//Resize and center camera
window.addEventListener('resize', () => {
  // Resize camera aspect ratio and renderer size to the new window size
  orbitCamera.aspect = window.innerWidth / window.innerHeight;
  orbitCamera.updateProjectionMatrix();
  player.camera.aspect = window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

setupLights();
createUI(scene, world, player, physics);
animate();