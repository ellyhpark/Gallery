import * as THREE from 'three';
import { ThreeBasic } from './ThreeBasic';
import { Reflector } from 'three/examples/jsm/Addons.js';

// html & css:
setElements();

// base step:
const threeBasic = new ThreeBasic();
threeBasic.createRaycaster();
window.addEventListener('pointerdown', onPointerDown);
const ARTWORK_CENTER = new THREE.Vector3(0, 30, -90);

// lighting:
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.15);
hemiLight.position.set(0, 1, 0);
threeBasic.scene.add(hemiLight);

const spotLight = new THREE.SpotLight(0xffffff, 30000, 150, 0.45, 1);
spotLight.position.set(0, 50, 10);
spotLight.target.position.copy(ARTWORK_CENTER);
threeBasic.scene.add(spotLight);
threeBasic.scene.add(spotLight.target);

// background:
const background = 0x000000;
threeBasic.background = new THREE.Color(background);
threeBasic.setLinearFog(background, 200, 1000);
const mirrors = createMirrors();
threeBasic.scene.add(mirrors.bottom);
threeBasic.scene.add(mirrors.top);

// audio:
// referenced three.js example
// https://threejs.org/docs/?q=audio#api/en/audio/Audio
const listener = new THREE.AudioListener();
threeBasic.camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/happy-relaxing-loop-275487.mp3', function(buffer) {
	sound.setBuffer(buffer); // set loaded object as buffer
	sound.setLoop(true); // play in loop
	sound.setVolume(0.5); // set volume from 0.0 to 1.0

    // wait for user interaction before playing/pausing
    const playMusicElem = document.querySelector('.playMusic');
    playMusicElem.addEventListener('click', () => {
        if (!sound.isPlaying) {
            sound.play();
            playMusicElem.innerHTML = 'Pause Music';
        } else {
            sound.pause();
            playMusicElem.innerHTML = 'Play Music';
        }
    });
});

// gallery:
const floors = [
    ['images/artwork-1.png',
    'images/artwork-2.png',
    'images/artwork-3.png',
    'images/artwork-4.jpg',
    'images/artwork-5.jpg',
    'images/artwork-6.jpg'],

    ['images/1933.1157 - Water Lilies.jpg',
    'images/1914.57 - The Fountain, Villa Torlonia, Frascati, Italy.jpg',
    'images/1977.157 - Autumn Maples with Poem Slips.jpg',
    'images/2000.50 - The Girl by the Window.jpg',
    'images/1911.32 - Early Morning, Tarpon Springs.jpg',
    "images/2011.284 - I'timad-ud-Daula's Tomb at Agra.jpg"]
];
const artworkInfo = [
    [{title: 'Before They Become Stars', description: 'This is the description for Before They Become Stars. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!'},
    {title: 'Girl and Plant', description: 'This is the description for Girl and Plant. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!'},
    {title: 'Bunny-Dog-Deer', description: 'This is the description for Bunny-Dog-Deer. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!'},
    {title: "You Aren't Alone", description: "This is the description for You Aren't Alone. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!"},
    {title: 'Fading Mind', description: 'This is the description for Fading Mind. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!'},
    {title: 'Choice', description: 'This is the description for Choice. Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, cupiditate. Iste, ullam ipsam aut vel odit tenetur dolorum eligendi dolor repudiandae sequi ipsa quos libero necessitatibus maiores, quo saepe sed!'}],

    [{title: 'Water Lilies', description: 'by Claude Monet | 1906'},
    {title: 'The Fountain, Villa Torlonia, Frascati, Italy', description: 'by John Singer Sargent | 1907'},
    {title: 'Autumn Maples with Poem Slips', description: 'by Tosa Mitsuoki | 1670-1680'},
    {title: 'The Girl by the Window', description: 'by Edvard Munch | 1893'},
    {title: 'Early Morning, Tarpon Springs', description: 'by George Inness | 1892'},
    {title: "I'timad-ud-Daula's Tomb at Agra", description: 'Artist Unknown | Agra, India | 1815-1825'}],
];
const loader = new THREE.TextureLoader();

// by default
let type = 'Mesh';
let motionNum = 0;
let floorNum = 0;

let wheel = createWheel();
threeBasic.scene.add(wheel);
setTypeChange();
setMotionChange();
setFloorChange();

// -----------------------------------------------------------------------------

function create2DMenu() {
    const menuElem = document.createElement('div');
    menuElem.className = 'menu';
    menuElem.innerHTML = `
        <button class="playMusic menuOptionsStyle bubbleStyle">Play Music</button><br/>
        <select class="selectType menuOptionsStyle bubbleStyle">
            <option value="mesh" selected>Mesh</option>
            <option value="points">Points</option>
        </select><br/>
        <select class="selectMotion menuOptionsStyle bubbleStyle">
            <option value="none" selected>No Motion</option>
            <option value="flag">Flag Motion</option>
            <option value="ripple">Ripple Motion</option>
        </select><br/>
        <select class="selectFloor menuOptionsStyle bubbleStyle">
            <option value="floor1" selected>Floor 1</option>
            <option value="floor2">Floor 2</option>
        </select>
    `;
    menuElem.style.cssText = `
        position: absolute;
        z-index: 1;
        bottom: 5vh;
        left: 5vw;

        background-color: rgb(30 30 30 / 75%);
        border: 1px solid rgb(70, 70, 70);
        padding: 10px;
        border-radius: 20px;
    `;
    document.body.appendChild(menuElem);
}

function createExpandedElem() {
    const expandedElem = document.createElement('div');
    expandedElem.classList.add('expanded');
    expandedElem.classList.add('bubbleStyle');
    expandedElem.innerHTML = `
        <h1 id="title">Title</h1>
        <p id="description">Description goes here...</p>
    `;
    expandedElem.style.cssText = `
        position: absolute;
        z-index: 10;

        top: 5vh;
        left: 20vw;
        right: 20vw;

        padding: 20px;
        border-radius: 30px;

        opacity: 0;
        transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(expandedElem);
}

function setElements() {
    const styleElem = document.createElement('style');
    styleElem.textContent = `
        * {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        
        canvas {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
        }
        
        .menuOptionsStyle {
            width: 120px;
            padding: 10px;
            border-radius: 20px;
            margin-bottom: 20px;
        }

        .bubbleStyle {
            background-color: rgb(0 0 0 / 75%);
            border: 1px solid rgb(70, 70, 70);
            color: white;
            font-family: "Roboto", sans-serif;
        }
    `;
    document.head.appendChild(styleElem);

    create2DMenu();
    createExpandedElem();
}

// -----------------------------------------------------------------------------
// referenced SBCODE
// https://sbcode.net/threejs/reflector/
function createMirrors() {
    const mirrors = {};
    for (let i = 0; i < 2; i++) {
        const mirror = new Reflector(
            new THREE.CircleGeometry(100, 32),
            {
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
            }
        );
        mirror.rotation.x = Math.PI / 2;
        if (i === 0) {
            mirror.rotation.x *= -1;
            mirrors.bottom = mirror;
        }
        else {
            mirror.position.y = ARTWORK_CENTER.y * 2;
            mirrors.top = mirror;
        }
    }
    return mirrors;
}

// -----------------------------------------------------------------------------

function createTexPromises(floorNum) {
    const texPromises = [];
    floors[floorNum].forEach((a) => {
        const promise = loader.loadAsync(a);
        texPromises.push(promise);
    });
    return texPromises;
}

function createArtwork(type, tex, center, w, h) {
    const geometry = new THREE.PlaneGeometry(w, h, w - 1, h - 1);
    let material;
    if (type === 'Mesh') {
        material = new THREE.MeshPhongMaterial({
            map: tex
        });
    }
    else if (type === 'Points') {
        material = new THREE.PointsMaterial({
            map: tex,
            size: 1
        });
    }

    const uniforms = {
        time: {value: 0.0},
        motionID: {value: motionNum},
        width: {value: w},
        height: {value: h},
        spotLightPosition: {value: new THREE.Vector3()},
        spotLightColor: {value: new THREE.Color()},
        spotLightIntensity: {value: 0.0},
        spotLightDirection: {value: new THREE.Vector3()},
        spotLightAngle: {value: 0.0},
        spotLightDistance: {value: 0.0}
    };

    material.onBeforeCompile = function(shader) {
        // faster
        Object.keys(uniforms).forEach((key) => {
            shader.uniforms[key] = uniforms[key];
        });
        // slower
        // for (const key in uniforms) {
        //     shader.uniforms[key] = uniforms[key];
        // }

        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `
            uniform float time;
            uniform float motionID;
            uniform float width;
            uniform float height;

            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;

            void main() {
            `
        );
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            vec3 transformed = position;

            // flag
            if (motionID == 1.0) {
                float x = position.x;
                float y = position.y;
                float _w = PI * 2.0 / width;
                float _h = PI * 2.0 / height;
                transformed.z = 2.0 * sin((x * _w) + 5.0 * time);
                transformed.z += 1.0 * sin((y * _h) + 10.0 * time);
            }
            
            // ripple
            else if (motionID == 2.0) {
                float x = position.x;
                float y = position.y;
                float d = sqrt(x * x + y * y);

                // ripple's height (= amplitude) exponentially decreases with greater distance
                float A = 4.0 * exp(-d * 0.001);
                
                // sin(d - w * t): wave moves outward
                // sin(d + w * t): wave moves inward
                transformed.z = A * sin(d - 5.0 * time);
            }

            // for light calculation
            vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
            vWorldNormal = normalMatrix * normal;
            `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `
            uniform float time;
            uniform vec3 spotLightPosition;
            uniform vec3 spotLightColor;
            uniform float spotLightIntensity;
            uniform vec3 spotLightDirection;
            uniform float spotLightAngle;
            uniform float spotLightDistance;

            varying vec3 vWorldNormal;
            varying vec3 vWorldPosition;

            void main() {
            `
        );
        // referenced OGLDEV
        // https://www.youtube.com/watch?v=MAJqiDll0a8
        shader.fragmentShader = shader.fragmentShader.replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            `
            // diffuse color alterations
            float r = sin(time + gl_FragCoord.x) * 0.5 + 0.5;
            float g = sin(time + gl_FragCoord.y) * 0.5 + 0.5;
            float b = sin(time + gl_FragCoord.z) * 0.5 + 0.5;
            vec3 rgb = vec3(r, g, b);
            rgb = mix(diffuse, rgb, 0.5);
            vec4 diffuseColor = vec4(rgb, opacity);
            
            // light calculation
            float angleAttenuation = 0.0;

            vec3 P = normalize(spotLightPosition - vWorldPosition); // fragment to spot light
            vec3 L = normalize(-spotLightDirection); // target to spot light
            float cosAlpha = dot(P, L);
            float cosCutOff = cos(spotLightAngle);
            if (cosAlpha > cosCutOff) {
                angleAttenuation = smoothstep(cosCutOff, 1.0, cosAlpha);
            }

            float lightDistance = distance(spotLightPosition, vWorldPosition); // between fragment and spot light
            float distanceAttenuation = 1.0 - smoothstep(0.0, spotLightDistance, lightDistance);
            
            float spotLightDiffuse = max(dot(vWorldNormal, P), 0.0) * angleAttenuation * distanceAttenuation;

            // 3.0 to strengthen spot light color and 0.01 for ambient light effect
            vec3 lightColor = (spotLightColor * 3.0) * spotLightDiffuse + 0.01;
            diffuseColor.rgb = clamp(diffuseColor.rgb * lightColor, 0.0, 1.0);
            `
        );
    }
    
    let obj;
    if (type === 'Mesh') {
        obj = new THREE.Mesh(
            geometry,
            material
        );
    }
    else if (type === 'Points') {
        obj = new THREE.Points(
            geometry,
            material
        );
    }
    obj.position.set(center.x, center.y, center.z);

    obj.update = function(time) {
        uniforms.time.value = time * 0.001;
        uniforms.motionID.value = motionNum;
        uniforms.spotLightPosition.value.copy(spotLight.position);
        uniforms.spotLightColor.value.copy(spotLight.color);
        uniforms.spotLightIntensity.value = spotLight.intensity;
        uniforms.spotLightDirection.value.copy(spotLight.target.position).sub(spotLight.position); // spot light to target
        uniforms.spotLightAngle.value = spotLight.angle; // cut-off angle
        uniforms.spotLightDistance.value = spotLight.distance;
    }

    return obj;
}

function createArrows(w) {
    const arrows = {};
    for (let i = 0; i < 2; i++) {
        const arrowPath = i === 0 ? 'images/left-arrow.png' : 'images/right-arrow.png';
        const arrow = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshPhongMaterial({
                map: loader.load(arrowPath, (tex) => tex.colorSpace = THREE.SRGBColorSpace),
                transparent: true,
                opacity: 0
            })
        );
        if (i === 0) {
            arrow.position.x = -w / 2 - 10;
            arrow.name = 'left-arrow';
            arrows.left = arrow;
        }
        else {
            arrow.position.x = w / 2 + 10;
            arrow.name = 'right-arrow';
            arrows.right = arrow;
        }
    }
    return arrows;
}

function createMoreInfo(w, h) {
    const moreInfo = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshPhongMaterial({
            map: loader.load('images/expand.png', (tex) => tex.colorSpace = THREE.SRGBColorSpace),
            transparent: true,
            opacity: 0
        })
    );
    moreInfo.position.y = -h / 2 + 5;
    moreInfo.position.x = w / 2 + 10;
    moreInfo.name = 'more-info';

    // moreInfo.material = moreInfo mesh's current material (MeshPhongMaterial)
    moreInfo.expandTex = moreInfo.material.map;
    moreInfo.closeTex = loader.load('images/close.png', (tex) => tex.colorSpace = THREE.SRGBColorSpace);
    return moreInfo;
}

function createBorder(artwork, tex, w, h) {
    const border = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.1, h * 1.1, 5),
        new THREE.MeshPhongMaterial({
            color: 0xdddddd,
            map: tex
        })
    );
    border.position.copy(artwork.position);
    border.position.z -= 7;
    return border;
}

function createWheel() {
    const wheel = new THREE.Object3D();

    // if all promises of texPromises resolve
    Promise.all( createTexPromises(floorNum) ).then((resolvedTexPromises) => {
        let firstArtwork;
        let currArtwork;

        let rotation = 0;

        resolvedTexPromises.forEach((tex, i) => {
            // find the width and height for each artwork mesh/points
            const texRatio = tex.width / tex.height;
            let w;
            let h;
            // set larger to 50 and adjust the other proportionately
            if (tex.width > tex.height) {
                w = 50;
                h = 50 / texRatio;
            }
            else {
                w = 50 * texRatio;
                h = 50;
            }

            tex.colorSpace = THREE.SRGBColorSpace;

            // create linked list structure of artwork meshes/points
            const prevArtwork = currArtwork;
            currArtwork = createArtwork(type, tex, ARTWORK_CENTER, w, h);
            if (prevArtwork) {
                prevArtwork.right = currArtwork;
            } else {
                firstArtwork = currArtwork;
            }
            currArtwork.left = prevArtwork;
            
            currArtwork.name = i;
            
            const arrows = createArrows(w);
            currArtwork.add(arrows.left);
            currArtwork.add(arrows.right);
            const moreInfo = createMoreInfo(w, h);
            currArtwork.add(moreInfo);

            // by default, the first artwork mesh/points options are turned on
            if (i === 0) {
                arrows.left.material.opacity = 1;
                arrows.right.material.opacity = 1;
                moreInfo.material.opacity = 1;
            }
            
            const arm = new THREE.Object3D();
            arm.add(currArtwork);
            arm.add(createBorder(currArtwork, tex, w, h));
            arm.rotation.y = rotation;
            wheel.add(arm);
            
            // for next iteration
            // update rotation in clockwise direction
            rotation -= 2 * Math.PI / floors[floorNum].length;
        });

        // connect first and last artwork meshes/points in the linked list structure
        firstArtwork.left = currArtwork;
        currArtwork.right = firstArtwork;
    });

    return wheel;
}

// -----------------------------------------------------------------------------

function updateWheel(startTime, duration, startRotation, endRotation) {
    // define wheel.update after user clicks arrow
    // wheel.update will be then called inside the animate method
    // this is so that the wheel rotates only in the case of clicking an arrow
    // time in milliseconds
    wheel.update = function(time) {
        if (startTime < 0) startTime = time;
        const progress = (time - startTime) / duration;

        // animation in progress
        if (progress < 1) {
            // linear interpolation
            wheel.rotation.y = startRotation + progress * (endRotation - startRotation);
        }
        // animation complete
        else {
            wheel.rotation.y = endRotation;
            delete wheel.update; // remove property
        }
    }
}

function turnOnOptions(options) {
    options[0].material.opacity = 1; // left arrow
    options[1].material.opacity = 1; // right arrow
    options[2].material.opacity = 1; // more info
}

function turnOffOptions(options) {
    options[0].material.opacity = 0; // left arrow
    options[1].material.opacity = 0; // right arrow
    options[2].material.opacity = 0; // more info
}

function expandMoreInfo(moreInfo) {
    moreInfo.material.map = moreInfo.closeTex;

    const info = artworkInfo[floorNum][+moreInfo.parent.name];
    const titleElem = document.getElementById('title');
    titleElem.innerHTML = info.title;
    const descriptionElem = document.getElementById('description');
    descriptionElem.innerHTML = info.description;

    const expandedElem = document.querySelector('.expanded');
    expandedElem.style.opacity = '1';
}

function closeMoreInfo(moreInfo) {
    if (moreInfo) moreInfo.material.map = moreInfo.expandTex;

    const expandedElem = document.querySelector('.expanded');
    expandedElem.style.opacity = '0';
}

// referenced three.js example
// https://threejs.org/docs/?q=raycaster#api/en/core/Raycaster
function checkIntersection() {
    // we have set pointer (location where mouse clicks, in the NDC space)

    // ray origin = threeBasic.camera
    // ray direction = threeBasic.pointer
    threeBasic.raycaster.setFromCamera(threeBasic.pointer, threeBasic.camera);

    // intersects = [intersection1, intersection2, ...]
    // intersection1 = {distance, point, face, faceIndex, object}
    const intersects = threeBasic.raycaster.intersectObjects(threeBasic.scene.children);

    if (intersects.length > 0) {
        const selected = intersects[0].object;

        if (selected.name === 'left-arrow') {
            let startTime = -1;
            const duration = 1000; // 1000 milliseconds = 1 second
            const startRotation = wheel.rotation.y;
            const endRotation = wheel.rotation.y - 2 * Math.PI / wheel.children.length;
            updateWheel(startTime, duration, startRotation, endRotation);

            // turn on left artwork's options
            const leftArtworkOptions = selected.parent.left.children;
            turnOnOptions(leftArtworkOptions);

            // turn off current artwork's options
            const artworkOptions = selected.parent.children;
            turnOffOptions(artworkOptions);

            // close out from more info
            const moreInfo = artworkOptions[2];
            if (moreInfo.material.map === moreInfo.closeTex) {
                closeMoreInfo(moreInfo);
            }
        }
        else if (selected.name === 'right-arrow') {
            let startTime = -1;
            const duration = 1000;
            const startRotation = wheel.rotation.y;
            const endRotation = wheel.rotation.y + 2 * Math.PI / wheel.children.length;
            updateWheel(startTime, duration, startRotation, endRotation);

            // turn on right artwork's options
            const rightArtworkOptions = selected.parent.right.children;
            turnOnOptions(rightArtworkOptions);

            // turn off current artwork's options
            const artworkOptions = selected.parent.children;
            turnOffOptions(artworkOptions);

            // close out from more info
            const moreInfo = artworkOptions[2];
            if (moreInfo.material.map === moreInfo.closeTex) {
                closeMoreInfo(moreInfo);
            }
        }
        else if (selected.name === 'more-info') {
            // selected.material.map = current material's texture

            // user wants to see more info about the artwork
            // ? -> X
            if (selected.material.map === selected.expandTex) {
                expandMoreInfo(selected);
            }
            // user wants to close out
            // X -> ?
            else if (selected.material.map === selected.closeTex) {
                closeMoreInfo(selected);
            }
        }
    }
}

// referenced three.js example
// https://threejs.org/docs/?q=raycaster#api/en/core/Raycaster
function onPointerDown(event) {
    // event.clientX and window.innerWidth are in the same coordinate space
    // set pointer's position to be in the range [-1, 1] (NDC)
    threeBasic.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    threeBasic.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    checkIntersection();
}

// -----------------------------------------------------------------------------

function setTypeChange() {
    const selectTypeElem = document.querySelector('.selectType');
    selectTypeElem.addEventListener('change', (e) => {
        closeMoreInfo(null);

        if (e.target.value == 'mesh') type = 'Mesh';
        else if (e.target.value == 'points') type = 'Points';

        threeBasic.scene.remove(wheel);
        wheel = createWheel();
        threeBasic.scene.add(wheel);
    });
}

function setMotionChange() {
    const selectMotionElem = document.querySelector('.selectMotion');
    selectMotionElem.addEventListener('change', (e) => {
        if (e.target.value == 'none') motionNum = 0;
        else if (e.target.value == 'flag') motionNum = 1;
        else if (e.target.value == 'ripple') motionNum = 2;
    });
}

function setFloorChange() {
    const selectFloorElem = document.querySelector('.selectFloor');
    selectFloorElem.addEventListener('change', (e) => {
        closeMoreInfo(null);

        if (e.target.value == 'floor1') floorNum = 0;
        else if (e.target.value == 'floor2') floorNum = 1;

        threeBasic.scene.remove(wheel);
        wheel = createWheel();
        threeBasic.scene.add(wheel);
    });
}