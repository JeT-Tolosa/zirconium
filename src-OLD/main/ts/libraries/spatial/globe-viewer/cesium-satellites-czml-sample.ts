import * as Cesium from 'cesium';

export const station = Cesium.Cartesian3.fromDegrees(
  2.3522,
  48.8566,
  50, // altitude (Paris)
);

export const satellite = Cesium.Cartesian3.fromDegrees(
  10,
  50,
  500000, // 500 km LEO
);

export const CESIUM_SATELLITES_CZML_SAMPLE = [
  {
    id: 'document',
    name: 'LEO Satellites',
    version: '1.0',
    clock: {
      interval: '2026-05-26T00:00:00Z/2026-05-26T01:30:00Z',
      currentTime: '2026-05-26T00:00:00Z',
      multiplier: 120,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    },
  },

  // =========================
  // SAT 1 - ISS-like orbit
  // =========================
  {
    id: 'sat-iss',

    name: 'LEO Satellite A',

    availability: '2026-05-26T00:00:00Z/2026-05-26T01:30:00Z',

    position: {
      epoch: '2026-05-26T00:00:00Z',
      interpolationAlgorithm: 'LAGRANGE',
      interpolationDegree: 5,
      referenceFrame: 'INERTIAL',

      // x, y, z en mètres (orbite ~420 km)
      cartesian: [
        0, 6771000, 0, 0, 300, 5000000, 4500000, 2000000, 600, 0, 6771000,
        3000000, 900, -4500000, 5000000, 2000000, 1200, -6771000, 0, 0, 1500,
        -5000000, -4500000, -2000000, 1800, 0, -6771000, -3000000, 2100,
        4500000, -5000000, -2000000, 2400, 6771000, 0, 0,
      ],
    },

    point: {
      pixelSize: 8,
      color: { rgba: [255, 80, 80, 255] },
    },

    path: {
      material: {
        solidColor: {
          color: { rgba: [255, 80, 80, 200] },
        },
      },
      width: 2,
      trailTime: 3600,
      leadTime: 0,
    },
  },

  // =========================
  // SAT 2 - Sun-synchronous
  // =========================
  {
    id: 'sat-sso',

    name: 'LEO Satellite B',

    availability: '2026-05-26T00:00:00Z/2026-05-26T01:30:00Z',

    position: {
      epoch: '2026-05-26T00:00:00Z',
      interpolationAlgorithm: 'LAGRANGE',
      interpolationDegree: 5,
      referenceFrame: 'INERTIAL',

      cartesian: [
        0, 6800000, 0, 0, 300, 2000000, 6500000, 1500000, 600, -3000000,
        6200000, 2500000, 900, -6500000, 2000000, 3000000, 1200, -6800000, 0, 0,
        1500, -2000000, -6500000, -1500000, 1800, 3000000, -6200000, -2500000,
        2100, 6500000, -2000000, -3000000, 2400, 6800000, 0, 0,
      ],
    },

    point: {
      pixelSize: 8,
      color: { rgba: [80, 200, 255, 255] },
    },

    path: {
      material: {
        solidColor: {
          color: { rgba: [80, 200, 255, 200] },
        },
      },
      width: 2,
      trailTime: 3600,
    },
  },

  // =========================
  // SAT 3 - Inclined LEO
  // =========================
  {
    id: 'sat-inclined',

    name: 'LEO Satellite C',

    availability: '2026-05-26T00:00:00Z/2026-05-26T01:30:00Z',

    position: {
      epoch: '2026-05-26T00:00:00Z',
      interpolationAlgorithm: 'LAGRANGE',
      interpolationDegree: 5,
      referenceFrame: 'INERTIAL',

      cartesian: [
        0, 6770000, 0, 0, 300, 4000000, 5000000, 1000000, 600, -2000000,
        6500000, 2500000, 900, -6500000, 1000000, 3000000, 1200, -5000000,
        -4000000, 2000000, 1500, 0, -6770000, 0, 1800, 5000000, -4000000,
        -2000000, 2100, 6500000, 1000000, -3000000, 2400, 0, 6770000, 0,
      ],
    },

    point: {
      pixelSize: 8,
      color: { rgba: [180, 255, 120, 255] },
    },

    path: {
      material: {
        solidColor: {
          color: { rgba: [180, 255, 120, 200] },
        },
      },
      width: 2,
      trailTime: 3600,
    },
  },
];
