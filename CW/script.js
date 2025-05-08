let scene, camera, renderer, clock, mixer, actions = [], model, controls;
let models = [
    './models/fruity teapot.glb',
    './models/IPOD.glb',
    './models/djBooth.glb'
];
let currentIndex = 0;

window.addEventListener('DOMContentLoaded', init);

function init() {
    clock = new THREE.Clock();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#9addff');

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    const container = document.querySelector('#content-container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.setSize(container.clientWidth, container.clientHeight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    document.getElementById('prevBtn').addEventListener('click', () => showModel(-1));
    document.getElementById('nextBtn').addEventListener('click', () => showModel(1));

    window.addEventListener('resize', resize, false);

    loadModel(models[currentIndex]);
    animate();
}

function loadModel(assetPath) {
    const loader = new THREE.GLTFLoader();

    if (model) {
        scene.remove(model);
        actions = [];
        mixer = null;
    }

    loader.load(assetPath, function(gltf) {
        model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.position.set(0, 0, 0);
        scene.add(model);

        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach(clip => {
                const action = mixer.clipAction(clip);
                actions.push(action);
            });
        }
    }, undefined, function(error) {
        console.error('Error loading model:', error);
    });
}

function showModel(direction) {
    currentIndex = (currentIndex + direction + models.length) % models.length;
    loadModel(models[currentIndex]);
}

function animate() {
    requestAnimationFrame(animate);

    if (model) {
        model.rotation.y += 0.005;
    }

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    controls.update();
    renderer.render(scene, camera);
}

function resize() {
    const container = document.querySelector('#content-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}
