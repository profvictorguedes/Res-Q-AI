export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Hazard {
  id: string;
  type: 'fire' | 'chemical' | 'structural' | 'electrical' | 'gas' | 'unknown';
  description: string;
  location: Coordinates;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PathPoint {
  id: string;
  type: 'entry' | 'exit' | 'waypoint';
  location: Coordinates;
  description: string;
}

export interface PersonInvolved {
  count: number;
  description: string;
  status: 'unknown' | 'injured' | 'trapped' | 'safe';
}

export interface DispatchAnalysis {
  id: string;
  originalText: string;
  location: {
    address: string;
    coordinates: Coordinates;
    buildingType?: string;
  };
  incidentType: string;
  incidentSeverity: 'low' | 'medium' | 'high' | 'critical';
  hazards: Hazard[];
  entryExitPaths: PathPoint[];
  peopleInvolved: PersonInvolved[];
  summary: string;
  timestamp: string;
}
