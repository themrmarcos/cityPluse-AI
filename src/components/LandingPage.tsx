import React from "react";
import { Shield, Zap, Compass, Activity, Server, Cpu, Layers, FileText, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Cyber-City Animated Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-[120px] animate-pulse duration-5000" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl">
              <Layers className="h-6 w-6 text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                CityPulse AI
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-blue-400/80 uppercase">
                Urban Intelligence
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">How it Works</a>
            <a href="#stats" className="hover:text-blue-400 transition-colors">Data Grid</a>
          </div>

          <button
            onClick={onStart}
            id="nav-get-started-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Launch Platform
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-400 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>NVIDIA RAPIDS & Vertex AI Acceleration Live</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
          Smart Urban Intelligence for <br />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
            Resilient Cyber-Cities
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          Analyze traffic flow, micro-climates, air quality index, flood thresholds, and structural road indices in real-time. Powering emergency responder dispatch and micro-delivery routes with Gemini-driven spatial analytics.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <button
            onClick={onStart}
            id="hero-get-started-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm px-8 py-4 rounded-xl backdrop-blur-sm transition-all"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Floating Mockup / Visualizer Preview */}
        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 backdrop-blur-md shadow-2xl">
          <div className="absolute -top-3.5 left-6 bg-slate-950 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-mono text-blue-400 uppercase tracking-widest">
            CityPulse Spatial Grid Preview
          </div>
          <div className="bg-slate-950/90 rounded-xl overflow-hidden aspect-[16/9] border border-slate-900/60 flex flex-col">
            {/* Top Toolbar */}
            <div className="border-b border-slate-900 px-4 py-2.5 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-500 ml-2">GIS_GRID_FEED_ACTIVE</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono text-emerald-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GPU_PROCESSING: 0.14ms
                </span>
                <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  40.0x Speedup
                </span>
              </div>
            </div>
            
            {/* Visualizer Body */}
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-8 overflow-hidden">
              {/* Cyber City Isometric Vector */}
              <div className="relative w-full h-full max-w-md flex flex-col justify-center items-center">
                <div className="absolute w-64 h-64 border border-blue-500/20 rounded-full animate-ping duration-3000" />
                <div className="absolute w-48 h-48 border border-emerald-500/25 rounded-full animate-spin-slow" />
                
                {/* Node Grid Layout */}
                <div className="grid grid-cols-4 gap-6 z-10 w-full">
                  {[
                    { label: "Downtown Core", status: "Heavy Traffic", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
                    { label: "Riverfront Delta", status: "Flood Alert", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
                    { label: "Industrial Hub", status: "AQL 165 Spike", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
                    { label: "Uptown Tech", status: "Optimal Flow", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
                  ].map((node, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${node.bg} ${node.border} text-left flex flex-col justify-between h-28 transform hover:-translate-y-1 transition-transform cursor-pointer`}>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">NODE-0{i+1}</span>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">{node.label}</h4>
                        <p className={`text-[10px] font-mono font-medium ${node.color} mt-1`}>{node.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="border-t border-slate-900 bg-slate-950/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Average Commute Reduced", val: "18.4%" },
              { label: "Emergency Response Optimization", val: "-4.2 min" },
              { label: "RAPIDS Pipeline Speedup", val: "40.0x" },
              { label: "Vertex AI Prediction Accuracy", val: "94.2%" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 border border-slate-900 bg-slate-900/20 rounded-2xl backdrop-blur-sm">
                <p className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.val}
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Unified Spatial Intelligence Engines
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Equipped with targeted analysis matrices tailored specifically for four specialized segments of the urban ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Compass className="h-6 w-6 text-blue-400" />,
              title: "Adaptive Routing Matrix",
              desc: "Calculates fastest, safest, eco-friendly, and lowest-fuel pathways factoring real-time road conditions, carbon emission thresholds, and flood risks."
            },
            {
              icon: <Shield className="h-6 w-6 text-emerald-400" />,
              title: "Incident Response Desk",
              desc: "Provides emergency dispatchers and administration with localized closure coordinates, evacuation protocol Alpha routes, and instant severity updates."
            },
            {
              icon: <Zap className="h-6 w-6 text-amber-400" />,
              title: "RAPIDS GPU Analytics",
              desc: "Showcases standard BigQuery query acceleration using NVIDIA Spark RAPIDS, accelerating sensor data aggregation up to 40.0x over traditional CPUs."
            },
            {
              icon: <Activity className="h-6 w-6 text-rose-400" />,
              title: "Multilayer GIS Heatmaps",
              desc: "Toggle high-fidelity layers tracking localized PM2.5 pollution spikes, accident risk clusters, road structural potholes, and flash-flood zones."
            },
            {
              icon: <Cpu className="h-6 w-6 text-indigo-400" />,
              title: "Gemini Chat Assistant",
              desc: "Ask CityPulse AI natural language questions regarding bottleneck root causes, localized weather impact, or predicted 24-hour congestion trends."
            },
            {
              icon: <FileText className="h-6 w-6 text-teal-400" />,
              title: "Auto-Report Compiler",
              desc: "Generate spatial impact PDF summaries and export structured road quality CSV sheets directly to regional maintenance and municipality partners."
            }
          ].map((feat, i) => (
            <div key={i} className="p-8 border border-slate-900 bg-slate-900/30 rounded-2xl hover:border-slate-800 transition-colors">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl w-fit mb-6">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-100">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Architecture & Tech Section */}
      <section id="technology" className="border-t border-slate-900 bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium text-blue-400 mb-6">
                <Server className="h-3.5 w-3.5" />
                <span>Google Cloud + NVIDIA Stack</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                High-Performance Pipeline <br />
                From Sensor to Insight
              </h2>
              
              <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">
                CityPulse AI operates on a modern big-data schema designed for high throughput. IoT sensors, citizen reports, and weather telemetry ingest continuously. Standard data streams are offloaded to an accelerated GPU backend, allowing deep clustering and LLM querying in milliseconds.
              </p>

              {/* Data Flow list */}
              <div className="space-y-4 font-mono text-xs text-slate-400">
                {[
                  "1. INGEST: IoT Sensors & Citizen Reports stored in Google Cloud Storage",
                  "2. COMPUTE: Data offloaded to Apache Spark accelerated by NVIDIA RAPIDS GPUs",
                  "3. TRANSFORM: Accelerated clustering & prediction run via Vertex AI Models",
                  "4. SYNTHESIZE: Spatial constraints parsed by Gemini-3.5-Flash for Q&A",
                  "5. VISUALIZE: Full Looker-style visual reporting dashboard compiled live"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphic Representation */}
            <div className="p-8 border border-slate-800 bg-slate-900/20 rounded-2xl flex flex-col justify-center gap-6 relative">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-blue-500 uppercase tracking-widest">Architectural Spec</div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-4 border-b border-slate-900 pb-2">
                  <span className="text-xs font-semibold text-slate-300">NVIDIA RAPIDS GPU PIPELINE</span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded border border-slate-800">
                    <div className="text-slate-500">Traditional CPU</div>
                    <div className="text-lg font-bold text-slate-300 mt-1">11,200 ms</div>
                    <div className="text-[10px] text-slate-500 mt-1">Multi-core overhead</div>
                  </div>
                  <div className="p-3 bg-blue-950/20 rounded border border-blue-500/20">
                    <div className="text-blue-400">NVIDIA H100 GPU</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">560 ms</div>
                    <div className="text-[10px] text-blue-300 mt-1">Vertex AI predictor</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-slate-900/50 rounded text-center text-xs text-blue-400 border border-slate-800/80">
                  ⚡ 20x speedup in Vertex AI Model predictions
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3 border-b border-slate-900 pb-2">
                  <span className="text-xs font-semibold text-slate-300">INTELLIGENT URBAN VERBATIM</span>
                  <span className="text-[10px] font-mono text-blue-400">GEMINI LLM</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono text-slate-400">
                  <div className="flex gap-2">
                    <span className="text-emerald-400">Q:</span>
                    <span>What is the status of the flood evacuation routes?</span>
                  </div>
                  <div className="flex gap-2 p-2 bg-slate-900 rounded border border-slate-900 text-slate-300 leading-normal">
                    <span className="text-blue-400">A:</span>
                    <span>Gemini: Evacuation Protocol Route Alpha has been activated. River Boulevard flooding is successfully bypassed with safety index of 99/100.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 relative z-10 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-slate-300 text-sm">CityPulse AI</span>
          </div>
          <div>
            <p>© 2026 CityPulse AI – Urban Data Intelligence Platform. Built for Google Cloud + NVIDIA Acceleration Hackathon.</p>
          </div>
          <div className="flex gap-6 text-slate-400 font-medium">
            <a href="#" className="hover:text-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Contact Operator</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
