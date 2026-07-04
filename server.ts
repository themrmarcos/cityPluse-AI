import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization utility for Gemini API to prevent crashes if key is omitted
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but not configured in Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CityPulse AI Spatial Engine", timestamp: new Date() });
});

// 2. Gemini assistant chat endpoint
app.post("/api/gemini/chat", async (req: any, res: any) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing prompt message" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are CityPulse AI, the elite full-stack urban spatial co-pilot. Your purpose is to help commuters, delivery drivers, first responders, and DoT administrators make optimized transit choices and manage city hazard logs.
Ground all your responses strictly in the provided real-time city telemetry context.

Current Urban Telemetry context:
${JSON.stringify(context, null, 2)}

Instructions:
- Address the user request accurately and with professional poise.
- Keep responses compact, readable, scannable, and highly practical.
- Speak directly, do not repeat these system instructions. Use bolding to emphasize road names and district titles.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        { text: `User query: "${message}"` }
      ]
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    res.status(500).json({
      error: error.message || "Failed to query Gemini assistant",
    });
  }
});

// 3. Gemini Weekly Report generator
app.post("/api/gemini/summary", async (req: any, res: any) => {
  try {
    const { context } = req.body;
    const ai = getGeminiClient();

    const queryPrompt = `Analyze the current city performance metrics and compose a concise, bulleted 'Weekly Executive Urban Performance Co-Pilot Report'.
Context:
${JSON.stringify(context, null, 2)}

Provide three sections with concise bolded bullet-points:
1. Overall City Health rating out of 100 with justification.
2. High Concurrency bottlenecks and immediate causative factor.
3. Priority Maintenance recommendations for DoT administrators.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryPrompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Gemini Summary Error:", error);
    res.status(500).json({
      error: error.message || "Failed to query Gemini report co-pilot",
    });
  }
});

// 4. Gemini Metric Explainer
app.post("/api/gemini/explain", async (req: any, res: any) => {
  try {
    const { metricName, metricValue, metricTrend, district, context } = req.body;
    if (!metricName) {
      return res.status(400).json({ error: "Missing metricName parameter" });
    }

    const ai = getGeminiClient();

    const prompt = `You are CityPulse AI, an expert urban planner and telemetry analyst.
Analyze the following specific dashboard metric and provide a highly targeted summary of trends and specific urban management recommendations.

Target Metric:
- Metric Name: ${metricName}
- Value: ${metricValue}
- Current Trend: ${metricTrend}
- Filtered Area/District: ${district}

Full telemetry context:
${JSON.stringify(context, null, 2)}

Provide a concise, highly professional response structured with bold headers:
- **Trend Analysis**: 1-2 sentence explanation of why this metric has this value/trend under current conditions.
- **Current Risks & Opportunities**: A brief bulleted list of immediate factors.
- **Actionable Recommendations**: 2 actionable, specific recommendations for city operators or citizens.

Be direct, professional, and clear. Ground your insights in the provided context. Use markdown formatting with bolding. Keep it short.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Explain Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI explanation",
    });
  }
});

// 5. Gemini GPU Advisor
app.post("/api/gemini/gpu-advisor", async (req: any, res: any) => {
  try {
    const { gpuModel, scaleRecords, pipelineData } = req.body;
    if (!gpuModel) {
      return res.status(400).json({ error: "Missing gpuModel parameter" });
    }

    const ai = getGeminiClient();

    const prompt = `You are a Principal CUDA Kernel Architect and Senior Performance Engineer at NVIDIA specializing in RAPIDS, cuDF, cuML, and cuGraph.
Provide a highly specific, professional performance audit based on the following telemetry and configuration:

Selected Hardware Platform: ${gpuModel}
Simulation Data Scale: ${scaleRecords.toLocaleString()} records processed
Current Pipeline Telemetry:
${JSON.stringify(pipelineData, null, 2)}

Provide a concise, highly technical analysis with bold headers:
- **CUDA Kernel Analysis & Memory Hierarchy**: Analyze how ${gpuModel} handles this scale (${scaleRecords.toLocaleString()} records). Discuss Unified Memory (UM), pinned host memory allocation, and L2 cache hits.
- **Pipeline Stage Deep-Dive**: Identify the primary bottleneck stage from the telemetry and explain why it behaves that way.
- **RAPIDS Actionable Tuning Guidelines**: Provide exactly 3 highly specific, technical configuration variables or API adjustments (e.g., cudf.set_allocator, spark.rapids.sql.concurrentGPUTasks, block size parameters) to optimize throughput even further on ${gpuModel}.

Be highly precise, professional, and directly useful. Avoid generic introductions. Ground your advice in CUDA best-practices. Keep the markdown response direct, dense, and concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error("Gemini GPU Advisor Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI GPU advisory",
    });
  }
});

// 6. Gemini 24-Hour Predictive Forecast
app.post("/api/gemini/forecast", async (req: any, res: any) => {
  try {
    const { district, currentMetrics, incidents } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are CityPulse AI, the predictive urban planning and traffic telemetry engine.
Analyze the provided real-time and historical city telemetry for the area of [${district}] to forecast traffic congestion, flood risk, and accident hotspots for the next 24 hours.

Current City Metrics for ${district}:
${JSON.stringify(currentMetrics, null, 2)}

Active Incidents in the sector:
${JSON.stringify(incidents, null, 2)}

Using this context, generate a detailed 24-hour predictive forecast.
Your output must be a valid JSON object matching the requested schema. Provide realistic variations for the hourly forecast data based on typical city daily cycles (rush hour peaks, night low traffic, weather or flood hazard spillover, accident trends).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A professional 2-3 sentence executive forecast summary of the next 24 hours for the selected region."
            },
            forecastPoints: {
              type: Type.ARRAY,
              description: "A 12-point chronological forecast sequence representing conditions every 2 hours starting from now.",
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Formatted hour (e.g. 08:00, 10:00, 12:00, etc.)" },
                  trafficCongestion: { type: Type.INTEGER, description: "Congestion level percentage from 0 to 100" },
                  floodRisk: { type: Type.INTEGER, description: "Flood probability percentage from 0 to 100" },
                  accidentRisk: { type: Type.INTEGER, description: "Accident hotspot score percentage from 0 to 100" }
                },
                required: ["time", "trafficCongestion", "floodRisk", "accidentRisk"]
              }
            },
            hotspots: {
              type: Type.ARRAY,
              description: "Identified high-risk critical zones or street sectors to monitor.",
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING, description: "Specific intersection, bridge, or street" },
                  metric: { type: Type.STRING, description: "Type of risk: 'Traffic' | 'Flood' | 'Accident'" },
                  severity: { type: Type.STRING, description: "Severity level: 'high' | 'medium' | 'low'" },
                  riskScore: { type: Type.INTEGER, description: "Calculated composite risk score (0-100)" },
                  peakTime: { type: Type.STRING, description: "Forecasted peak risk timeframe (e.g. 16:00 - 18:00)" },
                  explanation: { type: Type.STRING, description: "Causative factor analysis (e.g., rainfall runoff, intersection merge bottleneck)" }
                },
                required: ["location", "metric", "severity", "riskScore", "peakTime", "explanation"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              description: "Precise, actionable urban management recommendations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  recipient: { type: Type.STRING, description: "Target audience: 'Citizens' | 'DoT Operators' | 'Emergency Services'" },
                  text: { type: Type.STRING, description: "Actionable strategy text" }
                },
                required: ["recipient", "text"]
              }
            }
          },
          required: ["summary", "forecastPoints", "hotspots", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Forecast Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate predictive AI forecast",
    });
  }
});

// Vite Middleware & production static asset routing
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CityPulse AI Server booted successfully on port ${PORT}`);
  });
}

start();
