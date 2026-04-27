import { z } from 'zod';
import { GroundStation } from './ground-station';
import { ElementLoader } from './satellite-loader';

// interface USRadioGuyGroundStation {
//   type: 'Feature';
//   geometry: {
//     type: 'Point';
//     coordinates: [number, number];
//   };
//   properties: {
//     Station_name: string;
//     URL?: string;
//     Country?: string;
//     Province_State?: string;
//     Imagery?: string;
//     Satellites_received?: string;
//     Data_Imagery?: string;
//   };
// }

const USRadioGuyGroundStationSchema = z.object({
  type: z.enum(['Feature']),
  geometry: z.object({
    type: z.literal(['Point']),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    Station_name: z.string(),
    URL: z.string().optional(),
    Country: z.string().optional(),
    Province_State: z.string().optional(),
    Imagery: z.string().optional().optional(),
    Satellites_received: z.string().optional(),
    Data_Imagery: z.string().optional(),
  }),
});

const USRadioGuyGroundStationFileSchema = z.object({
  type: z.enum(['FeatureCollection']),
  features: z.array(USRadioGuyGroundStationSchema),
});

export class USRadioGuyGroundStationLoaderJson extends ElementLoader<GroundStation> {
  constructor() {
    super('USRadioGuy Loader');
  }

  /**
   * Load satellite data of type Celestrak JSON
   * @param fileLocation
   * @returns
   */
  public loadLocalJson(fileLocation: string): Promise<GroundStation[]> {
    let retrievedData: Promise<unknown> = null;
    // if (this._local) retrievedData = this.fetchDataCelestrakLocal();
    // else retrievedData = this.fetchDataCelestrakOnline();
    retrievedData = Promise.resolve(fileLocation);
    // return this.fetchDataCelestrakOnline()
    return retrievedData.then((data) => {
      const result = USRadioGuyGroundStationFileSchema.safeParse(data);

      if (!result.success) {
        throw result.error;
      }

      const fileContent = result.data;
      return fileContent.features.map((element) => {
        return {
          coordinates: {
            lon: element.geometry.coordinates[0],
            lat: element.geometry.coordinates[1],
          },
          name: element.properties.Station_name,
          country: element.properties.Country,
          state: element.properties.Province_State,
          satellites: element.properties.Satellites_received,
          data_imagery: element.properties.Data_Imagery,
          imagery: element.properties.Imagery,
        } as GroundStation;
      });
    });
  }
}
