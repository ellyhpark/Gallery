import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

class ThreeBasic {
    constructor() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 30;
        this.camera.position.z = 20;
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setAnimationLoop((time) => this.animate(time));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.resize());
    }

    animate(time) {
        // calls update() if it is defined in obj
        this.scene.traverse((obj) => obj.update?.(time));

        this.renderer.render(this.scene, this.camera);
        this.controls?.update(); // calls update() or returns undefined
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 30, 0);
    }

    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
    }
    
    createLights() {
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(0, 100, 100);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -150;
        dirLight.shadow.camera.right = 150;
        dirLight.shadow.camera.top = 150;
        dirLight.shadow.camera.bottom = -150;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1000;
        this.scene.add(dirLight);

        // this.scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
        hemiLight.position.set(0, 1, 0);
        this.scene.add(hemiLight);
    }

    set background(color) {
        this.scene.background = color;
    }

    get background() {
        return this.scene.background;
    }

    setLinearFog(color, near, far) {
        this.scene.fog = new THREE.Fog(color, near, far);
    }

    createGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshPhongMaterial({color: 0x000000})
        );
        // relative to parent = this.scene
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
}

export { ThreeBasic };