import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, Zap, TrendingUp, RefreshCw, Sparkles, Terminal, Play, 
  HelpCircle, ChevronRight, CheckCircle2, ShieldAlert, BarChart3, AlertTriangle, Layers, Info
} from "lucide-react";

interface PipelineStage {
  stage: string;
  cpuTimeMs: number;
  gpuTimeMs: number;
  speedup: number;
  recordsProcessed: number;
}

export default function GPUPerformanceDashboard() {
  // Theme state check (defaults to dark for HUD look, fits the site perfectly)
  const [dataScale, setDataScale] = useState<number>(1000000); // 100K, 1M, 5M, 10M
  const [gpuModel, setGpuModel] = useState<string>("NVIDIA H100 (80GB SXM5)");
  const [activeChartTab, setActiveChartTab] = useState<"time" | "speedup">("time");
  
  // Pipeline simulation states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [pipelineFinished, setPipelineFinished] = useState<boolean>(false);
  const [hoveredStageIdx, setHoveredStageIdx] = useState<number | null>(null);

  // Gemini AI advice states
  const [isQueryingAdvisor, setIsQueryingAdvisor] = useState<boolean>(false);
  const [advisorAdvice, setAdvisorAdvice] = useState<string>("");
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Constants mapping GPU and Scale impact
  const gpuOptions = [
    { name: "NVIDIA H100 (80GB SXM5)", speedupMult: 2.2, powerKw: 0.70, costPerHr: 4.76, arch: "Hopper" },
    { name: "NVIDIA A100 (40GB PCIe)", speedupMult: 1.2, powerKw: 0.30, costPerHr: 2.21, arch: "Ampere" },
    { name: "NVIDIA L4 Tensor Core", speedupMult: 0.8, powerKw: 0.072, costPerHr: 0.52, arch: "Ada Lovelace" },
    { name: "NVIDIA Jetson Orin (64GB)", speedupMult: 0.3, powerKw: 0.05, costPerHr: 0.15, arch: "Ampere Embedded" },
  ];

  const scaleOptions = [
    { label: "100K Rows", value: 100000 },
    { label: "1M Rows (Standard)", value: 1000000 },
    { label: "5M Rows (Heavy)", value: 5000000 },
    { label: "10M Rows (Extreme)", value: 10000000 },
  ];

  // Base stages (calibrated for 1M standard rows on standard GPU)
  const baseStages = [
    { stage: "cuDF Ingestion", cpuTimeMs: 4200, gpuTimeMs: 140, recordsProcessed: 1250000 },
    { stage: "Spark RAPIDS Filter", cpuTimeMs: 8500, gpuTimeMs: 340, recordsProcessed: 1250000 },
    { stage: "cuML KMeans Accident Clust.", cpuTimeMs: 15400, gpuTimeMs: 440, recordsProcessed: 480000 },
    { stage: "cuGraph Route Network Resolver", cpuTimeMs: 6800, gpuTimeMs: 170, recordsProcessed: 96000 },
    { stage: "Vertex AI Predictor", cpuTimeMs: 11200, gpuTimeMs: 560, recordsProcessed: 1250000 }
  ];

  // Dynamically calculate actual pipeline performance based on selected hardware and dataset scale
  const currentPipelineData: PipelineStage[] = React.useMemo(() => {
    const selectedGpu = gpuOptions.find(g => g.name === gpuModel) || gpuOptions[0];
    const scaleFactor = dataScale / 1000000;

    return baseStages.map(item => {
      // CPU time grows strictly linearly
      let cpuTime = Math.round(item.cpuTimeMs * scaleFactor);
      
      // GPU times grow sub-linearly (benefits from scale parallelization!)
      // Scale multiplier factor modeled to give massive RAPIDS advantage at extreme scale
      const gpuSublinearFactor = Math.pow(scaleFactor, 0.65); 
      let gpuTime = Math.round((item.gpuTimeMs / selectedGpu.speedupMult) * gpuSublinearFactor);
      
      // Enforce physical minimum bounds (sub-millisecond operations round to 1ms or 2ms)
      if (gpuTime < 2) gpuTime = 2;
      if (cpuTime < 10) cpuTime = 10;

      const speedup = parseFloat((cpuTime / gpuTime).toFixed(1));
      const records = Math.round(item.recordsProcessed * scaleFactor);

      return {
        stage: item.stage,
        cpuTimeMs: cpuTime,
        gpuTimeMs: gpuTime,
        speedup,
        recordsProcessed: records
      };
    });
  }, [dataScale, gpuModel]);

  // Aggregate metrics
  const aggregateMetrics = React.useMemo(() => {
    let totalCpu = 0;
    let totalGpu = 0;
    let totalRecords = 0;

    currentPipelineData.forEach(s => {
      totalCpu += s.cpuTimeMs;
      totalGpu += s.gpuTimeMs;
      totalRecords += s.recordsProcessed;
    });

    const overallSpeedup = parseFloat((totalCpu / totalGpu).toFixed(1));
    const timeSavedMs = totalCpu - totalGpu;
    
    // Throughput records per second (overall)
    // total records divided by total GPU seconds
    const gpuSeconds = totalGpu / 1000;
    const cpuSeconds = totalCpu / 1000;
    const gpuThroughput = Math.round(totalRecords / (gpuSeconds || 0.001));
    const cpuThroughput = Math.round(totalRecords / (cpuSeconds || 0.001));

    // Power and Carbon efficiency stats
    const selectedGpu = gpuOptions.find(g => g.name === gpuModel) || gpuOptions[0];
    // Assumes dual Xeon CPU host consumes 450W continuously during execution
    const cpuPowerKw = 0.45;
    const cpuEnergyKwh = (totalCpu / 3600000) * cpuPowerKw;
    const gpuEnergyKwh = (totalGpu / 3600000) * (selectedGpu.powerKw + 0.15); // GPU + idle system overhead
    const energyReductionPct = Math.round(((cpuEnergyKwh - gpuEnergyKwh) / (cpuEnergyKwh || 1)) * 100);
    const carbonSavedGrams = Math.round((cpuEnergyKwh - gpuEnergyKwh) * 385); // 385g CO2 per kWh grid average

    return {
      totalCpu,
      totalGpu,
      overallSpeedup,
      timeSavedMs,
      gpuThroughput,
      cpuThroughput,
      energyReductionPct,
      carbonSavedGrams,
      totalRecords
    };
  }, [currentPipelineData, gpuModel]);

  // Run CUDA simulation pipeline
  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setActiveStageIndex(0);
    setPipelineFinished(false);
    
    const selectedGpu = gpuOptions.find(g => g.name === gpuModel) || gpuOptions[0];
    const timestamp = new Date().toISOString().substring(11, 19);

    const initialLogs = [
      `[${timestamp}] [CUDA_INIT] Initializing hardware device binding context...`,
      `[${timestamp}] [CUDA_INIT] Bound to GPU device: 0 [${gpuModel}] (Architecture: ${selectedGpu.arch})`,
      `[${timestamp}] [CUDA_INIT] Grid configuration: Multi-Streaming enabled, CUDA Compute Capability: 9.0`,
      `[${timestamp}] [RAPIDS] Initializing Spark RAPIDS plugin configurations...`,
      `[${timestamp}] [RAPIDS] Pinned memory heap allocator bound to RAPIDS Unified Memory Pool (RMM).`,
      `[${timestamp}] [RAPIDS] Input scale parameter: ${dataScale.toLocaleString()} database telemetry rows...`,
    ];
    setTerminalLogs(initialLogs);

    let currentStage = 0;
    const totalStages = currentPipelineData.length;

    const interval = setInterval(() => {
      if (currentStage < totalStages) {
        const stageData = currentPipelineData[currentStage];
        const logTime = new Date().toISOString().substring(11, 19);
        
        // Dynamic terminal logs based on current stage
        const stageLogs = [
          `[${logTime}] [STAGE_START] Launched pipeline stage 0${currentStage + 1}: ${stageData.stage}`,
          `[${logTime}] [MEM_SHUFFLE] Host-to-Device (HtoD) staging: ${((stageData.recordsProcessed * 32) / 1024 / 1024).toFixed(2)} MB memory copies into unified HBM`,
          `[${logTime}] [CUDA_KERNEL] Threads: 512/block | Grids: ${Math.ceil(stageData.recordsProcessed / 512).toLocaleString()} blocks parallel executing on streaming multiprocessors`,
          `[${logTime}] [STAGE_DONE] ${stageData.stage} completed: GPU ${stageData.gpuTimeMs}ms vs CPU ${stageData.cpuTimeMs}ms [Speedup: ${stageData.speedup}x]`,
        ];

        setTerminalLogs(prev => [...prev, ...stageLogs]);
        currentStage++;
        setActiveStageIndex(currentStage);
        setProgress(Math.round((currentStage / totalStages) * 100));
      } else {
        clearInterval(interval);
        const finalTime = new Date().toISOString().substring(11, 19);
        setTerminalLogs(prev => [
          ...prev,
          `[${finalTime}] [RAPIDS_FINISH] RAPIDS Pipeline Execution Complete.`,
          `[${finalTime}] [STATS] Cumulative GPU latency: ${aggregateMetrics.totalGpu}ms | Speedup advantage: ${aggregateMetrics.overallSpeedup}x`,
          `[${finalTime}] [STATS] High-Throughput processing peak: ${(aggregateMetrics.gpuThroughput / 1000000).toFixed(2)}M records/sec.`,
          `[${finalTime}] [CUDA_SYS] Released device references. CUDA contexts successfully cleaned up. [STATUS: IDLE]`
        ]);
        setIsRunning(false);
        setActiveStageIndex(null);
        setPipelineFinished(true);
      }
    }, 1200);
  };

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Request performance advisor guidelines from Gemini API
  const queryGeminiAdvisor = async () => {
    setIsQueryingAdvisor(true);
    setAdvisorError(null);
    setAdvisorAdvice("");

    try {
      const response = await fetch("/api/gemini/gpu-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gpuModel,
          scaleRecords: dataScale,
          pipelineData: currentPipelineData
        })
      });

      const data = await response.json();
      if (response.ok && data.advice) {
        setAdvisorAdvice(data.advice);
      } else {
        throw new Error(data.error || "Failed to compile GPU optimization suggestions from Gemini API.");
      }
    } catch (err: any) {
      setAdvisorError(err.message || "Advisor communication failure. Please verify your Gemini API key in settings.");
    } finally {
      setIsQueryingAdvisor(false);
    }
  };

  // Custom SVG Chart rendering helpers
  // Maximum CPU time for scaling the chart vertical height
  const maxCpuTime = Math.max(...currentPipelineData.map(d => d.cpuTimeMs));
  const maxSpeedup = Math.max(...currentPipelineData.map(d => d.speedup));

  return (
    <div className="space-y-6" id="gpu-performance-dashboard">
      
      {/* Top Controls & Configuration HUD Header */}
      <div className="border border-slate-900 bg-slate-950/80 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest font-mono">NVIDIA RAPIDS™ Core Accelerator Engine</h2>
                  <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md uppercase animate-pulse">
                    CUDA-ACCELERATED
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Comparing multi-threaded CPU vs CUDA GPU cluster performance metrics on streaming spatial GIS telemetry</p>
              </div>
            </div>
          </div>

          {/* Trigger Pipeline Run and Dynamic Parameter Selection */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Scale Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono font-semibold uppercase text-slate-500 tracking-wider">Simulation Data Scale</span>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80">
                {scaleOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (!isRunning) {
                        setDataScale(opt.value);
                        setPipelineFinished(false);
                        setTerminalLogs([]);
                      }
                    }}
                    disabled={isRunning}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                      dataScale === opt.value
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 disabled:opacity-40"
                    }`}
                  >
                    {opt.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono font-semibold uppercase text-slate-500 tracking-wider">GPU Cluster Hardware</span>
              <select
                value={gpuModel}
                onChange={(e) => {
                  if (!isRunning) {
                    setGpuModel(e.target.value);
                    setPipelineFinished(false);
                    setTerminalLogs([]);
                  }
                }}
                disabled={isRunning}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-1.5 rounded-xl text-[10px] font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer disabled:opacity-40"
              >
                {gpuOptions.map(g => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 text-xs font-bold font-mono px-4 py-2 rounded-xl border transition-all mt-4 lg:mt-0 cursor-pointer ${
                isRunning
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 text-white shadow-lg shadow-emerald-600/15 cursor-pointer"
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  CUDA Active...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Simulate RAPIDS Pipeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Speedup and Processing Aggregates Cards (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Speedup Multiplier */}
        <div className="p-4 border border-slate-900 bg-slate-950 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">RAPIDS Multiplier</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono tracking-tighter text-blue-400">
              {aggregateMetrics.overallSpeedup}x
            </span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase animate-pulse">Faster</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-blue-500" />
            <span>Parallel GPU Streams active</span>
          </div>
        </div>

        {/* KPI 2: Total GPU Execution Time */}
        <div className="p-4 border border-slate-900 bg-slate-950 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Latency: CPU vs GPU</span>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-500 line-through">CPU: {aggregateMetrics.totalCpu.toLocaleString()}ms</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono tracking-tighter text-emerald-400">
                {aggregateMetrics.totalGpu.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">ms</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-emerald-500/80 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Saved {aggregateMetrics.timeSavedMs.toLocaleString()}ms</span>
          </div>
        </div>

        {/* KPI 3: Peak Throughput */}
        <div className="p-4 border border-slate-900 bg-slate-950 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">CUDA Peak Throughput</span>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="text-xl font-black font-mono tracking-tighter text-cyan-400">
              {(aggregateMetrics.gpuThroughput / 1000).toFixed(1)}K
            </span>
            <span className="text-[9px] text-slate-400 font-mono">rec/sec</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 flex justify-between border-t border-slate-900/60 pt-1 mt-1">
            <span>CPU: {(aggregateMetrics.cpuThroughput / 1000).toFixed(1)}K/sec</span>
            <span className="text-cyan-400 font-semibold">+{Math.round((aggregateMetrics.gpuThroughput / (aggregateMetrics.cpuThroughput || 1)))}x</span>
          </div>
        </div>

        {/* KPI 4: Carbon & Energy Footprint Reduction */}
        <div className="p-4 border border-slate-900 bg-slate-950 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block">Carbon Footprint Saved</span>
          <div className="mt-2">
            <span className="text-xl font-black font-mono tracking-tighter text-amber-400">
              -{aggregateMetrics.energyReductionPct}%
            </span>
            <span className="text-[9px] text-emerald-400 font-bold ml-2 font-mono">Power</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Saved {aggregateMetrics.carbonSavedGrams.toLocaleString()}g CO₂ eq</span>
          </div>
        </div>

      </div>

      {/* Main Core Section: Interactive SVG Charts & Terminal Emulation */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Custom SVG Performance Charts */}
        <div className="lg:col-span-7 border border-slate-900 bg-slate-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[440px]">
          
          <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
            <div>
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Pipeline Stage Performance Profiling
              </h3>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">Click scale toggles or hover stages to display unified CUDA metrics</p>
            </div>

            {/* Chart Tab selectors */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setActiveChartTab("time")}
                className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                  activeChartTab === "time"
                    ? "bg-slate-800 text-slate-100 border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Time comparison (ms)
              </button>
              <button
                onClick={() => setActiveChartTab("speedup")}
                className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg cursor-pointer transition-all ${
                  activeChartTab === "speedup"
                    ? "bg-slate-800 text-slate-100 border border-slate-700/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Speedup factor curve
              </button>
            </div>
          </div>

          {/* Core Custom SVG Render Area */}
          <div className="flex-1 flex flex-col justify-center min-h-[260px] relative">
            {activeChartTab === "time" ? (
              /* SVG Chart: CPU vs GPU Time Comparison (Rendered with pure responsive mathematical precision) */
              <div className="w-full relative">
                <svg viewBox="0 0 520 220" className="w-full h-full overflow-visible select-none">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                    const y = 20 + ratio * 160;
                    const gridVal = Math.round(maxCpuTime - ratio * maxCpuTime);
                    return (
                      <g key={gridIdx}>
                        <line 
                          x1="50" y1={y} x2="510" y2={y} 
                          className="stroke-slate-900/60" 
                          strokeWidth="1" 
                          strokeDasharray="4 4"
                        />
                        <text 
                          x="40" y={y + 3} 
                          className="fill-slate-500 font-mono text-[9px] text-right" 
                          textAnchor="end"
                        >
                          {gridVal >= 1000 ? `${(gridVal/1000).toFixed(1)}s` : `${gridVal}ms`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Columns rendering */}
                  {currentPipelineData.map((stage, sIdx) => {
                    const barWidth = 18;
                    const groupSpacing = 90;
                    const groupX = 85 + sIdx * groupSpacing;
                    
                    // Scaling math
                    const cpuHeight = (stage.cpuTimeMs / maxCpuTime) * 160;
                    const gpuHeight = (stage.gpuTimeMs / maxCpuTime) * 160;

                    const cpuY = 180 - cpuHeight;
                    const gpuY = 180 - gpuHeight;

                    const isHovered = hoveredStageIdx === sIdx;
                    const isActiveRunning = activeStageIndex === sIdx;

                    return (
                      <g 
                        key={sIdx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredStageIdx(sIdx)}
                        onMouseLeave={() => setHoveredStageIdx(null)}
                      >
                        {/* Shaded hover block background */}
                        <rect
                          x={groupX - 25} y="15"
                          width="75" height="175"
                          className={`rx-lg fill-transparent transition-colors ${
                            isHovered ? "fill-slate-900/25" : ""
                          } ${isActiveRunning ? "fill-emerald-500/5 stroke-dashed stroke-emerald-500/20" : ""}`}
                          rx="8"
                        />

                        {/* CPU Bar (Classic Gray-Slate) */}
                        <rect
                          x={groupX - 16} y={cpuY}
                          width={barWidth} height={cpuHeight}
                          className="fill-slate-800 hover:fill-slate-700 transition-colors"
                          rx="3"
                        />

                        {/* GPU Bar (Glow CUDA Emerald-500) */}
                        <rect
                          x={groupX + 4} y={gpuY}
                          width={barWidth} height={gpuHeight > 2 ? gpuHeight : 2}
                          className={`fill-emerald-500 transition-all ${
                            isHovered ? "fill-emerald-400 shadow-lg" : ""
                          }`}
                          rx="3"
                          filter="url(#glow-emerald)"
                        />

                        {/* Active Indicator Pin */}
                        {isActiveRunning && (
                          <circle cx={groupX + 13} cy={gpuY - 10} r="3" className="fill-emerald-400 animate-ping" />
                        )}

                        {/* Stage Abbreviation label on X Axis */}
                        <text
                          x={groupX + 3} y="196"
                          className={`font-mono text-[8.5px] text-center font-bold transition-colors ${
                            isHovered ? "fill-slate-200" : "fill-slate-500"
                          }`}
                          textAnchor="middle"
                        >
                          {stage.stage.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient & Glow Filter Declarations */}
                  <defs>
                    <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                </svg>

                {/* Bottom X-Axis Guide Labels */}
                <div className="flex justify-between px-6 mt-1.5 text-[8px] font-mono text-slate-500 uppercase border-t border-slate-900/60 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-800 border border-slate-700 rounded-sm inline-block" />
                    <span>CPU Latency</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
                    <span>NVIDIA GPU (RAPIDS)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* SVG Chart 2: Speedup Curve Multiplier Line Chart */
              <div className="w-full relative">
                <svg viewBox="0 0 520 220" className="w-full h-full overflow-visible select-none">
                  {/* Grid Lines for multipliers */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                    const y = 20 + ratio * 160;
                    const gridVal = Math.round(maxSpeedup - ratio * maxSpeedup);
                    return (
                      <g key={gridIdx}>
                        <line 
                          x1="50" y1={y} x2="510" y2={y} 
                          className="stroke-slate-900/60" 
                          strokeWidth="1" 
                          strokeDasharray="4 4"
                        />
                        <text 
                          x="40" y={y + 3} 
                          className="fill-slate-500 font-mono text-[9px] text-right" 
                          textAnchor="end"
                        >
                          {gridVal}x
                        </text>
                      </g>
                    );
                  })}

                  {/* Interactive area fill */}
                  {(() => {
                    const groupSpacing = 90;
                    const points = currentPipelineData.map((stage, idx) => {
                      const x = 85 + idx * groupSpacing + 10;
                      const y = 180 - (stage.speedup / maxSpeedup) * 160;
                      return { x, y };
                    });

                    // Build SVG path
                    let dFill = `M ${points[0].x} 180 `;
                    let dLine = `M ${points[0].x} ${points[0].y} `;
                    
                    points.forEach((p, idx) => {
                      if (idx > 0) {
                        dLine += `L ${p.x} ${p.y} `;
                      }
                      dFill += `L ${p.x} ${p.y} `;
                    });

                    dFill += `L ${points[points.length - 1].x} 180 Z`;

                    return (
                      <g>
                        {/* Glow Gradient Under Spline Area */}
                        <path 
                          d={dFill} 
                          className="fill-blue-500/10 pointer-events-none" 
                        />
                        
                        {/* Line path */}
                        <path 
                          d={dLine} 
                          fill="none" 
                          className="stroke-blue-400" 
                          strokeWidth="2.5" 
                        />

                        {/* Data Node Circles */}
                        {points.map((p, idx) => {
                          const isHovered = hoveredStageIdx === idx;
                          const stage = currentPipelineData[idx];
                          return (
                            <g 
                              key={idx}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredStageIdx(idx)}
                              onMouseLeave={() => setHoveredStageIdx(null)}
                            >
                              <circle 
                                cx={p.x} cy={p.y} 
                                r={isHovered ? "7" : "4"} 
                                className={`fill-slate-950 stroke-blue-400 transition-all ${
                                  isHovered ? "stroke-blue-300 stroke-3" : "stroke-2"
                                }`} 
                              />
                              <text
                                x={p.x} y={p.y - 12}
                                className="fill-blue-400 font-mono text-[9.5px] text-center font-bold"
                                textAnchor="middle"
                              >
                                {stage.speedup}x
                              </text>
                              
                              <text
                                x={p.x} y="196"
                                className={`font-mono text-[8.5px] transition-colors ${
                                  isHovered ? "fill-slate-200" : "fill-slate-500"
                                }`}
                                textAnchor="middle"
                              >
                                {stage.stage.split(" ")[0]}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>

                {/* Bottom Guide */}
                <div className="flex justify-center mt-1.5 text-[8.1px] font-mono text-slate-500 uppercase border-t border-slate-900/60 pt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-5 h-1 bg-blue-400 inline-block" />
                    <span>NVIDIA GPU Speedup Factor curve relative to multi-threaded CPU baselines</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hover Tooltip Overlay (Grounded in hoveredStageIdx) */}
            {hoveredStageIdx !== null && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-slate-800 bg-slate-950/95 p-3.5 rounded-xl shadow-xl w-64 text-xs font-mono text-slate-300 animate-fade-in backdrop-blur-md pointer-events-none z-10">
                <div className="border-b border-slate-850 pb-1.5 mb-2 flex justify-between items-center">
                  <span className="font-bold text-[10.5px] text-slate-200 uppercase tracking-tight truncate max-w-[130px]">
                    {currentPipelineData[hoveredStageIdx].stage}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded-md">
                    {currentPipelineData[hoveredStageIdx].speedup}x Speedup
                  </span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase">Records Processed:</span>
                    <span className="font-bold text-slate-300">{currentPipelineData[hoveredStageIdx].recordsProcessed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase">CPU Execution Latency:</span>
                    <span className="font-bold text-slate-400">{currentPipelineData[hoveredStageIdx].cpuTimeMs.toLocaleString()} ms</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span className="font-semibold uppercase">NVIDIA GPU (RAPIDS):</span>
                    <span className="font-extrabold">{currentPipelineData[hoveredStageIdx].gpuTimeMs.toLocaleString()} ms</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1.5 text-blue-400">
                    <span className="font-semibold uppercase">Absolute Time Saved:</span>
                    <span className="font-extrabold">{(currentPipelineData[hoveredStageIdx].cpuTimeMs - currentPipelineData[hoveredStageIdx].gpuTimeMs).toLocaleString()} ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics summary list */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-900/60 pt-4 text-[10px] font-mono text-slate-400">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 block uppercase">Est. Cloud Compute cost</span>
              <span className="font-bold text-slate-300">
                ${((gpuOptions.find(g => g.name === gpuModel)?.costPerHr || 1) * (aggregateMetrics.totalGpu / 3600000)).toFixed(5)} / hr scale
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 block uppercase">GPU Thermal Load limit</span>
              <span className="font-bold text-emerald-400">64°C - STABLE</span>
            </div>
            <div className="space-y-0.5 hidden sm:block">
              <span className="text-[9px] text-slate-500 block uppercase">CUDA Warp Occupancy</span>
              <span className="font-bold text-blue-400">96.8% (Maximum)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Real-time CUDA Stream terminal simulation */}
        <div className="lg:col-span-5 border border-slate-900 bg-slate-950 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-[440px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 flex gap-1 pointer-events-none">
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
          </div>

          <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-slate-300">
              Active Hardware CUDA Stream Terminal
            </span>
          </div>

          {/* Console Text Window */}
          <div className="flex-1 bg-slate-950 border border-slate-900/80 rounded-xl p-3 font-mono text-[9px] leading-relaxed text-slate-400 overflow-y-auto space-y-1 scrollbar-thin max-h-[300px]">
            {terminalLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-2 py-20">
                <Cpu className="h-8 w-8 text-slate-800 animate-pulse" />
                <p>Terminal inactive.</p>
                <p className="text-[8px]">Trigger "Simulate RAPIDS Pipeline" to view real-time CUDA device memory allocations and thread performance logs.</p>
              </div>
            ) : (
              terminalLogs.map((log, i) => {
                let colorClass = "text-slate-400";
                if (log.includes("[STAGE_START]")) colorClass = "text-blue-400 font-bold";
                else if (log.includes("[STAGE_DONE]")) colorClass = "text-emerald-400 font-bold";
                else if (log.includes("[CUDA_INIT]")) colorClass = "text-slate-500";
                else if (log.includes("[STATS]")) colorClass = "text-cyan-400 font-bold";
                else if (log.includes("[RAPIDS_FINISH]")) colorClass = "text-emerald-500 font-black tracking-wide";

                return (
                  <div key={i} className={`whitespace-pre-wrap transition-all animate-fade-in ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Bottom active pipeline indicator list */}
          <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-400 animate-ping" : "bg-slate-700"}`} />
              <span className="text-[8.5px] font-mono uppercase text-slate-500">
                {isRunning ? `PROCESSING STAGE ${activeStageIndex! + 1}/5` : pipelineFinished ? "COMPLETED SUCCESS" : "IDLE"}
              </span>
            </div>
            
            {isRunning && (
              <div className="w-24 bg-slate-900 rounded-full h-1.5 border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Gemini Performance Advisor Section */}
      <div className="border border-slate-900 bg-slate-950 rounded-2xl p-6 shadow-xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-widest font-mono">Gemini AI RAPIDS Infrastructure Advisor</h3>
              <p className="text-[10px] text-slate-500 font-mono">Run specialized GPU compiler diagnostics and cluster scale optimizer advices</p>
            </div>
          </div>

          <button
            onClick={queryGeminiAdvisor}
            disabled={isQueryingAdvisor}
            className={`flex items-center gap-2 text-xs font-bold font-mono px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              isQueryingAdvisor
                ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 border-blue-500/20 text-white shadow-lg shadow-blue-500/10"
            }`}
          >
            {isQueryingAdvisor ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
                Compiling Diagnostics...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Query Gemini Performance Audit
              </>
            )}
          </button>
        </div>

        {/* Advisor Report Output Frame */}
        <div className={`p-5 rounded-2xl border ${
          isQueryingAdvisor || advisorAdvice ? "bg-slate-900/30 border-slate-800/80" : "bg-slate-950 border-slate-900/60"
        } min-h-[140px] flex flex-col justify-center`}>
          {isQueryingAdvisor ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-xs font-mono font-bold text-slate-300">Evaluating multi-node RMM Heap allocations...</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">Modeling cache hit-ratios on {gpuModel} across {dataScale.toLocaleString()} records</p>
              </div>
            </div>
          ) : advisorError ? (
            <div className="flex gap-3 items-start border border-rose-500/10 bg-rose-950/10 text-rose-400 p-4 rounded-xl text-xs font-mono">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-extrabold text-[13px] uppercase tracking-wider">Diagnostic Communication Error</p>
                <p className="mt-1 text-slate-300">{advisorError}</p>
                <p className="mt-2 text-slate-500 text-[10px]">Ensure your Gemini API Key is active inside your environment preferences (.env) before auditing hardware execution schedules.</p>
              </div>
            </div>
          ) : advisorAdvice ? (
            <div className="text-xs leading-relaxed space-y-4 text-slate-300 whitespace-pre-line font-mono max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {advisorAdvice}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-500 py-6">
              <Info className="h-6 w-6 text-slate-700 mb-2" />
              <p className="text-xs font-mono">Advisor report queue is ready.</p>
              <p className="text-[9px] font-mono text-slate-600 mt-1">Select your hardware configuration, choose your dataset scale, then press the advisor trigger button above to initiate a deep learning hardware analysis.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
