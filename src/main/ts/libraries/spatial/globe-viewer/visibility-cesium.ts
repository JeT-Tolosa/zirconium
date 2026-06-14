import * as Cesium from 'cesium';
export type GroundStation = {
  id: string;
  position: Cesium.Cartesian3;
  minElevationDeg?: number; // horizon mask
};
export type Satellite = {
  id: string;
  position: Cesium.Cartesian3;
};
export type VisibilityResult = {
  stationId: string;
  satelliteId: string;
  visible: boolean;
  reason?: 'HORIZON' | 'EARTH_OCCLUSION' | 'VISIBLE';
};
export class VisibilityEngineCesium {
  constructor(private viewer: Cesium.Viewer) {}

  // =========================================================
  // MAIN API
  // =========================================================
  public isVisible(
    station: GroundStation,
    satellite: Satellite,
  ): VisibilityResult {
    // 1. Horizon check (elevation mask)
    if (station.minElevationDeg !== undefined) {
      const elevOk = this.checkElevation(station, satellite.position);
      if (!elevOk) {
        return {
          stationId: station.id,
          satelliteId: satellite.id,
          visible: false,
          reason: 'HORIZON',
        };
      }
    }
    // 2. Line-of-sight check (Earth + terrain)
    const los = this.hasLineOfSight(station.position, satellite.position);
    return {
      stationId: station.id,
      satelliteId: satellite.id,
      visible: los,
      reason: los ? 'VISIBLE' : 'EARTH_OCCLUSION',
    };
  }
  // =========================================================
  // MULTI CHECK (constellation)
  // =========================================================
  public computeVisibility(
    stations: GroundStation[],
    satellites: Satellite[],
  ): VisibilityResult[] {
    const results: VisibilityResult[] = [];
    for (const station of stations) {
      for (const sat of satellites) {
        results.push(this.isVisible(station, sat));
      }
    }
    return results;
  }

  // =========================================================
  // LINE OF SIGHT (CORE)
  // =========================================================
  private hasLineOfSight(
    from: Cesium.Cartesian3,
    to: Cesium.Cartesian3,
  ): boolean {
    const direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(to, from, new Cesium.Cartesian3()),
      new Cesium.Cartesian3(),
    );
    const ray = new Cesium.Ray(from, direction);
    const hit = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    if (!hit) {
      return true;
    }
    const distTarget = Cesium.Cartesian3.distance(from, to);
    const distHit = Cesium.Cartesian3.distance(from, hit);
    return distHit > distTarget - 1e-6;
  }

  // =========================================================
  // ELEVATION MASK (horizon constraint)
  // =========================================================
  private checkElevation(
    station: GroundStation,
    target: Cesium.Cartesian3,
  ): boolean {
    const stationCarto = Cesium.Cartographic.fromCartesian(station.position);
    const targetCarto = Cesium.Cartographic.fromCartesian(target);
    const bearing = this.computeElevationAngle(stationCarto, targetCarto);
    const minElevRad = Cesium.Math.toRadians(station.minElevationDeg!);
    return bearing >= minElevRad;
  }

  private computeElevationAngle(
    from: Cesium.Cartographic,
    to: Cesium.Cartographic,
  ): number {
    // const R = 6371000;
    const lat1 = from.latitude;
    const lon1 = from.longitude;
    const lat2 = to.latitude;
    const lon2 = to.longitude;
    const dLon = lon2 - lon1;
    const x = Math.cos(lat2) * Math.cos(dLon);
    const y = Math.cos(lat2) * Math.sin(dLon);
    const z = Math.sin(lat2);
    const vector = new Cesium.Cartesian3(x, y, z);
    const up = new Cesium.Cartesian3(
      Math.cos(lat1) * Math.cos(lon1),
      Math.cos(lat1) * Math.sin(lon1),
      Math.sin(lat1),
    );
    return Cesium.Cartesian3.angleBetween(up, vector);
  }
}
// type GroundStation = {
//   id: string;
//   position: Cesium.Cartesian3;
//   minElevationDeg?: number;
// };

// type Satellite = {
//   id: string;
//   position: Cesium.Cartesian3;
// };

// type VisibilityResult = {
//   stationId: string;
//   satelliteId: string;
//   visible: boolean;
//   reason: 'VISIBLE' | 'HORIZON' | 'EARTH_OCCLUSION';
// };

export function buildInstancedVisibilityLines(
  stations: GroundStation[],
  satellites: Satellite[],
  engine: VisibilityEngineCesium,
): Cesium.Primitive {
  const instances: Cesium.GeometryInstance[] = [];

  for (const sat of satellites) {
    for (const station of stations) {
      if (!engine.isVisible(station, sat)) {
        alert('Station is not visible from satellite');
        continue;
      }
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions: [station.position, sat.position],
            width: 2,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
          }),

          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.GREEN,
            ),
          },
        }),
      );
    }
  }

  return new Cesium.Primitive({
    geometryInstances: instances,

    appearance: new Cesium.PolylineColorAppearance({
      translucent: true,
    }),

    asynchronous: false,
  });
}
