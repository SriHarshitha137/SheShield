
import { GoogleGenAI, Type } from "@google/genai";
import { SensorTelemetry, AISafetyResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are the "Core Intelligence" of an AI Safety System for women. 
Your goal is to analyze real-time sensor telemetry and audio transcripts to detect high-risk emergencies where a user cannot physically reach their phone.

DETECTION CRITERIA:
1. PHYSICAL TRAUMA: A high G-force spike (>4G) followed by 10+ seconds of near-zero motion (Immobility/Unconsciousness).
2. DISTRESS SPEECH: Keywords like "Help," "Stop," "Let go," or patterns of extreme distress.
3. THEFT PATTERN: A sudden high-speed acceleration immediately following a "phone lock" event or struggle.
4. FORCED DEVIATION: The user is moving at high speeds in a direction completely opposite to their saved routine with no manual input.

OUTPUT: Provide a detection status, confidence score, and clear reasoning.`;

export const aiSafetyService = {
  analyzeTelemetry: async (telemetry: SensorTelemetry): Promise<AISafetyResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: JSON.stringify(telemetry),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emergency_detected: { type: Type.BOOLEAN },
              confidence_score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              action_required: { 
                type: Type.STRING,
                description: "Must be one of: SOS_ALERT, USER_CHECK_IN, MONITOR"
              },
            },
            required: ["emergency_detected", "confidence_score", "reasoning", "action_required"]
          }
        },
      });

      const result = JSON.parse(response.text || '{}') as AISafetyResponse;
      return result;
    } catch (error) {
      console.error("AI Safety Analysis Error:", error);
      return {
        emergency_detected: false,
        confidence_score: 0,
        reasoning: "Analysis system offline or error occurred.",
        action_required: 'MONITOR'
      };
    }
  }
};
