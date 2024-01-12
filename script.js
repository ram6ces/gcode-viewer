import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GCodeLoader } from 'three/addons/loaders/GCodeLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


let camera, scene, renderer;
const input = document.getElementById('fileInput');
let spacePressed = false;
const loader = new GCodeLoader();
const platee = document.getElementById('plateau');
let gCodeMesh;






camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 0, 0, 200 );

scene = new THREE.Scene();

input.addEventListener('change', function(event) {

    const reader = new FileReader();

    reader.addEventListener('load', handleFileChange);

    reader.readAsBinaryString(this.files[0]);
});


const canvas = document.getElementById('canvas');

renderer = new THREE.WebGLRenderer({ 
    antialias: true,  
    canvas: canvas ,
    //alpha: true
} );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.minDistance = 10;
controls.maxDistance = 500;

window.addEventListener( 'resize', resize );

// Create a plate under the loaded object
const plateGeometry = new THREE.PlaneGeometry(200, 200,20,20); // Adjust size as needed

// Create a transparent grid material
const plateMaterial = new THREE.MeshBasicMaterial({
color: 0xffffff,
opacity: 1, // Set opacity for transparency
transparent: false, // Enable transparency
wireframe: true, // Display as wireframe/grid
wireframeLinewidth: 1, // Adjust line thickness for the grid

});
const plate = new THREE.Mesh(plateGeometry, plateMaterial);
plate.rotation.x = -Math.PI / 2; // Rotate the plate to be horizontal
plate.position.set(0, -20, 5); // Adjust position to be beneath the loaded object
scene.add(plate);


loader.load("/gcode/benchy.gcode", (mesh) => {
    console.log(mesh);
    mesh.position.set( - 100, - 20, 100 );
    scene.add( mesh );
    gCodeMesh = mesh;
});


const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3, // strength
    0.5, // radius
    0.1 // threshold
);
const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

render();






function handleFileChange(event){
    if(gCodeMesh !== undefined){
        scene.remove(gCodeMesh);
    }
    console.log(event);
    const file = event.target.result;
    console.log('Selected file:', file);
    
    
    const object= loader.parse(file);
    console.log(object);
    object.position.set( - 100, - 20, 100 );
    scene.add( object );
    gCodeMesh = object;
    

    // document.addEventListener('keydown', onKeyDown, false);
    // document.addEventListener('keyup', onKeyUp, false);

    // document.addEventListener('keydown', (event) => {
    //     if (event.code === "Space") {
    //         spacePressed = true;
    //     }
    // }
    // );

}


function resize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {
    setTimeout(() => {
        window.requestAnimationFrame(render);
    }, 1000 / 30);
    composer.render();

}
// function animate() {
//     requestAnimationFrame(animate);
//     composer.render();
// }

// animate();