import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas").appendChild(renderer.domElement);
window.addEventListener( 'resize', onWindowResize );

let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

camera.position.z = 20;

const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
camera.add( pointLight );
scene.add( camera );

var controls = new OrbitControls(camera, renderer.domElement);

function loadModel(path, objFile, onLoad) {
    const objLoader = new OBJLoader();
    objLoader.load(objFile, (object) => {
        var box = new THREE.Box3().setFromObject( object );

        const center = box.getCenter(new THREE.Vector3());

        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);
        onLoad(object, box);
    });
}

document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  
  document.addEventListener("drop", (event) => {
    event.preventDefault();
    const objFile = event.dataTransfer.files[0];
    const txtFile = event.dataTransfer.files[1];
    loadModel(
      "",
      URL.createObjectURL(objFile),
      (object, box) => {
        document.getElementById("canvas").style.display = 'block';
        document.getElementById("drop").style.display = 'none';
        // document.getElementsByTagName('h1')[0].style.display = 'none';
          console.log(box.max.y - box.min.y)
          console.log(box.max.x - box.min.x)
          console.log(box.min.z)
          var mat = new THREE.ShaderMaterial({
            uniforms: {
              color1: {
                value: new THREE.Color("red")
              },
              color2: {
                value: new THREE.Color("purple")
              },
              color3:{
                value: new THREE.Color("black")
              },
              bboxMin: {
                value: box.min
              },
              bboxMax: {
                value: box.max
              }
            },
            vertexShader: `
              uniform vec3 bboxMin;
              uniform vec3 bboxMax;
              varying vec2 pos;
              varying vec2 vUv;
          
              void main() {
                pos.y = position.y;
                vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color1;
              uniform vec3 color2;
              uniform vec3 color3;
              varying vec2 pos;
              varying vec2 vUv;
              
              void main() {
                if (pos.y < 1.0) {
                    gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                }
                else {
                    gl_FragColor = vec4(color3, 1.0);
                }
              }
            `,
            wireframe: false
          });
          
          object.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = mat;
            }
        } );
        scene.add(object);
        animate();
      }
    );
  });

  function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX ) / 2;
    mouseY = ( event.clientY - windowHalfY ) / 2;

}
    
//

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;

    camera.lookAt( scene.position );

    controls.update();

    renderer.setClearColor( 0xffffff, 0);

    renderer.render( scene, camera );

}