let scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, params, lights;
let loadedModel, sound;

init();

function init() {
    const assetPath = './';
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(-5, 25, 20);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/Model1/records.MP3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
    });

    const container = document.getElementById('model-wrapper');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 4);
    scene.add(ambient);

    lights = {};
    lights.spot = new THREE.SpotLight();
    lights.spot.visible = true;
    lights.spot.position.set(0, 20, 0);
    lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
    lights.spotHelper.visible = false;
    scene.add(lights.spotHelper);
    scene.add(lights.spot);

    params = {
        spot: {
            enable: false,
            color: 0xffffff,
            distance: 20,
            angle: Math.PI / 2,
            penumbra: 0,
            helper: false,
            moving: false
        }
    };

    const gui = new dat.GUI({ autoPlace: false });
    const guiContainer = document.getElementById('gui-container');
    guiContainer.appendChild(gui.domElement);

    const spot = gui.addFolder('Spot');
    spot.open();
    spot.add(params.spot, 'enable').onChange(value => lights.spot.visible = value);
    spot.addColor(params.spot, 'color').onChange(value => lights.spot.color = new THREE.Color(value));
    spot.add(params.spot, 'distance').min(0).max(20).onChange(value => lights.spot.distance = value);
    spot.add(params.spot, 'angle').min(0.1).max(6.28).onChange(value => lights.spot.angle = value);
    spot.add(params.spot, 'penumbra').min(0).max(1).onChange(value => lights.spot.penumbra = value);
    spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
    spot.add(params.spot, 'moving');

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(1, 2, 0);
    controls.update();

    mode = 'open';

    document.getElementById("btn").addEventListener('click', () => {
        if (actions.length === 2 && mode === "open") {
            actions.forEach(animAction => {
                animAction.timeScale = 1.0;
                animAction.setLoop(THREE.LoopOnce);
                animAction.clampWhenFinished = true;
                animAction.reset();
                animAction.play();
            });
            if (sound && sound.isPlaying) sound.stop();
            if (sound) sound.play();
        }
    });

    document.getElementById("toggleWireframe").addEventListener('click', () => {
        isWireframe = !isWireframe;
        togglerWireframe(isWireframe);
    });

    document.getElementById("rotate").addEventListener('click', () => {
        if (loadedModel) {
            const axis = new THREE.Vector3(0, 1, 0);
            const angle = Math.PI / 8;
            loadedModel.rotateOnAxis(axis, angle);
        }
    });

    const loader = new THREE.GLTFLoader();
    loader.load(assetPath + 'models/djBooth.glb', gltf => {
        loadedModel = gltf.scene;
        scene.add(loadedModel);
        mixer = new THREE.AnimationMixer(loadedModel);
        gltf.animations.forEach(clip => {
            const act = mixer.clipAction(clip);
            actions.push(act);
        });
    });

    window.addEventListener('resize', onResize, false);
    onResize();
    animate();
}

function togglerWireframe(enable) {
    scene.traverse(object => {
        if (object.isMesh) {
            object.material.wireframe = enable;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
    const time = clock.getElapsedTime();
    const delta = Math.sin(time) * 5;
    if (params.spot.moving) {
        lights.spot.position.x = delta;
        lights.spotHelper.update();
    }
}

function onResize() {
    const container = document.getElementById('model-wrapper');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}


