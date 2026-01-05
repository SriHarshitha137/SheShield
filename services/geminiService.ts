
import { GoogleGenAI } from "@google/genai";

/**
 * Resolves raw coordinates to a human-readable address for forensic logging.
 */
export async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide the nearest human-readable street address or landmark for coordinates: ${lat}, ${lng}. 
      Return only the address string. Be concise.`,
    });
    return response.text?.trim() || "Unknown Location";
  } catch (err) {
    console.error("Address resolution failed:", err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Finds nearby police stations using Gemini 2.5 with Google Maps grounding.
 */
export async function findNearbyPoliceStations(lat: number, lng: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `ACT AS AN EMERGENCY DISPATCHER. 
      Identify the 3 closest Police Stations to the precise GPS coordinates: Latitude ${lat}, Longitude ${lng}. 
      Prioritize 24/7 active stations and Women's Help Desks if available in the vicinity.
      Return the station names and their direct Google Maps navigation links.`,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const stations = groundingChunks
      .map((chunk: any) => {
        if (chunk.maps) {
          return {
            name: chunk.maps.title || "Verified Police Station",
            uri: chunk.maps.uri,
            source: 'Google Maps',
            type: 'OFFICIAL_STATION',
            address: 'Verified via Google Maps'
          };
        } else if (chunk.web) {
          return {
            name: chunk.web.title || "Local Authority Hub",
            uri: chunk.web.uri,
            source: 'Google Search',
            type: 'SEARCH_RESULT',
            address: 'Found via Web Index'
          };
        }
        return null;
      })
      .filter((s: any) => s !== null && s.uri);

    const uniqueStations = Array.from(new Map(stations.map(s => [s.name, s])).values()).slice(0, 3);

    if (uniqueStations.length > 0) {
      return uniqueStations;
    }

    return [
      { 
        name: "District Police Headquarters", 
        address: "Regional Command Center", 
        uri: `https://www.google.com/maps/search/police+station/@${lat},${lng},15z`,
        source: 'System Fallback'
      }
    ];

  } catch (error) {
    console.error("Gemini Grounding Engine Failure:", error);
    return [
      { 
        name: "National Help Desk 112", 
        address: "Emergency Response Hub", 
        uri: `https://www.google.com/maps/search/police+station/@${lat},${lng},15z`,
        source: 'Fail-safe'
      }
    ];
  }
}
