let scene, camera, renderer, clock;
let mixer, secondModelMixer;
let actions = [], secondModelActions = [];
let loadedModel;
let mode = 'open';
let isWireframe = false;
let lights, params;
let sound, secondSound;

init();

function init() {
  const assetPath = './';
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffbc9a');

  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(-5, 25, 20);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);
  secondSound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('sounds/Model3/close and pour.MP3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(1.0);
  });
  audioLoader.load('sounds/Model3/cup sound effects.MP3', function (buffer) {
    secondSound.setBuffer(buffer);
    secondSound.setLoop(false);
    secondSound.setVolume(1.0);
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
  scene.add(lights.spot);
  scene.add(lights.spotHelper);

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

  document.getElementById("btn").addEventListener('click', () => {
    if (actions.length > 0) {
      actions.forEach(action => {
        action.timeScale = 1;
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset();
        action.play();
      });
      if (sound && sound.isPlaying) sound.stop();
      if (sound) sound.play();
    }
  });

  document.getElementById("toggleWireframe").addEventListener('click', () => {
    isWireframe = !isWireframe;
    toggleWireframe(isWireframe);
  });

  document.getElementById("rotate").addEventListener('click', () => {
    if (loadedModel) {
      const axis = new THREE.Vector3(0, 1, 0);
      const angle = Math.PI / 8;
      loadedModel.rotateOnAxis(axis, angle);
    }
  });

  document.getElementById("playSecondModelAnimation").addEventListener('click', () => {
    if (secondModelActions.length > 0) {
      secondModelActions.forEach(action => {
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();
      });
      if (secondSound && secondSound.isPlaying) secondSound.stop();
      if (secondSound) secondSound.play();
    }
  });

  document.getElementById("switchModel").addEventListener('click', () => {
    loadModel('models/teacup2.glb');
  });

  loadModel('models/fruity teapot.glb');

  window.addEventListener('resize', onResize, false);
  onResize();
  animate();
}

function loadModel(modelPath) {
  if (loadedModel) {
    scene.remove(loadedModel);
    if (mixer) mixer.stopAllAction();
  }

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    scene.add(model);
    loadedModel = model;

    mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;
    actions = [];

    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actions.push(action);
    });

    if (modelPath.includes('teacup2')) {
      secondModelMixer = mixer;
      secondModelActions = actions;
    }
  }, undefined, function (error) {
    console.error('Error loading model:', error);
  });
}

function toggleWireframe(enable) {
  scene.traverse(object => {
    if (object.isMesh && object.material) {
      object.material.wireframe = enable;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  if (mixer) mixer.update(delta);
  if (secondModelMixer) secondModelMixer.update(delta);
  if (params.spot.moving) {
    lights.spot.position.x = Math.sin(elapsed) * 5;
    lights.spotHelper.update();
  }
  renderer.render(scene, camera);
}

function onResize() {
  const container = document.getElementById('model-wrapper');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
