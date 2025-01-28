

import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';


// Camera
const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 60;

// Scene
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High pixel density support
renderer.outputEncoding = THREE.sRGBEncoding; // Ensure accurate colors
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic tones
renderer.toneMappingExposure = 1.5; // Adjust for brightness
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.getElementById('container3D').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5); // Point light for highlights
pointLight.position.set(-4, 12, 0); // Adjust position
pointLight.castShadow = true; // Enable shadows for point light
pointLight.shadow.mapSize.width = 2048; // High shadow resolution
pointLight.shadow.mapSize.height = 2048;
scene.add(pointLight);

// Environment Map
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js';

const rgbeLoader = new RGBELoader();
rgbeLoader.load('path/to/hdri.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // Proper reflection mapping
    scene.environment = texture; // Use as environment lighting
    scene.background = texture; // Optional: Use as scene background
});

// GLTF Loader
let avatar;
let mixer;

// Disable scrolling while loading
document.body.classList.add('no-scroll');

// Use LoadingManager to track progress
const loadingManager = new THREE.LoadingManager();

// Show the loading screen
loadingManager.onStart = () => {
    console.log('Loading started');
};

// Update loading progress (optional)
loadingManager.onProgress = (url, loaded, total) => {
    console.log(`Loaded ${loaded}/${total}: ${url}`);
};

// Hide loading screen when all assets are loaded
loadingManager.onLoad = () => {
    console.log('Loading complete');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none'; // Hide the loading screen
    document.body.classList.remove('no-scroll'); // Re-enable scrolling
};

// Attach LoadingManager to GLTFLoader
const loader = new GLTFLoader(loadingManager);
loader.load(
    './avatar2.glb',
    function (gltf) {
        console.log('GLTF Loaded:', gltf);
        avatar = gltf.scene;
        
        // Detect if the device is mobile
        const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed

        if (isMobile) {
            // Position for mobile devices (center bottom)
            avatar.position.x = 0; // Center horizontally
            avatar.position.y = -5; // Position closer to the bottom
            avatar.position.z = 0;
        } else {
            // Position for desktop (default)
            avatar.position.x = 2.5;
            avatar.position.y = -2;
            avatar.position.z = 0;
        }

        // Traverse the avatar's nodes
        avatar.traverse((node) => {
            if (node.isMesh) {
                console.log(`Processing mesh: ${node.name}`);

                // Handle morph targets safely
                if (node.morphTargetDictionary && node.morphTargetInfluences) {
                    try {
                        node.updateMorphTargets();
                        console.log(`Morph targets updated for: ${node.name}`);
                    } catch (error) {
                        console.warn(`Failed to update morph targets for: ${node.name}`, error);
                    }
                } else {
                    console.log(`No morph targets for: ${node.name}`);
                }

                // Enable shadows
                node.castShadow = true;
                node.receiveShadow = true;

                // Validate material encoding
                if (node.material && node.material.map) {
                    node.material.map.encoding = THREE.sRGBEncoding;
                }
            }
        });

        // Add the avatar to the scene
        scene.add(avatar);
        console.log('Avatar added to the scene');

        // Handle animations if present
        mixer = new THREE.AnimationMixer(avatar);
        if (gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
            console.log('Animations loaded and playing');
        } else {
            console.log('No animations found');
        }
    },
    function (xhr) {
        console.log(`Model loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    function (error) {
        console.error('An error occurred while loading the model:', error);
    }
);


// Render Loop
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02); // Update animations
};
reRender3D();
let arrPositionModel = [
    {
        id: 'hero',
        position: {x: 2.5, y: -2, z: 0},
        rotation: {x: 0, y: 0, z: 0},
        scale: {x:1, y: 1, z:1}
    },
    {
        id: "projects",
        position: { x: 5, y: -1, z: -5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: {x:0.7, y: 0.7, z:0.7}
        
    },
    {
        id: "skills",
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: {x:0.5, y: 0.5, z:0.5}
    },
    {
        id: "contact",
        position: { x: 0.8, y: -1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: {x:0.5, y: 0.5, z:0.5}
    },
];

const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
            currentSection = section.id;
        }
    });

    if (currentSection) {
        const positionActive = arrPositionModel.find((val) => val.id === currentSection);

        if (positionActive) {
            // Animate position
            gsap.to(avatar.position, {
                x: positionActive.position.x,
                y: positionActive.position.y,
                z: positionActive.position.z,
                duration: 3,
                ease: "power1.out",
            });

            // Animate rotation
            gsap.to(avatar.rotation, {
                x: positionActive.rotation.x,
                y: positionActive.rotation.y,
                z: positionActive.rotation.z,
                duration: 3,
                ease: "power1.out",
            });

            // Animate scale
            gsap.to(avatar.scale, {
                x: positionActive.scale.x,
                y: positionActive.scale.y,
                z: positionActive.scale.z,
                duration: 3,
                ease: "power1.out",
            });
        }
    }
};


window.addEventListener('scroll', () => {
    if (avatar) {
        modelMove();
    }
})
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})