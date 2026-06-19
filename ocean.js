import * as THREE from 'three'; 

export class ocean{
    constructor(scene, oceanTexture) {
        this.scene = scene;
        this.oceanTexture = oceanTexture;
        const geometry = new THREE.PlaneGeometry( 100, 100, 100, 100);
        const material = new THREE.MeshPhongMaterial( { map: oceanTexture, side: THREE.DoubleSide } );
        this.geometry = geometry;
        this.material = material;
        this.floor = new THREE.Mesh(this.geometry, this.material );

        //settings
        this.WAVEFREQ = 0.15;

        //states
        this.waveTick = this.WAVEFREQ; 
        this.waveOffset = 0;
    }

    init(){
        this.oceanTexture.wrapS = THREE.RepeatWrapping;
        this.oceanTexture.wrapT = THREE.RepeatWrapping;
        this.oceanTexture.repeat.set(50, 50);
        this.oceanTexture.magFilter = THREE.NearestFilter;
        this.floor.rotation.x = Math.PI / 2;
        this.floor.receiveShadow = true; 
        this.scene.add(this.floor);
    }

    update(delta){

        this.waveTick -= delta;
        if(this.waveTick <= 0){
            this.waveTick = this.WAVEFREQ;
            this.waveOffset += 0.5;
            const position = this.floor.geometry.attributes.position; 

            for (let i = 0; i < position.count; i++) {
            let waveHeight= Math.random();
            position.setZ(i, waveHeight * Math.sin(position.getX(i)+ this.waveOffset));
            }
            position.needsUpdate = true;
            this.floor.geometry.computeVertexNormals();
        }
    }

    }


