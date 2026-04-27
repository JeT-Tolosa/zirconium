import { Satellite } from './satellite';
import { ElementLoader } from './satellite-loader';
import { z } from 'zod';

interface CelestrackSatellite {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  EPOCH?: string;
  MEAN_MOTION?: number;
  CLASSIFICATION_TYPE?: string;
  ECCENTRICITY?: number;
  INCLINATION?: number;
  RA_OF_ASC_NODE?: number;
  ARG_OF_PERICENTER?: number;
  MEAN_ANOMALY?: number;
  EPHEMERIS_TYPE?: number;
  NORAD_CAT_ID?: number;
  ELEMENT_SET_NO?: number;
  REV_AT_EPOCH?: number;
  BSTAR?: number;
  MEAN_MOTION_DOT?: number;
  MEAN_MOTION_DDOT?: number;
}

const CelestrackSatelliteSchema: z.ZodType<CelestrackSatellite> = z.object({
  OBJECT_NAME: z.string(),
  OBJECT_ID: z.string(),
  EPOCH: z.string().optional(),
  MEAN_MOTION: z.number().optional(),
  CLASSIFICATION_TYPE: z.string().optional(),
  ECCENTRICITY: z.number().optional(),
  INCLINATION: z.number().optional(),
  RA_OF_ASC_NODE: z.number().optional(),
  ARG_OF_PERICENTER: z.number().optional(),
  MEAN_ANOMALY: z.number().optional(),
  EPHEMERIS_TYPE: z.number().optional(),
  NORAD_CAT_ID: z.number().optional(),
  ELEMENT_SET_NO: z.number().optional(),
  REV_AT_EPOCH: z.number().optional(),
  BSTAR: z.number().optional(),
  MEAN_MOTION_DOT: z.number().optional(),
  MEAN_MOTION_DDOT: z.number().optional(),
});

const CelestrackSatelliteFileSchema = z.array(CelestrackSatelliteSchema);

export class SatelliteLoaderCelestrakJson extends ElementLoader<Satellite> {
  constructor(name: string) {
    super(name);
  }

  /**
   * Load satellite data of type Celestrak JSON
   * @param fileLocation
   * @returns
   */
  public loadLocalJson(fileLocation: string): Promise<Satellite[]> {
    let retrievedData: Promise<unknown> = null;
    // if (this._local) retrievedData = this.fetchDataCelestrakLocal();
    // else retrievedData = this.fetchDataCelestrakOnline();
    retrievedData = Promise.resolve(fileLocation);
    // return this.fetchDataCelestrakOnline()
    return retrievedData.then((data) => {
      const result = CelestrackSatelliteFileSchema.safeParse(data);

      if (!result.success) {
        throw result.error;
      }

      const fileContent = result.data; // typé automatiquement
      return fileContent.map((element) => {
        return {
          OBJECT_NAME: element.OBJECT_NAME,
          OBJECT_ID: element.OBJECT_ID,
        } as Satellite;
      });
    });
  }
}
