import { ElementLoader } from '../catalog/element-loader';
import { AIS } from '../maritime/ais';
import { z } from 'zod';

interface AISStream {
  MMSI: string;
  TSTAMP: string;
  LATITUDE: string;
  LONGITUDE: string;
  COG: string;
  SOG: string;
  HEADING: string;
  NAVSTAT: string;
  IMO: string;
  NAME: string;
  CALLSIGN: string;
  TYPE: string;
  A: string;
  B: string;
  C: string;
  D: string;
  DRAUGHT: string;
  DEST: string;
  ETA: string;
}

const AISStreamSchema: z.ZodType<AISStream> = z.object({
  MMSI: z.string(),
  TSTAMP: z.string(),
  LATITUDE: z.string(),
  LONGITUDE: z.string(),
  COG: z.string(),
  SOG: z.string(),
  HEADING: z.string(),
  NAVSTAT: z.string(),
  IMO: z.string(),
  NAME: z.string(),
  CALLSIGN: z.string(),
  TYPE: z.string(),
  A: z.string(),
  B: z.string(),
  C: z.string(),
  D: z.string(),
  DRAUGHT: z.string(),
  DEST: z.string(),
  ETA: z.string(),
});

const AISStreamFileSchema = z.array(AISStreamSchema);

function AISStreamToAIS(data: AISStream[]): AIS[] {
  return data.map((element: AISStream) => {
    return {
      id: `aisstream-${element.MMSI}`,
      MMSI: Number(element.MMSI),
      TSTAMP: element.TSTAMP,
      LATITUDE: Number(element.LATITUDE),
      LONGITUDE: Number(element.LONGITUDE),
      COG: Number(element.COG),
      SOG: Number(element.SOG),
      HEADING: Number(element.HEADING),
      NAVSTAT: Number(element.NAVSTAT),
      IMO: Number(element.IMO),
      NAME: element.NAME,
      CALLSIGN: element.CALLSIGN,
      TYPE: Number(element.TYPE),
      A: Number(element.A),
      B: Number(element.B),
      C: Number(element.C),
      D: Number(element.D),
      DRAUGHT: Number(element.DRAUGHT),
      DEST: element.DEST,
      ETA: element.ETA,
    } as AIS;
  });
}

export class AISLoaderAISStreamLocalJson extends ElementLoader<AIS> {
  private _jsonContent: string = null;
  constructor(name: string, jsonContent: string) {
    super(name);
    this._jsonContent = jsonContent;
  }

  /**
   * Load ais data of type AISStream JSON
   * @param jsonContent
   * @returns
   */
  public async getData(): Promise<AIS[]> {
    const data = await Promise.resolve(this._jsonContent);
    const result = AISStreamFileSchema.safeParse(data);
    if (!result.success) throw new Error(result.error.toString());
    return AISStreamToAIS(result.data);
  }
}
