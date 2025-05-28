import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { resources } from './blocks.js';


export function createUI(scene, world, player, physics) {
  const gui = new GUI(); // global from lil-gui.min.js
  
  const sceneFolder = gui.addFolder('Scene');
  sceneFolder.add(scene.sun, 'visible').name('Show Sun');
  sceneFolder.add(scene.sun, 'intensity', 0.1, 10, 1).name('Sun Intensity');
  //sceneFolder.add(world.params.clouds, 'visible').name('Show Clouds');
const fogSettings = {
  enabled: true,
  color: scene.fog.color.getHex(),
  near: scene.fog.near,
  far: scene.fog.far,
};
sceneFolder.add(fogSettings, 'enabled').name('Show Fog').onChange((enabled) => {
  if (enabled) {
    scene.fog = new THREE.Fog(fogSettings.color, fogSettings.near, fogSettings.far);
  } else {
    scene.fog = null;
  }
});
/*sceneFolder.addColor(fogSettings, 'color')
  .name('Fog Color')
  .onChange((value) => {
    if (scene.fog) scene.fog.color.set(value);
  });*/
sceneFolder.add(fogSettings, 'near', 1, 200, 1) // min: 1, max: 200, step: 1
  .name('Fog Near')
  .onChange((value) => {
    if (scene.fog) scene.fog.near = value;
  });
sceneFolder.add(fogSettings, 'far', 1, 500, 1) // min: 1, max: 500, step: 1
  .name('Fog Far')
  .onChange((value) => {
    if (scene.fog) scene.fog.far = value;
  });

  
  const playerFolder = gui.addFolder('Player');
  playerFolder.add(player, 'selectionHelperVisible').name('Show Selection Helper').onChange(value => {
	  if (!value) {
		player.selectionHelper.visible = false; // hide manually when toggled off
	  }
  });
  playerFolder.add(physics, 'gravity', 16, 64).name('Gravity');
  playerFolder.add(physics.helpers, 'visible').name('Show Collision Helper');
  playerFolder.add(player, 'maxSpeed', 5, 40).name('Max Speed');
  playerFolder.add(player, 'jumpSpeed', 10, 40).name('Jump Speed');
  playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper');
  //playerFolder.add(player.fovHelper, 'visible').name('Show Dynamic FOV');
  playerFolder.add(player.camera, 'fov', 70, 110)
	 .name('Camera FOV')
	 .onChange((value) => {
	player.defaultFOV = value;
	player.sprintFOV = value + 10;
	player.camera.updateProjectionMatrix();
  });
  playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Bobbing');
  
  
  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(world, 'asyncLoading').name('Async Chunk Loading');
  terrainFolder.add(world, 'drawDistance', 1, 3, 1).name('Draw Distance');
  //gui.add(world.chunkSize, 'width', 8, 64, 1).name('Width');
  //gui.add(world.chunkSize, 'height', 8, 64, 1).name('Height');
  terrainFolder.add(world.params, 'seed', 0, 10000).name('Seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 32, 1).name('Magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 32, 1).name('Offset');
  terrainFolder.add(world.params.terrain, 'waterOffset', 0, 32, 1).name('WaterOffset');
  
  
  const resourcesFolder = terrainFolder.addFolder('Resources');
  resourcesFolder.close();
  
  resources.forEach(resource => {
	const resourceFolder = resourcesFolder.addFolder(resource.name);  
	resourceFolder.close();
	resourceFolder.add(resource, 'scarcity', 0, 1).name('Scarcity');
  
	const scaleFolder = resourceFolder.addFolder('Scale');
	scaleFolder.add(resource.scale, 'x', 10, 100).name('X Scale');
	scaleFolder.add(resource.scale, 'y', 10, 100).name('Y Scale');
	scaleFolder.add(resource.scale, 'z', 10, 100).name('Z Scale');
  });
  
  const treesFolder = terrainFolder.addFolder('Trees').close();
  treesFolder.add(world.params.trees, 'frequency', 0, 0.1).name('Frequency');
  treesFolder.add(world.params.trees.trunk, 'minHeight', 0, 10, 1).name('Min Trunk Height');
  treesFolder.add(world.params.trees.trunk, 'maxHeight', 0, 10, 1).name('Max Trunk Height');
  treesFolder.add(world.params.trees.canopy, 'minRadius', 0, 10, 1).name('Min Canopy Size');
  treesFolder.add(world.params.trees.canopy, 'maxRadius', 0, 10, 1).name('Max Canopy Size');
  treesFolder.add(world.params.trees.canopy, 'density', 0, 1).name('Canopy Density');

  /*const cloudsFolder = worldFolder.addFolder('Clouds').close();
  cloudsFolder.add(world.params.clouds, 'density', 0, 1).name('Density');
  cloudsFolder.add(world.params.clouds, 'scale', 1, 100, 1).name('Scale');*/
  
  
  
    document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyU') {
      if (gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  })
    gui.onFinishChange((event) => {
	world.generate();
	//Reset camera to world
	//player.camera.updateProjectionMatrix();
  });	  
}