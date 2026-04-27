import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizThreeJS } from './viz-eye-threeJS';
import * as THREE from 'three';

export interface VizCubeSampleThreeJSState extends ZirconVizState {
  type: typeof VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE;
}
/**
 * Visualizer based on ThreeJS library
 * https://www.chartjs.org/docs/latest/samples/information.html
 */
export class VizCubeSampleThreeJS extends VizThreeJS {
  public static readonly CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE =
    'CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE';
  private _cube: THREE.Mesh = null;
  private _geometry: THREE.BoxGeometry = null;
  private _scene: THREE.Scene = null;
  private _renderer: THREE.WebGLRenderer = null;
  private _camera: THREE.PerspectiveCamera = null;
  private _material: THREE.MeshNormalMaterial = null;

  /**
   * constructor
   */
  constructor(state?: VizCubeSampleThreeJSState) {
    super(state);
  }

  /**
   */
  public createScene(): void {
    if (this._scene) return;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(
      75, // Field of View
      1, // aspect ratio
      0.1, // near clipping plane
      1000, // far clipping plane
    );
    this._renderer = new THREE.WebGLRenderer({
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });

    this._renderer.setSize(200, 200);
    this.getMainDiv().appendChild(this._renderer.domElement);

    this._geometry = new THREE.BoxGeometry(1, 1, 1);
    this._material = new THREE.MeshNormalMaterial();
    this._cube = new THREE.Mesh(this._geometry, this._material);
    this._scene.add(this._cube);
    this._camera.position.z = 5; // move camera back so we can see the cube

    this.render();
  }

  private render() {
    requestAnimationFrame(this.render.bind(this));

    // rotate cube a little each frame
    this._cube.rotation.x += 0.05;
    this._cube.rotation.y += 0.05;
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
