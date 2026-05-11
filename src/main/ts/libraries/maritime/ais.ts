export const AIS_TYPE = 'AIS';

export interface AIS {
  id: string;
  MMSI?: number;
  TSTAMP?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  COG?: number;
  SOG?: number;
  HEADING?: number;
  NAVSTAT?: number;
  IMO?: number;
  NAME?: string;
  CALLSIGN?: string;
  TYPE?: number;
  A?: number;
  B?: number;
  C?: number;
  D?: number;
  DRAUGHT?: number;
  DEST?: string;
  ETA?: string;
}
