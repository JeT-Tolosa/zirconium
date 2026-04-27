import { VizThreeJS } from './viz-eye-threeJS';
import * as THREE from 'three/webgpu';
import { mix, oscSine, time, pmremTexture, float } from 'three/tsl';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Inspector } from 'three/addons/inspector/Inspector.js';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';

export interface VizHelmetSampleThreeJSState extends ZirconVizState {
  type: typeof VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE;
}

/**
 * Visualizer based on ThreeJS library
 * https://www.chartjs.org/docs/latest/samples/information.html
 */
export class VizHelmetSampleThreeJS extends VizThreeJS {
  public static readonly HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE =
    'HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE';
  private _cube: THREE.Mesh = null;
  private _geometry: THREE.BoxGeometry = null;
  private _scene: THREE.Scene = null;
  private _renderer: THREE.WebGPURenderer = null;
  private _camera: THREE.PerspectiveCamera = null;
  private _material: THREE.MeshNormalMaterial = null;

  /**
   * constructor
   */
  constructor(state?: VizHelmetSampleThreeJSState) {
    super(state);
  }

  /**
   */
  public async createScene(): Promise<void> {
    if (this._scene) return;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, 1, 0.25, 20);
    this._camera.position.set(-1.8, 0.6, 2.7);

    this._renderer = new THREE.WebGPURenderer({ antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this.getMainDiv().appendChild(this._renderer.domElement);

    const hdrUrls = [
      'px.hdr',
      'nx.hdr',
      'py.hdr',
      'ny.hdr',
      'pz.hdr',
      'nz.hdr',
    ];
    const cube1Texture = new HDRCubeTextureLoader()
      .setPath('./assets/3D/textures/pisa/')
      .load(hdrUrls);

    cube1Texture.generateMipmaps = true;
    cube1Texture.minFilter = THREE.LinearMipmapLinearFilter;

    const cube2Urls = [
      'dark-s_px.jpg',
      'dark-s_nx.jpg',
      'dark-s_py.jpg',
      'dark-s_ny.jpg',
      'dark-s_pz.jpg',
      'dark-s_nz.jpg',
    ];
    const cube2Texture = await new THREE.CubeTextureLoader()
      .setPath('./assets/3D/textures/MilkyWay/')
      .loadAsync(cube2Urls);

    cube2Texture.generateMipmaps = true;
    cube2Texture.minFilter = THREE.LinearMipmapLinearFilter;

    this._scene.environmentNode = mix(
      pmremTexture(cube2Texture),
      pmremTexture(cube1Texture),
      oscSine(time.mul(0.1)),
    );

    this._scene.backgroundNode = this._scene.environmentNode.context({
      getTextureLevel: () => float(0.9),
    });

    const loader = new GLTFLoader().setPath(
      './assets/3D/models/DamagedHelmet/',
    );
    await loader.loadAsync('DamagedHelmet.gltf').then((gltf) => {
      this._scene.add(gltf.scene);
      return gltf;
    });

    // this._renderer.toneMapping = THREE.LinearToneMapping;
    this._renderer.inspector = new Inspector();
    this._renderer.setAnimationLoop(this.render.bind(this));

    const controls = new OrbitControls(this._camera, this._renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 15;
  }

  //

  public render() {
    if (
      this._renderer.domElement.width != this.getMainDiv().clientWidth ||
      this._renderer.domElement.height != this.getMainDiv().clientHeight
    ) {
      this._camera.aspect =
        this.getMainDiv().clientWidth / this.getMainDiv().clientHeight;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(
        this.getMainDiv().clientWidth,
        this.getMainDiv().clientHeight,
      );
    }
    this._renderer.render(this._scene, this._camera);
  }
}
