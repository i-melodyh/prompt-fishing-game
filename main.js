import * as THREE from 'three'; 
import {inputs} from './inputs.js'; 
import {player} from './player.js';
import {ocean} from './ocean.js'; 

export class game {
  constructor(container){
    //mount point 
    this.container = container;

    this.paused = false;

    //scene
    this.scene = new THREE.Scene();
    
    //renderer 
    this.renderer = new THREE.WebGLRenderer(); 
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement); 

    //camera 
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //fov, aspect ratio, near, far clipping

    //for animate function
    this.lastTime = 0;
  }

  async init(){
    await this.loadAssets();
    this.makeScene();
    
  }

  async loadAssets(){
    //texture loading
    const textureLoader = new THREE.TextureLoader();
    this.textures = {
      ocean: await textureLoader.loadAsync('textures/water.png')
    };
  }

  makeScene(){
      //bg color
    this.scene.background = new THREE.Color('skyblue');

    this.input = new inputs(this.renderer);
    this.player = new player(this.scene, this.camera, this.input);
    

    //shadows
    this.renderer.shadowMap.enabled = true;
   
    //lighting 
    const color = 0xFFFFFF;
    const intensity = 500;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 10, 0);
    this.scene.add(light);

    //make a cube? 
    const cubeGeometry = new THREE.BoxGeometry( 3, 3, 3, 9, 9, 9);
    const cubeMaterial = new THREE.MeshStandardMaterial({color: 0xf190fe, flatShading: true }); 
    cubeMaterial.metalness = 0.75;
    cubeMaterial.roughness = 0;
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    //default add position is 0,0,0
    cube.position.y = 1.5;
    this.scene.add(cube);

    //make an ocean
    this.ocean = new ocean(this.scene, this.textures.ocean);
    this.ocean.init();

    this.renderer.domElement.addEventListener('click', () => this.renderer.domElement.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {
    this.paused = document.pointerLockElement !== this.renderer.domElement;
});
  }


  //animate + render
  animate(time){
    if (this.paused) return;
    //get seconds since last update
    const delta = (time - this.lastTime)/1000;
    this.lastTime = time; 

    //update physics
    this.ocean.update(delta);

    //render
    this.player.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  //game start
  async start(){
    await this.init(); 
    this.renderer.setAnimationLoop((time) => this.animate(time)); 
  }
}
