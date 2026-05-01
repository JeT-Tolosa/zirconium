import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
//import * as THREE from 'three';
import { v4 as uuid } from 'uuid';

export interface VizThreeJSState extends ZirconVizState {}

/**
 * Visualizer based on ThreeJS library
 * https://www.chartjs.org/docs/latest/samples/information.html
 */
export abstract class VizThreeJS extends ZirconViz {
  private _mainDiv: HTMLDivElement = null;

  /**
   * constructor
   */
  constructor(state: VizThreeJSState) {
    super(state);
  }

  public abstract createScene(): void;

  public override onDisplay(): void {
    this.createScene();
  }

  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.style.width = '100%';
    this._mainDiv.style.height = '100%';
    this._mainDiv.id = uuid();
    return this._mainDiv;
  }
}
