import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Volume2, VolumeX, Mic, MicOff, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage, Incident, CityMetrics } from "../types";

interface AIAssistantProps {
  currentMetrics: CityMetrics;
  activeIncidents: Incident[];
}

export default function AIAssistant({ currentMetrics, activeIncidents }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am CityPulse AI, your intelligent urban voice and text assistant. How can I help you optimize your transit or manage municipality operations today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle TTS synthesis
  const speakText = (text: string) => {
    if (!speechEnabled) return;
    window.speechSynthesis?.cancel();
    
    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*#`_\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis?.speak(utterance);
  };

  // Toggle Listening via Web Speech API
  const handleToggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Error: Web Speech Recognition API is not supported in this browser. Please use text typing.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Submit standard prompt to express API proxying Gemini SDK
  const handleSubmitPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: promptText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const context = {
        safetyScore: currentMetrics.safetyScore,
        trafficIndex: currentMetrics.trafficIndex,
        airQualityIndex: currentMetrics.airQualityIndex,
        floodRisk: currentMetrics.floodRisk,
        activeIncidents: activeIncidents.map(i => ({
          title: i.title,
          type: i.type,
          location: i.location,
          severity: i.severity,
          description: i.description
        }))
      };

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptText, context })
      });

      const data = await response.json();
      
      if (response.ok && data.response) {
        const aiMsg: ChatMessage = {
          sender: "ai",
          text: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(data.response);
      } else {
        throw new Error(data.error || "Failed call response from Server AI API.");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        sender: "ai",
        text: `⚠ Service Interruption: Unable to contact CityPulse Server. Error detail: ${err.message}. Showing local intelligence context.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const PRESET_QUERIES = [
    "Which route is safest?",
    "Why should I avoid River Boulevard?",
    "What is causing today's congestion?",
    "Predict tomorrow's traffic trend."
  ];

  return (
    <div className="border border-slate-900 bg-slate-950 rounded-2xl p-5 shadow-xl flex flex-col h-[500px]" id="gemini-assistant-panel">
      
      {/* Assistant Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">Gemini Spatial Intelligence</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (speechEnabled) window.speechSynthesis?.cancel();
            }}
            id="toggle-tts-feedback"
            className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
              speechEnabled
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                : "border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
            title="Toggle Text-To-Speech readbacks"
          >
            {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Preset fast questions buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmitPrompt(q)}
            id={`preset-prompt-${idx}`}
            className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-mono py-1.5 px-3 rounded-lg transition-all hover:border-slate-700 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Logs Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin">
        {messages.map((msg, i) => {
          const isAI = msg.sender === "ai";
          return (
            <div key={i} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                isAI
                  ? "bg-slate-900 border border-slate-850 text-slate-200"
                  : "bg-blue-600 text-white font-medium shadow-md"
              }`}>
                <div className="flex items-center justify-between mb-1 text-[9px] font-mono opacity-50">
                  <span>{isAI ? "⚡ CITYPULSE COGNITIVE" : "👤 USER CONTEXT"}</span>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 flex items-center gap-3">
              <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
              <span className="text-[10px] font-mono text-slate-400">Synthesizing spatial intelligence...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Chat Form panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitPrompt(inputText);
        }}
        className="flex gap-2.5 items-center border-t border-slate-900 pt-3"
      >
        <button
          type="button"
          onClick={handleToggleListen}
          id="trigger-voice-assistant"
          className={`p-3 border rounded-xl transition-all cursor-pointer ${
            isListening
              ? "border-rose-500 bg-rose-950/30 text-rose-400 animate-pulse"
              : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
          }`}
          title="Speak into Gemini Assistant"
        >
          {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening, speak clearly..." : "Ask Gemini about accident hotspots, gridlock reasons..."}
          className="flex-1 bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
        />

        <button
          type="submit"
          id="send-chat-btn"
          className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
