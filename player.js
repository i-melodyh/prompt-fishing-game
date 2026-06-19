import * as THREE from 'three'; 

export class player{
    constructor(scene, camera, input){
        this.input = input;
        this.scene = scene; 
        this.camera = camera;
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.position.y = 3;
        this.cameraHolder.add(this.camera);
        this.scene.add(this.cameraHolder);

        //settings
        this.SPEED = 15; //change per second
        this.GRAVITY = 40; 
        this.JUMP = 15;
        this.GROUND_Y = 3;
        this.MOUSE_SENSITIVITY = 0.002;

        //player states
        this.y_velocity = 0; 
        this.onGround = true; 
        this.direction = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;
    }

    update(delta){
        // get the direction the camera is facing
        this.cameraHolder.getWorldDirection(this.direction);
        this.direction.y = 0; // keep movement horizontal
        this.direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(this.direction, new THREE.Vector3(0, 1, 0));

         //wasd direction movement 
        if (this.input.checkKey('ShiftLeft') && this.input.checkKey('KeyW')) this.cameraHolder.position.addScaledVector(this.direction, -this.SPEED * delta);
        if (this.input.checkKey('KeyW')) this.cameraHolder.position.addScaledVector(this.direction, -this.SPEED * delta);
        if (this.input.checkKey('KeyS')) this.cameraHolder.position.addScaledVector(this.direction, this.SPEED * delta);
        if (this.input.checkKey('KeyA')) this.cameraHolder.position.addScaledVector(right, this.SPEED * delta);
        if (this.input.checkKey('KeyD')) this.cameraHolder.position.addScaledVector(right, -this.SPEED * delta);

        //start jump
        if (this.input.checkKey('Space')&&this.onGround){
        this.y_velocity = this.JUMP;
        this.onGround = false;
        }

        //update jump
        if(!this.onGround){
        //update height of jump 
        this.y_velocity -= this.GRAVITY*delta;
        this.cameraHolder.position.y += this.y_velocity*delta;
        //check for landing
        if(this.cameraHolder.position.y <= this.GROUND_Y){
            this.cameraHolder.position.y = this.GROUND_Y; 
            this.y_velocity = 0; 
            this.onGround = true;
        }
        }

        const mouseMovement = this.input.checkMouseMovement();
        this.yaw   -= mouseMovement.dx * this.MOUSE_SENSITIVITY; // left/right
        this.pitch -= mouseMovement.dy * this.MOUSE_SENSITIVITY; // up/down

        // clamp pitch so camera can't flip upside down
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        // apply yaw to the holder (world Y axis)
        this.cameraHolder.rotation.y = this.yaw;

        // apply pitch to the camera itself (local X axis)
        this.camera.rotation.x = this.pitch;
    }
}


