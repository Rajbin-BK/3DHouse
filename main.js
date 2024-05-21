
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);


// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Default shadow mapping type


// Create the water geometry (e.g., a large, flat plane)
const waterGeometry = new THREE.BufferGeometry(10, 10);

// Configure the water's properties
const water = new Water(waterGeometry, {
    textureWidth: 5,
    textureHeight: 5,
    waterNormals: new THREE.TextureLoader().load('/Picture/water.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
});

water.rotation.x = -Math.PI / 2; // Rotate the water to lie flat
scene.add(water);

//making the sphere that will act like the 1st person view
// Create a sphere
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(80,10,-40);
sphere.rotation.y = Math.PI / 2;
scene.add(sphere);

const torchLight = new THREE.SpotLight(0xff0000, 20); // White light, full intensity
torchLight.position.set(sphere.position.x, sphere.position.y, sphere.position.z); // Start at sphere's position
torchLight.target = sphere;
torchLight.angle = Math.PI / 2; // Narrow beam for torch effect
torchLight.distance = 5000; // Max distance light travels
torchLight.castShadow = true;

// Configure shadow properties for realism
torchLight.shadow.mapSize.width = 512; // Shadow resolution
torchLight.shadow.mapSize.height = 512;
torchLight.shadow.camera.near = 0.5;
torchLight.shadow.camera.far = 1500;

scene.add(torchLight);

// Object to keep track of which keys are pressed
const keysPressed = {};
// Event listeners for keyboard
document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

const moveSpeed = 1; // Adjust this value to make the movement faster or slower
function updatePosition() {
    const forward = new THREE.Vector3(0, 0, -1); // Local forward vector
    const sideways = new THREE.Vector3(1, 0, 0); // Local right vector

    forward.applyQuaternion(sphere.quaternion); // Apply sphere's rotation to get global forward direction
    sideways.applyQuaternion(sphere.quaternion); // Apply sphere's rotation to get global right direction

    if (keysPressed['ArrowUp']) {
        // Move forward
        sphere.position.addScaledVector(forward, moveSpeed);
    }
    if (keysPressed['ArrowDown']) {
        // Move backward
        sphere.position.addScaledVector(forward, -moveSpeed);
    }
    if (keysPressed['ArrowLeft']) {
        // Move left (strafe)
        sphere.position.addScaledVector(sideways, -moveSpeed);
    }
    if (keysPressed['ArrowRight']) {
        // Move right (strafe)
        sphere.position.addScaledVector(sideways, moveSpeed);
    }

    // Since the sphere has moved, update the camera's position to follow the sphere
    updateCameraPosition();
}


// Skydome creation
// Assuming you have these textures loaded
const dayTexture = new THREE.TextureLoader().load('/Picture/sky1.jpg');
const sunsetTexture = new THREE.TextureLoader().load('/Picture/sunset.jpg');
const nightTexture = new THREE.TextureLoader().load('/Picture/night1.png');

// Skydome creation function
function createSkydome() {
    const geometry = new THREE.SphereGeometry(500, 32, 32); 
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide}); 
    const skydome = new THREE.Mesh(geometry, material);
	//skydome.rotation.y = Math.PI / 2;
    skydome.material.map = dayTexture; // Start with day texture
    scene.add(skydome);
    return skydome;
}

const skydome = createSkydome();

// Transition logic
let currentPhase = 0; // 0: day, 1: sunset, 2: night

// Adjust this function to handle keyboard events for 'Z', 'X', and 'C'
document.addEventListener('keydown', (event) => {
    // Check for specific keys to change the skydome phase
    if (event.key === 'z' || event.key === 'Z') {
        currentPhase = 0; // Day
        updateSkydome(); // Update the skydome appearance immediately
    } else if (event.key === 'x' || event.key === 'X') {
        currentPhase = 1; // Sunset
        updateSkydome(); // Update the skydome appearance immediately
    } else if (event.key === 'c' || event.key === 'C') {
        currentPhase = 2; // Night
        updateSkydome(); // Update the skydome appearance immediately
    }
});

// Modify the updateSkydome function to directly set the texture based on the currentPhase
function updateSkydome() {
    switch (currentPhase) {
        case 0: // Day
            skydome.material.map = dayTexture;
            break;
        case 1: // Sunset
            skydome.material.map = sunsetTexture;
            break;
        case 2: // Night
            skydome.material.map = nightTexture;
            break;
    }
    skydome.material.needsUpdate = true;
}

const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('/Picture/roughwall.png');
//const roofTexture = textureLoader.load('/Picture/roof.png');

// Define the dimensions of the house 	
const houseDepth = 100;
const houseHeight = 20;

/// Function to create a wall with thickness
function createWall(width, height, depth, position, rotationY) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ map : wallTexture} );
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    wall.rotation.y = rotationY;
    scene.add(wall);
}


const wallThickness = 2; // Standard thickness for walls, adjust as needed

createWall(110, houseHeight, wallThickness,{x: -5, y: houseHeight / 2, z:52.5}, Math.PI);// front wall
createWall(47.5, 20,wallThickness, {x: -60, y: houseHeight / 2, z: 29}, -Math.PI / 2);// left
createWall(101.5, 20, wallThickness,{x: 50, y: houseHeight /2, z: 1}, -Math.PI / 2);// Right wall

//for the work room
createWall(70,20 , wallThickness, {x: 50, y: houseHeight / 2, z: -houseDepth / 2}, 0);//work front
createWall(45, 20,  wallThickness, {x: 15, y: houseHeight / 2, z: -72}, -Math.PI / 2);//work left
createWall(45, 20, wallThickness,   {x: 85, y: houseHeight / 2, z: -72}, Math.PI / 2);//work right
createWall(185,20 ,  wallThickness, {x: -7, y: houseHeight / 2, z: -95}, Math.PI);//work back

//for the kitchen
createWall(100, 20, wallThickness,  {x: -99.5, y: houseHeight / 2, z: -45}, -Math.PI / 2);//for the left
createWall(149,20 ,  wallThickness, {x: -25, y: houseHeight / 2, z: 5}, Math.PI);// front wall
//for the washroom
createWall(70, houseHeight, wallThickness,  {x: -64, y: houseHeight / 2, z:-35}, Math.PI);// front wall


//adding the floor
const floorloader = new GLTFLoader();
floorloader.load(
  '/model/floor (1).glb', // path to your GLB file
  function (gltf) {
	gltf.scene.position.set(0,0,0)
	gltf.scene.scale.set(7, 7, 7); // Scale the model to half its original size
	//gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
  },
);

//adding the roof 
const roofloader = new GLTFLoader();
roofloader.load(
  '/model/roof.glb', // path to your GLB file
  function (gltf) {
	gltf.scene.position.set(0,20,0)
	gltf.scene.scale.set(110,10,120); // Scale the model to half its original size
	//gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
  },
);



const bedloader = new GLTFLoader();
bedloader.load(
  '/model/bed_07.glb', // path to your GLB file
  function (gltf) {
	gltf.scene.position.set(-2.35,5, 40)
	gltf.scene.scale.set(36, 30, 30); 
	gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
  },
);


const loader = new GLTFLoader();

loader.load(
  '/model/kitchen.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(-80,0, -75)
	gltf.scene.scale.set(0.2, 0.2, 0.2); // Scale the model to half its original size
	gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
	gltf.scene.castShadow = true; //
	floor.receiveShadow = true; // Assuming 'floor' is a mesh that should receive shadows
  },
);

const dineloader = new GLTFLoader();
dineloader.load(
  '/model/diningtable.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(-30,6,-80)
	gltf.scene.scale.set(0.3, 0.3, 0.3); // Scale the model to half its original size
	gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
  },
);


const cupboardloader = new GLTFLoader();
cupboardloader.load(
  '/model/cupboard.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(-56,0,35)
	gltf.scene.scale.set(7, 10, 12); // Scale the model to half its original size
	gltf.scene.rotation.y = Math.PI / 2;
    scene.add(gltf.scene);
  },
);

const tloader = new GLTFLoader();
function addDoor(position, scale, direction) {
    tloader.load('/model/door.glb', function (gltf) {
        const door = gltf.scene;
        door.position.set(position.x, position.y, position.z);
        door.scale.set(scale+5, scale, scale*4);
        door.rotation.y = direction;
        scene.add(door);
    });
}

// Example usage:
addDoor(new THREE.Vector3(50,9,-40),25,Math.PI/2 );
addDoor(new THREE.Vector3(15,9,-60),25,Math.PI/2 );
addDoor(new THREE.Vector3(-40,9,-34.9),25, 0 );
addDoor(new THREE.Vector3(35,9,5),25, 0 );



const windowl = new GLTFLoader();
function addwindow(position, scale, direction) {
    windowl.load('/model/frontwindow.glb', function (gltf) {
        const window = gltf.scene;
        window.position.set(position.x, position.y, position.z);
        window.scale.set(scale, scale, scale);
        window.rotation.y = direction;
        scene.add(window);
    });
}

addwindow(new THREE.Vector3(87,10,-73),6, Math.PI / 2 );
addwindow(new THREE.Vector3(52,10,-10),6, Math.PI / 2 );
addwindow(new THREE.Vector3(52,10,30),6, Math.PI / 2 );
addwindow(new THREE.Vector3(-40,10, 55.6),6,0);
addwindow(new THREE.Vector3(20,10, 55.6),6,0);
addwindow(new THREE.Vector3(-40,10, -95.9),6,0);
addwindow(new THREE.Vector3(20,10,-95.9),6,0);
addwindow(new THREE.Vector3(68,10,-95.9),6,0);


const tableloader = new GLTFLoader();
tableloader.load(
  '/model/table.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(80,0,-60)
	gltf.scene.scale.set(0.1, 0.1, 0.1); // Scale the model to half its original size
	gltf.scene.rotation.y = -Math.PI / 2;
    scene.add(gltf.scene);
	// Create a point light
	const pointLight = new THREE.PointLight(0xff0000,3, 100);
	pointLight.position.set(53,3,-40); // Position the light above the object
	gltf.scene.add(pointLight);
  },
);







const bushloader = new GLTFLoader();
bushloader.load(
  '/model/bush.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(90,5,-40)
	gltf.scene.scale.set(0.05,0.05, 0.05); // Scale the model to half its original size
	gltf.scene.rotation.y = -Math.PI / 2;
    scene.add(gltf.scene);
	// Create a point light
	const pointLight = new THREE.PointLight(0xff0000,3, 100);
	pointLight.position.set(0,3,0); // Position the light above the object
	gltf.scene.add(pointLight);
  },
);

const cottageloader = new GLTFLoader();
cottageloader.load(
  '/model/cottage.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(-2.35,0, 70)
	gltf.scene.scale.set(7,7,7); // Scale the model to half its original size
	//gltf.scene.rotation.y = -Math.PI / 2;
    scene.add(gltf.scene);
	// Create a point light
	const pointLight = new THREE.PointLight(0xff0000,3, 100);
	pointLight.position.set(0,3,0); // Position the light above the object
	gltf.scene.add(pointLight);
  },
);

const lamploader = new GLTFLoader();
lamploader.load(
  '/model/lamp.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(40,0, 45)
	gltf.scene.scale.set(0.08,0.06,0.08); // Scale the model to half its original size
	//gltf.scene.rotation.y = -Math.PI / 2;
    scene.add(gltf.scene);
	// Create a point light
	const pointLight = new THREE.PointLight(0xff0000,3, 100);
	pointLight.position.set(40,10, 45); // Position the light above the object
	gltf.scene.add(pointLight);
  },
);

const washroomloader = new GLTFLoader();
washroomloader.load(
  '/model/washroom.glb', // path to your GLB file
  function (gltf) {
    // This function is called when the load is completed
    // Add the loaded model to the scene
	gltf.scene.position.set(-65,0, -15)
	gltf.scene.scale.set(13,8,15.7); // Scale the model to half its original size
	gltf.scene.rotation.y = -Math.PI / 2;
    scene.add(gltf.scene);
	// Create a point light
	const pointLight = new THREE.PointLight(0xff0000,3, 100);
	pointLight.position.set(40,10, 45); // Position the light above the object
	gltf.scene.add(pointLight);
  },
);

const lloader = new GLTFLoader();
lloader.load(
  '/model/tv1.glb', // path to your GLB file
  function (gltf) {
	gltf.scene.position.set(-18,0.3,-15)
	gltf.scene.scale.set(5.3,5,4.9); // Scale the model to half its original size
    scene.add(gltf.scene);
	
  },
);




// Lighting (optional, depending on your texture)
const light = new THREE.AmbientLight(0xffffff);
light.position.set(0, 0, 15);
scene.add(light);


var keylight = new THREE.DirectionalLight(new THREE.Color ('hsl (30, 100% , 75%)'), 1.0)
keylight.position.set(-20 , 0 , 20);
var fillLight = new THREE.DirectionalLight(new THREE.Color ('hsl (240 , 100% , 75%)'), 0.75)
fillLight.position.set(20 , 0 , 200);
var backLight = new THREE.DirectionalLight(new THREE.Color ('hsl (30, 100% , 75%)'), 1.0)
backLight.position.set(20 , 0 , -20);

scene.add(keylight);
scene.add(fillLight);
scene.add(backLight);

// Define an offset vector relative to the sphere
const cameraOffset = new THREE.Vector3(0,0,1 ); // Adjust X, Y, Z to your liking

const rotationSpeed = 0.05; // Adjust this value for faster or slower rotations

function updateRotation() {
    if (keysPressed['w']) {
        // Pitch up
        sphere.rotation.x -= rotationSpeed;
    }
    if (keysPressed['s']) {
        // Pitch down
        sphere.rotation.x += rotationSpeed;
    }
    if (keysPressed['a']) {
        // Yaw left
        sphere.rotation.y += rotationSpeed;
    }
    if (keysPressed['d']) {
        // Yaw right
        sphere.rotation.y -= rotationSpeed;
    }

    // After changing the sphere's rotation, update the camera to match its new orientation
    updateCameraPosition();
}

// Modified updateCameraPosition function to account for sphere's rotation
function updateCameraPosition() {
    const offsetRotated = cameraOffset.clone();
    offsetRotated.applyQuaternion(sphere.quaternion); // Apply the sphere's rotation to the offset
    const newPosition = new THREE.Vector3().copy(sphere.position).add(offsetRotated);
    camera.position.copy(newPosition);
    camera.lookAt(sphere.position); // Make the camera look at the sphere
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update logic for moving entities here
    updatePosition(); // Updates sphere's position
    updateRotation(); // Updates sphere's rotation
    
    // Move the spotlight with the sphere
    torchLight.position.set(sphere.position.x, sphere.position.y + 1, sphere.position.z);

    renderer.render(scene, camera);
}

animate();
