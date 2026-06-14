export const GROUND_STATION_TYPE = 'GroundStation';


export function groundStationComparator(gs1: GroundStation, gs2: GroundStation): number {
        if (!gs1 && gs2) {return 1;}
        if (gs1 && !gs2) {return -1;}
  return  gs1.id.localeCompare(gs2.id);
}

export interface GroundStation {
  coordinates: {
    lon: number;
    lat: number;
  };
  id: string;
  name: string;
  data_imagery?: string;
  imagery?: string;
  state?: string;
  country?: string;
  URL?: string;
  satellites?: string;
}
