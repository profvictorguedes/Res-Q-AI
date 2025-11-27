import { DispatchAnalysis, Hazard, PathPoint, Coordinates } from '@/types/dispatch';
import { v4 as uuidv4 } from 'uuid';

const HAZARD_KEYWORDS: Record<string, Hazard['type']> = {
  'fire': 'fire',
  'flames': 'fire',
  'burning': 'fire',
  'smoke': 'fire',
  'chemical': 'chemical',
  'hazmat': 'chemical',
  'toxic': 'chemical',
  'spill': 'chemical',
  'structural': 'structural',
  'collapse': 'structural',
  'unstable': 'structural',
  'damaged': 'structural',
  'electrical': 'electrical',
  'power line': 'electrical',
  'electrocution': 'electrical',
  'gas': 'gas',
  'propane': 'gas',
  'natural gas': 'gas',
  'leak': 'gas',
};

const INCIDENT_TYPES: Record<string, string> = {
  'fire': 'Structure Fire',
  'accident': 'Vehicle Accident',
  'crash': 'Vehicle Accident',
  'medical': 'Medical Emergency',
  'rescue': 'Rescue Operation',
  'hazmat': 'Hazardous Materials',
  'chemical': 'Hazardous Materials',
  'collapse': 'Structural Collapse',
  'explosion': 'Explosion',
};

function extractCoordinatesFromAddress(address: string): Coordinates {
  const cityCoords: Record<string, Coordinates> = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'phoenix': { lat: 33.4484, lng: -112.0740 },
    'philadelphia': { lat: 39.9526, lng: -75.1652 },
    'san antonio': { lat: 29.4241, lng: -98.4936 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'seattle': { lat: 47.6062, lng: -122.3321 },
  };
  
  const lowerAddress = address.toLowerCase();
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (lowerAddress.includes(city)) {
      const streetNumber = address.match(/\d+/)?.[0] || '0';
      const offset = (parseInt(streetNumber) % 100) / 10000;
      return {
        lat: coords.lat + offset,
        lng: coords.lng + offset,
      };
    }
  }
  
  return { lat: 40.7128, lng: -74.0060 };
}

function extractHazards(text: string, baseCoords: Coordinates): Hazard[] {
  const hazards: Hazard[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [keyword, type] of Object.entries(HAZARD_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      const existingType = hazards.find(h => h.type === type);
      if (!existingType) {
        const offset = (hazards.length + 1) * 0.0002;
        hazards.push({
          id: uuidv4(),
          type,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} hazard detected`,
          location: {
            lat: baseCoords.lat + offset,
            lng: baseCoords.lng + offset,
          },
          severity: determineSeverity(type, lowerText),
        });
      }
    }
  }
  
  return hazards;
}

function determineSeverity(hazardType: string, text: string): Hazard['severity'] {
  const criticalWords = ['explosion', 'collapse', 'trapped', 'severe', 'critical'];
  const highWords = ['spreading', 'multiple', 'large', 'intense'];
  const mediumWords = ['moderate', 'contained', 'small'];
  
  if (criticalWords.some(word => text.includes(word))) return 'critical';
  if (highWords.some(word => text.includes(word))) return 'high';
  if (mediumWords.some(word => text.includes(word))) return 'medium';
  
  if (hazardType === 'fire' || hazardType === 'chemical') return 'high';
  return 'medium';
}

function extractIncidentType(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [keyword, type] of Object.entries(INCIDENT_TYPES)) {
    if (lowerText.includes(keyword)) {
      return type;
    }
  }
  
  return 'General Emergency';
}

function extractPeopleInvolved(text: string) {
  const people = [];
  const numberPattern = /(\d+)\s*(people|persons|individuals|victims|patients|occupants)/gi;
  const matches = text.matchAll(numberPattern);
  
  for (const match of matches) {
    people.push({
      count: parseInt(match[1]),
      description: match[2],
      status: text.toLowerCase().includes('injured') ? 'injured' as const : 
              text.toLowerCase().includes('trapped') ? 'trapped' as const : 
              'unknown' as const,
    });
  }
  
  if (people.length === 0) {
    const unknownPattern = /people|persons|victims|occupants/gi;
    if (unknownPattern.test(text)) {
      people.push({
        count: 0,
        description: 'Unknown number of people',
        status: 'unknown' as const,
      });
    }
  }
  
  return people;
}

function generateEntryExitPaths(baseCoords: Coordinates, hazards: Hazard[]): PathPoint[] {
  const paths: PathPoint[] = [];
  
  // Calculate offset based on hazard positions to suggest safer entry points
  const hazardOffset = hazards.length > 0 ? 0.0002 * hazards.length : 0;
  
  paths.push({
    id: uuidv4(),
    type: 'entry',
    location: {
      lat: baseCoords.lat - 0.001 - hazardOffset,
      lng: baseCoords.lng - 0.0005,
    },
    description: 'Primary Entry Point - North Approach',
  });
  
  paths.push({
    id: uuidv4(),
    type: 'entry',
    location: {
      lat: baseCoords.lat + 0.0005,
      lng: baseCoords.lng - 0.001 - hazardOffset,
    },
    description: 'Secondary Entry Point - East Approach',
  });
  
  paths.push({
    id: uuidv4(),
    type: 'exit',
    location: {
      lat: baseCoords.lat + 0.001 + hazardOffset,
      lng: baseCoords.lng + 0.0005,
    },
    description: 'Emergency Exit Route - South',
  });
  
  paths.push({
    id: uuidv4(),
    type: 'exit',
    location: {
      lat: baseCoords.lat - 0.0005,
      lng: baseCoords.lng + 0.001 + hazardOffset,
    },
    description: 'Evacuation Route - West',
  });
  
  return paths;
}

function extractAddress(text: string): string {
  const addressPatterns = [
    /at\s+(\d+[^,.\n]+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|place|pl)[^,.\n]*)/i,
    /(\d+[^,.\n]+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|place|pl)[^,.\n]*)/i,
    /location[:\s]+([^,.\n]+)/i,
    /address[:\s]+([^,.\n]+)/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown Location';
}

function extractBuildingType(text: string): string | undefined {
  const buildingTypes = [
    'warehouse', 'apartment', 'residential', 'commercial', 'industrial',
    'hospital', 'school', 'office', 'factory', 'store', 'restaurant',
    'hotel', 'house', 'building', 'complex', 'facility'
  ];
  
  const lowerText = text.toLowerCase();
  for (const type of buildingTypes) {
    if (lowerText.includes(type)) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
  
  return undefined;
}

function generateSummary(analysis: Partial<DispatchAnalysis>): string {
  const parts = [];
  
  if (analysis.incidentType) {
    parts.push(`${analysis.incidentType}`);
  }
  
  if (analysis.location?.address) {
    parts.push(`at ${analysis.location.address}`);
  }
  
  if (analysis.hazards && analysis.hazards.length > 0) {
    const hazardTypes = analysis.hazards.map(h => h.type).join(', ');
    parts.push(`Hazards: ${hazardTypes}`);
  }
  
  if (analysis.peopleInvolved && analysis.peopleInvolved.length > 0) {
    const totalPeople = analysis.peopleInvolved.reduce((sum, p) => sum + p.count, 0);
    if (totalPeople > 0) {
      parts.push(`${totalPeople} people involved`);
    }
  }
  
  return parts.join('. ') + '.';
}

export async function analyzeDispatch(dispatchText: string): Promise<DispatchAnalysis> {
  const address = extractAddress(dispatchText);
  const coordinates = extractCoordinatesFromAddress(address + ' ' + dispatchText);
  
  const hazards = extractHazards(dispatchText, coordinates);
  const entryExitPaths = generateEntryExitPaths(coordinates, hazards);
  const incidentType = extractIncidentType(dispatchText);
  const peopleInvolved = extractPeopleInvolved(dispatchText);
  const buildingType = extractBuildingType(dispatchText);
  
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
  const maxSeverity = hazards.reduce<'low' | 'medium' | 'high' | 'critical'>((max, h) => {
    return severities.indexOf(h.severity) > severities.indexOf(max) ? h.severity : max;
  }, 'medium');
  
  const partialAnalysis: Partial<DispatchAnalysis> = {
    incidentType,
    location: {
      address,
      coordinates,
      buildingType,
    },
    hazards,
    peopleInvolved,
  };
  
  const analysis: DispatchAnalysis = {
    id: uuidv4(),
    originalText: dispatchText,
    location: {
      address,
      coordinates,
      buildingType,
    },
    incidentType,
    incidentSeverity: maxSeverity,
    hazards,
    entryExitPaths,
    peopleInvolved,
    summary: generateSummary(partialAnalysis),
    timestamp: new Date().toISOString(),
  };
  
  return analysis;
}

export interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

export async function analyzeDispatchWithAzureAI(
  dispatchText: string,
  config: AzureAIConfig
): Promise<DispatchAnalysis> {
  const prompt = `Analyze this emergency dispatch text and extract key information in JSON format:
  
Dispatch: "${dispatchText}"

Return a JSON object with:
- address: the incident location address
- incidentType: type of emergency (fire, medical, rescue, hazmat, etc.)
- hazards: array of {type, description, severity} for detected hazards
- peopleCount: number of people involved
- peopleStatus: status of people (injured, trapped, safe, unknown)
- buildingType: type of structure if mentioned

JSON:`;

  try {
    const response = await fetch(`${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-06-01`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an emergency dispatch analyzer. Extract key safety information from dispatch texts and return structured JSON data.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn('Azure AI API call failed, falling back to local analysis');
      return analyzeDispatch(dispatchText);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    const validHazardTypes = ['fire', 'chemical', 'structural', 'electrical', 'gas', 'unknown'] as const;
    const validSeverities = ['low', 'medium', 'high', 'critical'] as const;
    
    if (aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse);
        const coordinates = extractCoordinatesFromAddress(parsed.address || dispatchText);
        
        const hazards: Hazard[] = (parsed.hazards || []).map((h: {type?: string; description?: string; severity?: string}) => {
          const hazardType = validHazardTypes.includes(h.type as typeof validHazardTypes[number]) 
            ? h.type as Hazard['type'] 
            : 'unknown';
          const hazardSeverity = validSeverities.includes(h.severity as typeof validSeverities[number])
            ? h.severity as Hazard['severity']
            : 'medium';
          
          return {
            id: uuidv4(),
            type: hazardType,
            description: h.description || 'Unknown hazard',
            location: {
              lat: coordinates.lat + Math.random() * 0.0004 - 0.0002,
              lng: coordinates.lng + Math.random() * 0.0004 - 0.0002,
            },
            severity: hazardSeverity,
          };
        });
        
        return {
          id: uuidv4(),
          originalText: dispatchText,
          location: {
            address: parsed.address || extractAddress(dispatchText),
            coordinates,
            buildingType: parsed.buildingType,
          },
          incidentType: parsed.incidentType || extractIncidentType(dispatchText),
          incidentSeverity: hazards.length > 0 ? hazards[0].severity : 'medium',
          hazards,
          entryExitPaths: generateEntryExitPaths(coordinates, hazards),
          peopleInvolved: parsed.peopleCount ? [{
            count: parsed.peopleCount,
            description: 'People involved',
            status: parsed.peopleStatus || 'unknown',
          }] : [],
          summary: generateSummary({
            incidentType: parsed.incidentType,
            location: { address: parsed.address, coordinates },
            hazards,
            peopleInvolved: [{ count: parsed.peopleCount || 0, description: '', status: 'unknown' }],
          }),
          timestamp: new Date().toISOString(),
        };
      } catch {
        console.warn('Failed to parse AI response, falling back to local analysis');
        return analyzeDispatch(dispatchText);
      }
    }
    
    return analyzeDispatch(dispatchText);
  } catch (error) {
    console.warn('Azure AI request failed, falling back to local analysis:', error);
    return analyzeDispatch(dispatchText);
  }
}
