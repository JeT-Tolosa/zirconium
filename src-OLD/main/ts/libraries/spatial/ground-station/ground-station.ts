export const GROUND_STATION_TYPE = 'GroundStation';

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
