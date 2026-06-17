import * as THREE from 'three'; 

//make scene, camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //fov, aspect ratio, near, far clipping
// create a pivot object to hold the camera
const cameraHolder = new THREE.Object3D();
scene.add(cameraHolder);
cameraHolder.add(camera);

//renderer 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

//bg color
scene.background = new THREE.Color(0,0,0);

//texture loader
const textureLoader = new THREE.TextureLoader();
const waterTexture = textureLoader.load('textures/water.png');
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set(50, 50);
waterTexture.magFilter = THREE.NearestFilter;

//make a cube? 
const cubeGeometry = new THREE.BoxGeometry( 3, 3, 3, 9, 9, 9);
const cubeMaterial = new THREE.MeshStandardMaterial({color: 0xf190fe, flatShading: true }); 
cubeMaterial.metalness = 0.75;
cubeMaterial.roughness = 0;
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);


//floor?
const floorGeometry = new THREE.PlaneGeometry( 100, 100, 100, 100);
const floorMaterial = new THREE.MeshPhongMaterial( { map: waterTexture, side: THREE.DoubleSide } );
const floor = new THREE.Mesh(floorGeometry, floorMaterial );
floor.rotation.x = Math.PI / 2;
scene.add(floor);

//lighting 
const color = 0xFFFFFF;
const intensity = 500;
const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
scene.add(light);


//default add position is 0,0,0
camera.position.z = 5; 
camera.position.y = 5; 
cube.position.y = 1.5;

//track which keys are being pressed 
const keys = {}
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup',   (e) => keys[e.code] = false);

//shadows
renderer.shadowMap.enabled = true;
floor.receiveShadow = true;

//key updates
const SPEED = 15; //change per second
const GRAVITY = 40; 
const JUMP = 15;
const GROUND_Y = 0.5;
let Y_VELOCITY = 0; 
let onGround = true; 

function key_update(delta){
// get the direction the camera is facing
  const direction = new THREE.Vector3();
  cameraHolder.getWorldDirection(direction);
  direction.y = 0; // keep movement horizontal
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, new THREE.Vector3(0, 1, 0));

  //wasd direction movement 
  if (keys['KeyW']&&keys['ShiftLeft']) cameraHolder.position.addScaledVector(direction, -SPEED * delta);
  if (keys['KeyW']) cameraHolder.position.addScaledVector(direction, -SPEED * delta);
  if (keys['KeyS']) cameraHolder.position.addScaledVector(direction, SPEED * delta);
  if (keys['KeyA']) cameraHolder.position.addScaledVector(right, SPEED * delta);
  if (keys['KeyD']) cameraHolder.position.addScaledVector(right, -SPEED * delta);

  if (keys['KeyF']) water_update();
  //start jump
  if (keys['Space']&&onGround){
        Y_VELOCITY = JUMP;
        onGround = false;
    }

   
  }

//jump logic
function gravity_update(delta){
    if(!onGround){
        //update height of jump 
        Y_VELOCITY -= GRAVITY*delta;
        cameraHolder.position.y += Y_VELOCITY*delta;
        //check for landing
        if(cameraHolder.position.y <= GROUND_Y){
            cameraHolder.position.y = GROUND_Y; 
            Y_VELOCITY = 0; 
            onGround = true;
        }
    }
}


// lock pointer when clicking the canvas
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

// listen for lock/unlock changes
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === renderer.domElement) { //check if locked element is game canvas
    console.log('pointer locked');
    //run game
  } else {
    console.log('pointer unlocked');
    //pause game
  }
});

//camera panning attached to mouse 
// track yaw (left/right) and pitch (up/down) separately
let yaw = 0;
let pitch = 0;
const MOUSE_SENSITIVITY = 0.002;

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;

  yaw   -= e.movementX * MOUSE_SENSITIVITY; // left/right
  pitch -= e.movementY * MOUSE_SENSITIVITY; // up/down

  // clamp pitch so camera can't flip upside down
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

  // apply yaw to the holder (world Y axis)
  cameraHolder.rotation.y = yaw;

  // apply pitch to the camera itself (local X axis)
  camera.rotation.x = pitch;
});


//ocean waves 
const WAVEFREQ = 0.15; //seconds per update
let waveOffset = 0;
let waveTick = WAVEFREQ;
function water_update(delta){
  waveTick -= delta;
    if(waveTick <= 0){
        waveTick = WAVEFREQ;
        waveOffset += 0.5;
    
   // let noise = (Math.random()*9)+ 1;
    //noise = Math.floor(noise);
    const position = floor.geometry.attributes.position; 

    for (let i = 0; i < position.count; i++) {
      let waveHeight= Math.random();
      position.setZ(i, waveHeight * Math.sin(position.getX(i)+ waveOffset));
    }

    position.needsUpdate = true;
    floor.geometry.computeVertexNormals();
    }
}

//animate + render
let lastTime = 0;
function animate(time){
    //get seconds since last update
    const delta = (time - lastTime)/1000;
    lastTime = time; 

    //update keys
    key_update(delta);

    //update physics
    gravity_update(delta);
    water_update(delta);

    //render
    renderer.render(scene, camera);
}
 renderer.setAnimationLoop(animate); 