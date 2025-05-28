import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
	const texture = textureLoader.load(path);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	return texture;
}

const textures = {
	dirt: loadTexture('textures/dirt.png'),
	grass: loadTexture('textures/grass.png'),
	grassSide: loadTexture('textures/grass_side.png'),
	stone: loadTexture('textures/stone.png'),
	coalOre: loadTexture('textures/coal_ore.png'),
	ironOre: loadTexture('textures/iron_ore.png'),
	leaves: loadTexture('textures/leaves.png'),
	treeSide: loadTexture('textures/tree_side.png'),
	treeTop: loadTexture('textures/tree_top.png'),
	sand: loadTexture('textures/sand.png'),
	runeOre: loadTexture('textures/rune_ore.png'),
	diamondOre: loadTexture('textures/diamond_ore.png'),
}

export const blocks =  {
  empty: {
	id: 0,
	name: 'empty'
  },
  grass: {
	id: 1,
	name: 'grass',
	color: 0x559020,
	material: [
		new THREE.MeshLambertMaterial({ map: textures.grassSide }), //Right
		new THREE.MeshLambertMaterial({ map: textures.grassSide }), //Left
		new THREE.MeshLambertMaterial({ map: textures.grass }), //Top
		new THREE.MeshLambertMaterial({ map: textures.dirt }), //Bottom
		new THREE.MeshLambertMaterial({ map: textures.grassSide }), //Front
		new THREE.MeshLambertMaterial({ map: textures.grassSide }) //Back
    ]
  },
  dirt: {
	 id: 2,
	 name: 'dirt',
	 color: 0x807020,
	 material: new THREE.MeshLambertMaterial({ map: textures.dirt })
  },
  stone: {
	 id: 3,
	 name: 'stone',
	 color: 0x808080,
	 scale: { x: 40, y: 10, z: 30 },
	 scarcity: 0.3,
	 material: new THREE.MeshLambertMaterial({ map: textures.stone })
  },
    coalOre: {
	 id: 4,
	 name: 'coalOre',
	 color: 0x202020,
	 scale: { x: 20, y: 10, z: 20 },
	 scarcity: 0.95,
	 material: new THREE.MeshLambertMaterial({ map: textures.coalOre })
  },
    ironOre: {
	 id: 5,
	 name: 'ironOre',
	 color: 0x806060,
	 scale: { x: 15, y: 10, z: 10 },
	 scarcity: 0.95,
	 material: new THREE.MeshLambertMaterial({ map: textures.ironOre })
  },
  tree: {
    id: 6,
    name: 'tree',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // top
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.treeSide })  // back
    ]
  },
  leaves: {
    id: 7,
    name: 'leaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.leaves })
  },
  sand: {
    id: 8,
    name: 'sand',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.sand })
  },
    runeOre: {
	 id: 9,
	 name: 'runeOre',
	 color: 0x806060,
	 scale: { x: 10, y: 10, z: 10 },
	 scarcity: 0.97,
	 material: new THREE.MeshLambertMaterial({ map: textures.runeOre })
  },
  diamondOre: {
	 id: 10,
	 name: 'diamondOre',
	 color: 0x806060,
	 scale: { x: 5, y: 10, z: 10 },
	 scarcity: 0.99,
	 material: new THREE.MeshLambertMaterial({ map: textures.diamondOre })
  },
cloud: {
  id: 11,
  name: 'cloud',
  visible: true,
  material: new THREE.MeshBasicMaterial({
    color: 0xf0f0f0,
    transparent: true,
    opacity: 1
  })
},

}

export const resources = [
	blocks.stone,
	blocks.coalOre,
	blocks.ironOre,
	blocks.runeOre,
	blocks.diamondOre
]