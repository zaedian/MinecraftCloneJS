import * as THREE from 'three';
import { PointerLockControls } from 'pointerlockcontrols';
import { World } from './world.js';
import { blocks } from './blocks.js';

const CENTER_SCREEN = new THREE.Vector2();


export class Player {
  
  defaultFOV = 90;
  fovLerpSpeed = 0.05;
  sprintFOV = this.defaultFOV + 10;
  
  selectionHelperVisible = true;
  
  bobbingTime = 0;
  bobbingSpeed = 0.01;
  bobbingAmplitude = 0.5;
	
  height = 1.5;
  radius = 0.5;
  maxSpeed = 5;

  jumpSpeed = 10;
  sprinting = false;
  onGround = false;

  input = new THREE.Vector3();
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();

  camera = new THREE.PerspectiveCamera(this.defaultFOV, window.innerWidth / window.innerHeight, 0.1, 100);
  cameraHelper = new THREE.CameraHelper(this.camera);
  controls = new PointerLockControls(this.camera, document.body);
  debugCamera = false;

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 3);
  selectedCoords = null;
  activeBlockId = blocks.empty.id;

	tool = {
		container: new THREE.Group(),
		animate: false,
		animationDuration: 300,
		animationAmplitude: 0.5,
		animationStart: 0,
		animationSpeed: 0.025,
		animation: null,
		toolMesh: undefined,
		
		get animationTime() {
			return performance.now() - this.animationStart;
		},
		
		startAnimation() {
			if (this.animate) return;
			
		    this.animate = true;
			this.animationStart = performance.now();
			
			clearTimeout(this.animate);
			
			this.animation = setTimeout(() => {
				this.animate = false;
			}, this.animationDuration);	
		},
		
		update() {
			if (this.animate && this.toolMesh) {
				this.toolMesh.rotation.y = this.animationAmplitude * Math.sin(this.
				animationTime * this.animationSpeed);	
			}
		},
		
		setMesh(mesh) {
			this.clear();
			
			this.toolMesh = mesh;
			this.add(this.toolMesh);
			mesh.receiveShadow = true;
			mesh.castShadow = true;

			this.position.set(0.6, -0.3, -0.5);
			this.scale.set(0.5, 0.5, 0.5);
			this.rotation.z = Math.PI / 2;
			this.rotation.y = Math.PI + 0.2;
		},
	}


  constructor(scene, world) {
    this.world = world;
    this.position.set(32, 32, 32);
	this.camera.layers.enable(1);
    this.cameraHelper.visible = false;
    scene.add(this.camera);
    scene.add(this.cameraHelper);

    // Hide/show instructions based on pointer controls locking/unlocking
    this.controls.addEventListener('lock', this.onCameraLock.bind(this));
    this.controls.addEventListener('unlock', this.onCameraUnlock.bind(this));

    // The tool is parented to the camera
    this.camera.add(this.tool.container);

    // Set raycaster to use layer 0 so it doesn't interact with water mesh on layer 1
    this.raycaster.layers.set(0);
    this.camera.layers.enable(1);

    // Wireframe mesh visualizing the player's bounding cylinder
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    this.boundsHelper.visible = false;
    scene.add(this.boundsHelper);

    // Helper used to highlight the currently active block
    const selectionMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.3,
      color: 0xffffaa
    });
    const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
    scene.add(this.selectionHelper);
	
	this.raycaster.layers.set(0);

    // Add event listeners for keyboard/mouse events
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
	document.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  onCameraLock() {
    //document.getElementById('overlay').style.visibility = 'hidden';
  }

  onCameraUnlock() {
    if (!this.debugCamera) {
      //document.getElementById('overlay').style.visibility = 'visible';
    }
  }

  /**
   * Updates the state of the player
   * @param {World} world 
   */
  update(world, dt) {
    this.updateBoundsHelper();
    this.updateRaycaster(world);
	this.updateFOV();
	this.tool.update();
	//this.updateCameraBobbing(dt);
  }

  /**
   * Updates the raycaster used for block selection
   * @param {World} world 
   */
updateRaycaster(world) {
  this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
  const intersections = this.raycaster.intersectObject(world, true);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const chunk = intersection.object.parent;
    const blockMatrix = new THREE.Matrix4();
    intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

    this.selectedCoords = chunk.position.clone();
    this.selectedCoords.applyMatrix4(blockMatrix);

    if (this.activeBlockId !== blocks.empty.id) {
      this.selectedCoords.add(intersection.normal);
    }

    this.selectionHelper.position.copy(this.selectedCoords);

    this.selectionHelper.visible = this.selectionHelperVisible;

  } else {
    this.selectedCoords = null;
	
    this.selectionHelper.visible = false;
  }
}

  
	updateFOV() {
	  const targetFOV = this.sprinting ? this.sprintFOV : this.defaultFOV;
	  this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, this.fovLerpSpeed);
	  this.camera.updateProjectionMatrix();
	}

  
updateCameraBobbing(dt) {
  const speed = Math.sqrt(this.input.x ** 2 + this.input.z ** 2); // Get the speed of movement

  // Adjust bobbing based on movement speed
  if (speed > 0 && this.onGround) {
    const walkSpeed = this.sprinting ? 1.5 : 1.0;  // Sprinting moves faster, regular walking slower
    const bobFrequency = 6 * walkSpeed;  // Frequency of the bobbing
    const bobHeight = 0.1 * walkSpeed;   // Height of the bobbing

    // Increment the time for bobbing, affected by speed
    this.bobbingTime += dt * this.bobbingSpeed;

    // Calculate the bobbing offset using sine wave
    const bobOffset = Math.sin(this.bobbingTime * bobFrequency) * bobHeight;

    // Apply the calculated bobbing offset to the camera position
    this.camera.position.y = this.position.y + bobOffset;

  } else {
    // When not moving, reset the bobbing position without resetting bobbingTime
    this.camera.position.y = this.position.y;
  }
}




  /**
   * Updates the state of the player based on the current user inputs
   * @param {Number} dt 
   */
  applyInputs(dt) {
    if (this.controls.isLocked === true) {
      this.velocity.x = this.input.x * (this.sprinting ? 1.75 : 1);
      this.velocity.z = this.input.z * (this.sprinting ? 1.75 : 1);
      this.controls.moveRight(this.velocity.x * dt);
      this.controls.moveForward(this.velocity.z * dt);
      this.position.y += this.velocity.y * dt;

      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = 0;
      }
    }

    document.getElementById('player-position').innerHTML = this.toString();
  }

  /**
   * Updates the position of the player's bounding cylinder helper
   */
  updateBoundsHelper() {
    this.boundsHelper.position.copy(this.camera.position);
    this.boundsHelper.position.y -= this.height / 2;
  }

  /**
   * Set the tool object the player is holding
   * @param {THREE.Mesh} tool 
   */
  setTool(tool) {
    this.tool.container.clear();
    this.tool.container.add(tool);
    this.tool.container.receiveShadow = true;
    this.tool.container.castShadow = true;

    this.tool.container.position.set(0.9, -0.6, -0.5);
    this.tool.container.scale.set(0.5, 0.5, 0.5);
    this.tool.container.rotation.z = Math.PI / 2;
    this.tool.container.rotation.y = Math.PI - 0.1;
	
	this.tool.toolMesh = tool;
  }

  /**
   * Animates the tool rotation
   */
  updateToolAnimation() {
    if (this.tool.container.children.length > 0) {
      const t = this.tool.animationSpeed * (performance.now() - this.tool.animationStart);
      this.tool.container.children[0].rotation.y = 0.5 * Math.sin(t);
    }
  }

  /**
   * Returns the current world position of the player
   * @returns {THREE.Vector3}
   */
  get position() {
    return this.camera.position;
  }

  /**
   * Returns the velocity of the player in world coordinates
   * @returns {THREE.Vector3}
   */
  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
    return this.#worldVelocity;
  }

  /**
   * Applies a change in velocity 'dv' that is specified in the world frame
   * @param {THREE.Vector3} dv 
   */
  applyWorldDeltaVelocity(dv) {
    dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(dv);
  }

  /**
   * Event handler for 'keyup' event
   * @param {KeyboardEvent} event 
   */
  onKeyDown(event) {
    if (!this.controls.isLocked) {
      this.debugCamera = false;
      this.controls.lock();
    }

    switch (event.code) {
      case 'Digit0':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
	  case 'Digit9':
        // Update the selected toolbar icon
        document.getElementById(`toolbar-${this.activeBlockId}`)?.classList.remove('selected');
        document.getElementById(`toolbar-${event.key}`)?.classList.add('selected');

        this.activeBlockId = Number(event.key);

        // Update the pickaxe visibility
        this.tool.container.visible = (this.activeBlockId === 0);

        break;
      case 'KeyW':
        this.input.z = this.maxSpeed;
        break;
      case 'KeyA':
        this.input.x = -this.maxSpeed;
        break;
      case 'KeyS':
        this.input.z = -this.maxSpeed;
        break;
      case 'KeyD':
        this.input.x = this.maxSpeed;
        break;
      case 'KeyR':
        if (this.repeat) break;
        this.position.y = 32;
        this.velocity.set(0, 0, 0);
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.sprinting = true;
        break;
      case 'Space':
        if (this.onGround) {
          this.velocity.y += this.jumpSpeed;
        }
        break;
      case 'F10':
        this.debugCamera = true;
        this.controls.unlock();
        break;
    }
  }

  /**
   * Event handler for 'keyup' event
   * @param {KeyboardEvent} event 
   */
  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        this.input.z = 0;
        break;
      case 'KeyA':
        this.input.x = 0;
        break;
      case 'KeyS':
        this.input.z = 0;
        break;
      case 'KeyD':
        this.input.x = 0;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.sprinting = false;
        break;
    }
  }
  
    /**
   * Event handler for 'mousedown'' event
   * @param {MouseEvent} event 
   */
  onMouseDown(event) {
    if (this.controls.isLocked) {
      // Is a block selected?
      if (this.selectedCoords) {
        // If active block is an empty block, then we are in delete mode
        if (this.activeBlockId === blocks.empty.id) {
          this.world.removeBlock(
            this.selectedCoords.x,
            this.selectedCoords.y,
            this.selectedCoords.z
          );
		  this.tool.startAnimation();
        } else {
          this.world.addBlock(
            this.selectedCoords.x,
            this.selectedCoords.y,
            this.selectedCoords.z,
            this.activeBlockId
          );
        }
      }
    }
  }


  /**
   * Returns player position in a readable string form
   * @returns {string}
   */
  toString() {
    let str = '';
    str += `X: ${this.position.x.toFixed(3)} `;
    str += `Y: ${this.position.y.toFixed(3)} `;
    str += `Z: ${this.position.z.toFixed(3)}`;
    return str;
  }
}