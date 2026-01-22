import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Brain,
  Eye,
  Table,
  MessageSquare,
  Download,
  Zap,
  Shield,
  Clock,
  Layers,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Code,
  Database,
  Cloud,
  Cpu,
  Monitor,
  GitBranch,
  Box,
  Sparkles,
  Users,
  Server,
  HardDrive,
  Network,
  Lock,
  BarChart3,
  Workflow,
  Bot,
  Search,
  RefreshCw,
  ChevronRight,
  CircleDot,
  Boxes,
  Container,
  Globe,
  Key,
  Activity,
  Gauge,
  FileSearch,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}> = ({ icon, title, subtitle, color }) => (
  <div className="flex items-center gap-3 mb-8">
    <div className={`${color} p-2.5 rounded-xl`}>
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// Live Badge Component
const LiveBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${className}`}>
    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
    LIVE
  </div>
);

const FlowArrow: React.FC<{ direction?: 'right' | 'down'; animated?: boolean }> = ({
  direction = 'right',
  animated = true
}) => (
  <div className={`flex items-center justify-center ${direction === 'down' ? 'py-2' : 'px-2'}`}>
    <div className={`${animated ? 'animate-pulse' : ''} text-indigo-400`}>
      {direction === 'right' ? (
        <ChevronRight className="w-6 h-6" />
      ) : (
        <ArrowDown className="w-6 h-6" />
      )}
    </div>
  </div>
);

const NodeBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, title, subtitle, color, isActive, onClick, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5'
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${isActive
          ? `${color} border-current shadow-lg scale-105`
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      <div className={`${isActive ? 'text-white' : 'text-slate-600'} mb-2`}>
        {icon}
      </div>
      <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>
        {title}
      </div>
      {subtitle && (
        <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CURRENT ARCHITECTURE SECTION
// ============================================================================

const CurrentArchitecture: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const steps = [
    { icon: <FileText className="w-6 h-6" />, title: 'PDF Upload', desc: 'Drag & drop with validation' },
    { icon: <Brain className="w-6 h-6" />, title: 'Gemini AI', desc: 'Structured extraction' },
    { icon: <Eye className="w-6 h-6" />, title: 'Tesseract OCR', desc: 'Word coordinates' },
    { icon: <GitBranch className="w-6 h-6" />, title: 'Data Merge', desc: 'Field mapping' },
    { icon: <Monitor className="w-6 h-6" />, title: 'Interactive UI', desc: 'Split view + chat' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Box className="w-6 h-6 text-blue-600" />}
        title="Current Demo Architecture"
        subtitle="Client-side processing with Gemini AI"
        color="bg-blue-100"
      />

      {/* Simple Flow Diagram */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white/60 text-sm">Processing Pipeline</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className={`flex-1 p-4 rounded-xl transition-all duration-500 cursor-pointer ${
                  activeStep === index
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => { setActiveStep(index); setIsPlaying(false); }}
              >
                <div className={`mb-2 ${activeStep === index ? 'text-white' : 'text-white/60'}`}>
                  {step.icon}
                </div>
                <div className={`text-sm font-medium ${activeStep === index ? 'text-white' : 'text-white/80'}`}>
                  {step.title}
                </div>
                <div className={`text-xs ${activeStep === index ? 'text-white/80' : 'text-white/50'}`}>
                  {step.desc}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`transition-all duration-300 ${activeStep === index ? 'text-indigo-400' : 'text-white/30'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tech Stack */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'React 19', icon: <Box className="w-5 h-5" />, color: 'bg-blue-500' },
          { name: 'Gemini AI', icon: <Brain className="w-5 h-5" />, color: 'bg-purple-500' },
          { name: 'Tesseract.js', icon: <Eye className="w-5 h-5" />, color: 'bg-green-500' },
          { name: 'Client-Side', icon: <Monitor className="w-5 h-5" />, color: 'bg-orange-500' },
        ].map((tech, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
            <div className={`${tech.color} p-2 rounded-lg text-white`}>{tech.icon}</div>
            <span className="font-medium text-slate-700">{tech.name}</span>
          </div>
        ))}
      </div>

      {/* Limitations */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Current Limitations
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Single user only',
            'No data persistence',
            'Single LLM provider',
            'Basic OCR only',
            'No authentication',
            'Limited scalability',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-amber-700">
              <XCircle className="w-4 h-4 text-amber-500" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROPOSED ARCHITECTURE - SYSTEM OVERVIEW
// ============================================================================

const ProposedOverview: React.FC = () => {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Sparkles className="w-6 h-6 text-purple-600" />}
        title="Enterprise Architecture Overview"
        subtitle="Scalable, multi-tenant system with agentic processing"
        color="bg-purple-100"
      />

      {/* High Level Architecture Diagram */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-2xl p-8 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative space-y-6">
          {/* Client Layer */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-xs text-white/60 mb-3 uppercase tracking-wider">Client Layer</div>
            <div className="flex justify-center gap-4">
              {[
                { icon: <Monitor className="w-5 h-5" />, label: 'Web App', live: true },
                { icon: <Globe className="w-5 h-5" />, label: 'Mobile', live: false },
                { icon: <Code className="w-5 h-5" />, label: 'API', live: false },
                { icon: <Workflow className="w-5 h-5" />, label: 'Webhooks', live: false },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 relative ${item.live ? 'text-white' : 'text-white/50'}`}>
                  {item.live && <LiveBadge className="absolute -top-2 -right-2" />}
                  <div className={item.live ? 'ring-2 ring-green-400 rounded-lg p-1.5' : 'p-1.5'}>
                    {item.icon}
                  </div>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* API Gateway */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur rounded-xl p-4 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Network className="w-6 h-6 text-indigo-400" />
                <div>
                  <div className="text-white font-medium">API Gateway</div>
                  <div className="text-white/60 text-xs">Kong / AWS API Gateway</div>
                </div>
              </div>
              <div className="flex gap-6 text-xs text-white/60">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Auth</span>
                <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> Rate Limit</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Load Balance</span>
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Microservices */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { icon: <Key className="w-5 h-5" />, name: 'Auth', color: 'from-blue-500 to-blue-600', live: false },
              { icon: <FileText className="w-5 h-5" />, name: 'Document', color: 'from-green-500 to-green-600', live: true },
              { icon: <Cpu className="w-5 h-5" />, name: 'Extraction', color: 'from-purple-500 to-purple-600', live: true },
              { icon: <MessageSquare className="w-5 h-5" />, name: 'Chat', color: 'from-pink-500 to-pink-600', live: true },
              { icon: <Download className="w-5 h-5" />, name: 'Export', color: 'from-orange-500 to-orange-600', live: true },
            ].map((svc, i) => (
              <div key={i} className={`relative rounded-xl p-3 text-center ${svc.live ? `bg-gradient-to-br ${svc.color} ring-2 ring-green-400` : 'bg-white/10'}`}>
                {svc.live && <LiveBadge className="absolute -top-1.5 -right-1.5" />}
                <div className={`mb-1 flex justify-center ${svc.live ? 'text-white' : 'text-white/50'}`}>{svc.icon}</div>
                <div className={`text-xs font-medium ${svc.live ? 'text-white' : 'text-white/50'}`}>{svc.name}</div>
              </div>
            ))}
          </div>

          <FlowArrow direction="down" />

          {/* Agent Layer */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur rounded-xl p-4 border border-purple-500/30">
            <div className="text-xs text-white/60 mb-3 uppercase tracking-wider">Agent Orchestration Layer</div>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Bot className="w-6 h-6 text-white/40 mx-auto mb-1" />
                <div className="text-xs text-white/50">Master Orchestrator</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
              <div className="flex gap-2">
                {[
                  { name: 'Classifier', live: false },
                  { name: 'OCR', live: true },
                  { name: 'Extractor', live: true },
                  { name: 'Validator', live: false },
                  { name: 'Formatter', live: true },
                  { name: 'Chat', live: true },
                ].map((agent, i) => (
                  <div key={i} className={`relative rounded-lg px-2 py-1.5 text-xs ${agent.live ? 'bg-green-500/30 text-white ring-1 ring-green-400' : 'bg-white/10 text-white/50'}`}>
                    {agent.live && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                    {agent.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Data Layer */}
          <div className="grid grid-cols-6 gap-3">
            {/* In-Memory - Currently Live */}
            <div className="relative bg-green-500/20 rounded-xl p-3 text-center ring-2 ring-green-400">
              <LiveBadge className="absolute -top-1.5 -right-1.5" />
              <div className="text-white mb-1 flex justify-center"><Monitor className="w-5 h-5" /></div>
              <div className="text-white text-xs font-medium">In-Memory</div>
              <div className="text-white/70 text-xs">Browser State</div>
            </div>
            {[
              { icon: <Database className="w-5 h-5" />, name: 'PostgreSQL', desc: 'Structured' },
              { icon: <Boxes className="w-5 h-5" />, name: 'MongoDB', desc: 'Documents' },
              { icon: <Search className="w-5 h-5" />, name: 'Vector DB', desc: 'Embeddings' },
              { icon: <Zap className="w-5 h-5" />, name: 'Redis', desc: 'Cache' },
              { icon: <HardDrive className="w-5 h-5" />, name: 'S3', desc: 'Files' },
            ].map((db, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-white/50 mb-1 flex justify-center">{db.icon}</div>
                <div className="text-white/50 text-xs font-medium">{db.name}</div>
                <div className="text-white/30 text-xs">{db.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Users className="w-6 h-6" />, title: 'Multi-Tenant', desc: 'Isolated data per organization', color: 'bg-blue-500' },
          { icon: <TrendingUp className="w-6 h-6" />, title: 'Auto-Scale', desc: 'Handle any load dynamically', color: 'bg-green-500' },
          { icon: <Shield className="w-6 h-6" />, title: 'Enterprise Security', desc: 'SOC2, encryption, audit logs', color: 'bg-purple-500' },
        ].map((benefit, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`${benefit.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3`}>
              {benefit.icon}
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{benefit.title}</h4>
            <p className="text-sm text-slate-500">{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HYBRID OCR PIPELINE
// ============================================================================

const HybridOCRPipeline: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<'traditional' | 'llm' | 'ensemble'>('traditional');

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Eye className="w-6 h-6 text-green-600" />}
        title="Hybrid OCR Pipeline"
        subtitle="Combining Traditional ML with LLM Vision for maximum accuracy"
        color="bg-green-100"
      />

      {/* OCR Architecture */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8">
        <div className="space-y-6">
          {/* Input */}
          <div className="flex justify-center">
            <div className="bg-white/10 rounded-xl px-6 py-3 flex items-center gap-3">
              <FileText className="w-5 h-5 text-white/80" />
              <span className="text-white font-medium">PDF Input</span>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Pre-processor */}
          <div className="bg-white/5 rounded-xl p-4 max-w-md mx-auto">
            <div className="text-center text-white/80 text-sm font-medium mb-2">Pre-Processor</div>
            <div className="flex justify-center gap-4 text-xs text-white/60">
              <span>Deskewing</span>
              <span>Noise Removal</span>
              <span>Binarization</span>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Three Tracks */}
          <div className="grid grid-cols-3 gap-4">
            {/* Traditional ML */}
            <div
              className={`relative rounded-xl p-4 cursor-pointer transition-all ring-2 ring-green-400 ${
                activeTrack === 'traditional'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-green-500/20 hover:bg-green-500/30'
              }`}
              onClick={() => setActiveTrack('traditional')}
            >
              <LiveBadge className="absolute -top-2 -right-2" />
              <div className="text-center mb-3">
                <Cpu className={`w-8 h-8 mx-auto ${activeTrack === 'traditional' ? 'text-white' : 'text-blue-400'}`} />
              </div>
              <div className={`text-center font-semibold mb-2 ${activeTrack === 'traditional' ? 'text-white' : 'text-white'}`}>
                Traditional ML OCR
              </div>
              <div className={`space-y-1.5 text-xs ${activeTrack === 'traditional' ? 'text-white/90' : 'text-white/80'}`}>
                <div className="bg-green-500/40 rounded px-2 py-1 ring-1 ring-green-400 font-medium">Tesseract.js (Live)</div>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">AWS Textract (Tables)</div>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">Google Vision (Handwriting)</div>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">Azure Doc AI</div>
              </div>
            </div>

            {/* LLM Vision */}
            <div
              className={`relative rounded-xl p-4 cursor-pointer transition-all ring-2 ring-green-400 ${
                activeTrack === 'llm'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                  : 'bg-green-500/20 hover:bg-green-500/30'
              }`}
              onClick={() => setActiveTrack('llm')}
            >
              <LiveBadge className="absolute -top-2 -right-2" />
              <div className="text-center mb-3">
                <Brain className={`w-8 h-8 mx-auto ${activeTrack === 'llm' ? 'text-white' : 'text-purple-400'}`} />
              </div>
              <div className={`text-center font-semibold mb-2 ${activeTrack === 'llm' ? 'text-white' : 'text-white'}`}>
                LLM Vision OCR
              </div>
              <div className={`space-y-1.5 text-xs ${activeTrack === 'llm' ? 'text-white/90' : 'text-white/80'}`}>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">GPT-4 Vision (Best Quality)</div>
                <div className="bg-green-500/40 rounded px-2 py-1 ring-1 ring-green-400 font-medium">Gemini Flash (Live)</div>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">Claude Vision (Context)</div>
                <div className="bg-white/10 rounded px-2 py-1 opacity-60">Qwen-VL (Open Source)</div>
              </div>
            </div>

            {/* Specialized */}
            <div
              className={`rounded-xl p-4 cursor-pointer transition-all ${
                activeTrack === 'ensemble'
                  ? 'bg-white/20 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setActiveTrack('ensemble')}
            >
              <div className="text-center mb-3">
                <Table className="w-8 h-8 mx-auto text-white/40" />
              </div>
              <div className="text-center font-semibold mb-2 text-white/50">
                Specialized Extractors
              </div>
              <div className="space-y-1.5 text-xs text-white/40">
                <div className="bg-white/10 rounded px-2 py-1">Camelot (PDF Tables)</div>
                <div className="bg-white/10 rounded px-2 py-1">Tabula (Structure)</div>
                <div className="bg-white/10 rounded px-2 py-1">Custom CNN (Layout)</div>
                <div className="bg-white/10 rounded px-2 py-1">Form Recognizer</div>
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Ensemble Fusion */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GitBranch className="w-6 h-6 text-white/40" />
              <span className="text-white/50 font-semibold">Ensemble Fusion Engine</span>
              <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded">PROPOSED</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { title: 'Confidence Voting', desc: 'Weight by accuracy' },
                { title: 'Cross-Validation', desc: 'Compare outputs' },
                { title: 'Context Verify', desc: 'LLM validates ML' },
                { title: 'Smart Fallback', desc: 'Escalate if unsure' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/40 text-xs font-medium">{item.title}</div>
                  <div className="text-white/30 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">OCR Selection Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-600 font-medium">Scenario</th>
                <th className="px-4 py-3 text-left text-slate-600 font-medium">Primary</th>
                <th className="px-4 py-3 text-left text-slate-600 font-medium">Fallback</th>
                <th className="px-4 py-3 text-left text-slate-600 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { scenario: 'Clear printed text', primary: 'Tesseract', fallback: '-', reason: 'Fast, free, accurate' },
                { scenario: 'Tables with structure', primary: 'AWS Textract', fallback: 'Camelot', reason: 'Table detection' },
                { scenario: 'Handwritten notes', primary: 'Google Vision', fallback: 'GPT-4V', reason: 'Handwriting specialty' },
                { scenario: 'Complex layouts', primary: 'GPT-4V', fallback: 'Claude', reason: 'Contextual understanding' },
                { scenario: 'Low quality scans', primary: 'Gemini Vision', fallback: 'Tesseract+', reason: 'Multi-modal strength' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{row.scenario}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{row.primary}</span></td>
                  <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{row.fallback}</span></td>
                  <td className="px-4 py-3 text-slate-500">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AGENTIC SYSTEM
// ============================================================================

const AgenticSystem: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>('orchestrator');

  const agents = {
    orchestrator: {
      name: 'Master Orchestrator',
      role: 'Routes tasks, manages state, handles errors, coordinates flow',
      tools: ['Task Router', 'State Manager', 'Error Handler', 'Flow Controller'],
      color: 'from-purple-500 to-purple-600',
      live: false
    },
    classifier: {
      name: 'Classifier Agent',
      role: 'Identifies document type and selects appropriate processing template',
      tools: ['Doc Classifier', 'Layout Analyzer', 'Template Matcher'],
      color: 'from-blue-500 to-blue-600',
      live: false
    },
    ocr: {
      name: 'OCR Agent',
      role: 'Extracts text with coordinates using Tesseract.js (client-side)',
      tools: ['Tesseract.js'],
      color: 'from-green-500 to-green-600',
      live: true,
      liveTools: ['Tesseract.js']
    },
    extractor: {
      name: 'Extraction Agent',
      role: 'Extracts structured data using Gemini AI with schema-guided prompting',
      tools: ['Gemini Flash'],
      color: 'from-orange-500 to-orange-600',
      live: true,
      liveTools: ['Gemini Flash']
    },
    validator: {
      name: 'Validator Agent',
      role: 'Verifies data accuracy and completeness against business rules',
      tools: ['Schema Validator', 'Math Checker', 'Cross-Reference', 'Business Rules'],
      color: 'from-red-500 to-red-600',
      live: false
    },
    formatter: {
      name: 'Formatter Agent',
      role: 'Transforms data to JSON, CSV, and Excel formats',
      tools: ['JSON Export', 'CSV Export', 'Excel Export'],
      color: 'from-cyan-500 to-cyan-600',
      live: true,
      liveTools: ['JSON Export', 'CSV Export', 'Excel Export']
    },
    chat: {
      name: 'Chat Agent',
      role: 'Answers user questions about the extracted bid data',
      tools: ['Gemini Chat', 'Context Window'],
      color: 'from-pink-500 to-pink-600',
      live: true,
      liveTools: ['Gemini Chat']
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Bot className="w-6 h-6 text-purple-600" />}
        title="Agentic Processing System"
        subtitle="Specialized AI agents working together (LangGraph / CrewAI)"
        color="bg-purple-100"
      />

      {/* Agent Flow */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          {/* Document Input */}
          <div className="bg-white/10 rounded-xl px-6 py-3 flex items-center gap-3">
            <FileText className="w-5 h-5 text-white/80" />
            <span className="text-white font-medium">Document Input</span>
          </div>

          <FlowArrow direction="down" />

          {/* Orchestrator */}
          <div
            onClick={() => setSelectedAgent('orchestrator')}
            className={`w-full max-w-md cursor-pointer transition-all rounded-xl p-4 border-2 ${
              selectedAgent === 'orchestrator'
                ? 'bg-white/20 border-white/30 shadow-lg'
                : 'bg-white/5 border-transparent hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Bot className="w-8 h-8 text-white/40" />
              <div>
                <div className="font-semibold text-white/50">
                  Master Orchestrator Agent
                </div>
                <div className="text-xs text-white/40">
                  LangGraph / CrewAI / AutoGen (Proposed)
                </div>
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Agent Grid */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {['classifier', 'ocr', 'extractor'].map((agentKey) => {
              const agent = agents[agentKey as keyof typeof agents];
              return (
                <div
                  key={agentKey}
                  onClick={() => setSelectedAgent(agentKey)}
                  className={`relative cursor-pointer transition-all rounded-xl p-4 ${
                    agent.live
                      ? selectedAgent === agentKey
                        ? `bg-gradient-to-br ${agent.color} shadow-lg ring-2 ring-green-400`
                        : 'bg-green-500/20 hover:bg-green-500/30 ring-1 ring-green-400/50'
                      : selectedAgent === agentKey
                        ? 'bg-white/20 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {agent.live && <LiveBadge className="absolute -top-1.5 -right-1.5" />}
                  <div className={`text-center font-medium text-sm ${agent.live ? 'text-white' : 'text-white/50'}`}>
                    {agent.name}
                  </div>
                </div>
              );
            })}
          </div>

          <FlowArrow direction="down" />

          <div className="grid grid-cols-3 gap-3 w-full">
            {['validator', 'formatter', 'chat'].map((agentKey) => {
              const agent = agents[agentKey as keyof typeof agents];
              return (
                <div
                  key={agentKey}
                  onClick={() => setSelectedAgent(agentKey)}
                  className={`relative cursor-pointer transition-all rounded-xl p-4 ${
                    agent.live
                      ? selectedAgent === agentKey
                        ? `bg-gradient-to-br ${agent.color} shadow-lg ring-2 ring-green-400`
                        : 'bg-green-500/20 hover:bg-green-500/30 ring-1 ring-green-400/50'
                      : selectedAgent === agentKey
                        ? 'bg-white/20 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {agent.live && <LiveBadge className="absolute -top-1.5 -right-1.5" />}
                  <div className={`text-center font-medium text-sm ${agent.live ? 'text-white' : 'text-white/50'}`}>
                    {agent.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Details */}
      {selectedAgent && (
        <div className={`rounded-xl border p-6 ${agents[selectedAgent as keyof typeof agents].live ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${agents[selectedAgent as keyof typeof agents].live ? `bg-gradient-to-br ${agents[selectedAgent as keyof typeof agents].color}` : 'bg-slate-200'} text-white`}>
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {agents[selectedAgent as keyof typeof agents].name}
                </h3>
                {agents[selectedAgent as keyof typeof agents].live && (
                  <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE IN DEMO
                  </span>
                )}
                {!agents[selectedAgent as keyof typeof agents].live && (
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">PROPOSED</span>
                )}
              </div>
              <p className="text-slate-600 mt-1">
                {agents[selectedAgent as keyof typeof agents].role}
              </p>
              <div className="mt-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  {agents[selectedAgent as keyof typeof agents].live ? 'Active Tools' : 'Planned Tools'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {agents[selectedAgent as keyof typeof agents].tools.map((tool, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-sm ${agents[selectedAgent as keyof typeof agents].live ? 'bg-green-100 text-green-800 font-medium' : 'bg-slate-100 text-slate-500'}`}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Communication */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-slate-600" />
          Agent Message Protocol
        </h3>
        <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto font-mono">
{`{
  "message_id": "uuid-v4",
  "from_agent": "classifier_agent",
  "to_agent": "extraction_agent",
  "task_id": "doc-123-task-456",
  "action": "extract_structured_data",
  "payload": {
    "document_id": "doc-123",
    "doc_type": "vendor_bid",
    "template": "industrial_equipment",
    "ocr_result": { /* ... */ },
    "confidence": 0.95
  },
  "metadata": {
    "timestamp": "2024-01-22T10:30:00Z",
    "priority": "high",
    "retry_count": 0
  }
}`}
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// DATA LAYER
// ============================================================================

const DataLayerArchitecture: React.FC = () => {
  const [activeDb, setActiveDb] = useState('postgresql');

  const databases = {
    postgresql: {
      name: 'PostgreSQL',
      purpose: 'Primary relational database for structured data',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-blue-500',
      tables: ['users', 'organizations', 'documents', 'extractions', 'line_items', 'chat_sessions', 'audit_logs']
    },
    mongodb: {
      name: 'MongoDB',
      purpose: 'Flexible document store for raw OCR results and LLM responses',
      icon: <Boxes className="w-6 h-6" />,
      color: 'bg-green-500',
      tables: ['raw_extractions', 'ocr_results', 'llm_responses', 'processing_logs']
    },
    vector: {
      name: 'Vector DB',
      purpose: 'Semantic search over extracted data for RAG',
      icon: <Search className="w-6 h-6" />,
      color: 'bg-purple-500',
      tables: ['document_embeddings', 'line_item_embeddings', 'chat_embeddings']
    },
    redis: {
      name: 'Redis',
      purpose: 'Caching, sessions, rate limiting, job queues',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-red-500',
      tables: ['session:*', 'cache:extraction:*', 'rate_limit:*', 'job:status:*']
    },
    s3: {
      name: 'S3 / Blob Storage',
      purpose: 'Original PDFs, rendered pages, exports',
      icon: <HardDrive className="w-6 h-6" />,
      color: 'bg-orange-500',
      tables: ['/uploads/{org}/{doc}.pdf', '/processed/{doc}/pages/', '/exports/{user}/', '/thumbnails/']
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Database className="w-6 h-6 text-blue-600" />}
        title="Data Persistence Layer"
        subtitle="Multi-database architecture for different data patterns"
        color="bg-blue-100"
      />

      {/* Database Selection */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {Object.entries(databases).map(([key, db]) => (
          <button
            key={key}
            onClick={() => setActiveDb(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeDb === key
                ? `${db.color} text-white shadow-md`
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            {db.icon}
            <span className="font-medium text-sm">{db.name}</span>
          </button>
        ))}
      </div>

      {/* Database Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${databases[activeDb as keyof typeof databases].color} text-white`}>
            {databases[activeDb as keyof typeof databases].icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {databases[activeDb as keyof typeof databases].name}
            </h3>
            <p className="text-slate-600">
              {databases[activeDb as keyof typeof databases].purpose}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {databases[activeDb as keyof typeof databases].tables.map((table, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <code className="text-sm text-slate-700">{table}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Schema Example */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl p-5">
          <div className="text-xs text-slate-400 mb-3 uppercase tracking-wider">PostgreSQL Schema</div>
          <pre className="text-green-400 text-xs font-mono overflow-x-auto">
{`CREATE TABLE extractions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  vendor_name VARCHAR(255),
  quote_id VARCHAR(100),
  quote_date DATE,
  grand_total DECIMAL(15,2),
  currency VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE line_items (
  id UUID PRIMARY KEY,
  extraction_id UUID REFERENCES extractions(id),
  line_number INTEGER,
  tag VARCHAR(100),
  description TEXT,
  unit_price DECIMAL(15,2),
  quantity INTEGER,
  line_total DECIMAL(15,2),
  bbox_data JSONB  -- Coordinates
);`}
          </pre>
        </div>

        <div className="bg-slate-900 rounded-xl p-5">
          <div className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Vector DB Schema</div>
          <pre className="text-purple-400 text-xs font-mono overflow-x-auto">
{`{
  "index": "document_embeddings",
  "vectors": {
    "id": "doc_uuid_chunk_0",
    "values": [0.123, -0.456, ...],
    "metadata": {
      "document_id": "uuid",
      "chunk_text": "TK-8424...",
      "page_number": 1,
      "line_item_id": 1,
      "vendor_name": "Industrial..."
    }
  }
}

// Use cases:
// - "Find all break tanks" → semantic
// - "Similar to TK-8424" → vector
// - Chat context → RAG retrieval`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RAG CHAT SYSTEM
// ============================================================================

const RAGChatSystem: React.FC = () => {
  const [queryType, setQueryType] = useState<'factual' | 'analytical' | 'comparison'>('analytical');

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<MessageSquare className="w-6 h-6 text-pink-600" />}
        title="RAG-Powered Chat System"
        subtitle="Contextual AI assistant with document understanding"
        color="bg-pink-100"
      />

      {/* Live Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-green-800">Chat is Live!</span>
        </div>
        <span className="text-green-700 text-sm">
          Basic chat using Gemini with context window. Full RAG with vector search is proposed for enterprise scale.
        </span>
      </div>

      {/* Query Type Selection */}
      <div className="flex gap-4">
        {[
          { key: 'factual', label: 'Factual Query', example: '"What is the quote date?"', icon: <FileSearch className="w-5 h-5" /> },
          { key: 'analytical', label: 'Analytical Query', example: '"Items over $100K?"', icon: <BarChart3 className="w-5 h-5" /> },
          { key: 'comparison', label: 'Comparison Query', example: '"Compare vendors A vs B"', icon: <GitBranch className="w-5 h-5" /> },
        ].map((type) => (
          <button
            key={type.key}
            onClick={() => setQueryType(type.key as typeof queryType)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              queryType === type.key
                ? 'bg-pink-50 border-pink-300 shadow-md'
                : 'bg-white border-slate-200 hover:border-pink-200'
            }`}
          >
            <div className={`mb-2 ${queryType === type.key ? 'text-pink-600' : 'text-slate-400'}`}>
              {type.icon}
            </div>
            <div className={`font-medium ${queryType === type.key ? 'text-pink-900' : 'text-slate-700'}`}>
              {type.label}
            </div>
            <div className={`text-xs mt-1 ${queryType === type.key ? 'text-pink-600' : 'text-slate-500'}`}>
              {type.example}
            </div>
          </button>
        ))}
      </div>

      {/* RAG Flow */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8">
        <div className="space-y-4">
          {/* User Query */}
          <div className="flex justify-center">
            <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl px-6 py-3">
              <span className="text-pink-300 text-sm">User Query</span>
              <div className="text-white font-medium mt-1">
                {queryType === 'factual' && '"What is the quote date?"'}
                {queryType === 'analytical' && '"Which items cost more than $100,000?"'}
                {queryType === 'comparison' && '"Compare this bid with the previous vendor"'}
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Query Analyzer */}
          <div className="bg-white/10 rounded-xl p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Query Analyzer Agent</span>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-white/60">
              <span>Intent Detection</span>
              <span>Entity Extraction</span>
              <span>Query Classification</span>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Processing Path */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 transition-all ${
              queryType === 'factual' ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/5'
            }`}>
              <Database className={`w-6 h-6 mx-auto mb-2 ${queryType === 'factual' ? 'text-blue-400' : 'text-white/40'}`} />
              <div className={`text-center text-sm ${queryType === 'factual' ? 'text-white' : 'text-white/50'}`}>
                Direct SQL Lookup
              </div>
            </div>
            <div className={`rounded-xl p-4 transition-all ${
              queryType === 'analytical' ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-white/5'
            }`}>
              <Code className={`w-6 h-6 mx-auto mb-2 ${queryType === 'analytical' ? 'text-purple-400' : 'text-white/40'}`} />
              <div className={`text-center text-sm ${queryType === 'analytical' ? 'text-white' : 'text-white/50'}`}>
                LLM → SQL Generation
              </div>
            </div>
            <div className={`rounded-xl p-4 transition-all ${
              queryType === 'comparison' ? 'bg-green-500/30 border border-green-500/50' : 'bg-white/5'
            }`}>
              <Search className={`w-6 h-6 mx-auto mb-2 ${queryType === 'comparison' ? 'text-green-400' : 'text-white/40'}`} />
              <div className={`text-center text-sm ${queryType === 'comparison' ? 'text-white' : 'text-white/50'}`}>
                Multi-Doc RAG Retrieval
              </div>
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Context Builder */}
          <div className="bg-white/10 rounded-xl p-4 max-w-lg mx-auto">
            <div className="text-center text-white/80 font-medium mb-2">Context Builder</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {['Query Results', 'Relevant Chunks', 'Chat History', 'User Preferences'].map((item, i) => (
                <span key={i} className="bg-white/20 text-white/80 px-2 py-1 rounded text-xs">{item}</span>
              ))}
            </div>
          </div>

          <FlowArrow direction="down" />

          {/* Response */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-2">AI Response</div>
              <div className="bg-white/10 rounded-lg p-3 text-left">
                <pre className="text-green-400 text-xs font-mono">
{`{
  "answer": "The items over $100K are...",
  "line_items": [2, 3, 4],
  "confidence": 0.95,
  "sources": ["page_1", "page_2"]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAG Components */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <Search className="w-6 h-6" />, title: 'Vector Search', desc: 'Semantic similarity using embeddings', color: 'bg-purple-500' },
          { icon: <Database className="w-6 h-6" />, title: 'SQL Generation', desc: 'Natural language to SQL queries', color: 'bg-blue-500' },
          { icon: <Lightbulb className="w-6 h-6" />, title: 'Context Injection', desc: 'Relevant data in LLM prompt', color: 'bg-amber-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200">
            <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3`}>
              {item.icon}
            </div>
            <h4 className="font-semibold text-slate-800">{item.title}</h4>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TECHNOLOGY STACK
// ============================================================================

const TechnologyStack: React.FC = () => {
  const categories = [
    {
      name: 'Frontend (Live)',
      live: true,
      techs: [
        { name: 'React 19', desc: 'UI Framework', color: 'bg-blue-500', live: true },
        { name: 'TypeScript', desc: 'Type safety', color: 'bg-blue-600', live: true },
        { name: 'Tailwind CSS', desc: 'Styling', color: 'bg-cyan-500', live: true },
      ]
    },
    {
      name: 'AI & ML',
      live: false,
      techs: [
        { name: 'Gemini Flash', desc: 'LLM extraction & chat', color: 'bg-purple-500', live: true },
        { name: 'Tesseract.js', desc: 'Client-side OCR', color: 'bg-green-500', live: true },
        { name: 'LangGraph', desc: 'Agent orchestration', color: 'bg-pink-500', live: false },
      ]
    },
    {
      name: 'Data Storage',
      live: false,
      techs: [
        { name: 'Browser State', desc: 'In-memory storage', color: 'bg-green-500', live: true },
        { name: 'PostgreSQL', desc: 'Structured data', color: 'bg-blue-600', live: false },
        { name: 'Pinecone', desc: 'Vector search', color: 'bg-purple-600', live: false },
      ]
    },
    {
      name: 'Infrastructure',
      live: false,
      techs: [
        { name: 'Vite', desc: 'Build tool', color: 'bg-yellow-500', live: true },
        { name: 'Kubernetes', desc: 'Container orchestration', color: 'bg-blue-500', live: false },
        { name: 'AWS/GCP', desc: 'Cloud platform', color: 'bg-orange-500', live: false },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Code className="w-6 h-6 text-indigo-600" />}
        title="Technology Stack"
        subtitle="Production-ready technologies for enterprise deployment"
        color="bg-indigo-100"
      />

      <div className="grid grid-cols-2 gap-6">
        {categories.map((category, i) => (
          <div key={i} className={`rounded-xl border overflow-hidden ${category.live ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
            <div className={`px-5 py-3 border-b flex items-center justify-between ${category.live ? 'bg-green-100 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="font-semibold text-slate-800">{category.name}</h3>
              {category.live && <LiveBadge />}
            </div>
            <div className="p-4 space-y-3">
              {category.techs.map((tech, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${tech.live ? tech.color : 'bg-slate-300'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${tech.live ? 'text-slate-800' : 'text-slate-400'}`}>
                      {tech.name}
                      {tech.live && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Live</span>}
                    </div>
                    <div className={`text-xs ${tech.live ? 'text-slate-500' : 'text-slate-400'}`}>{tech.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ArchitectureDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'hybrid-ocr', label: 'Hybrid OCR', icon: <Eye className="w-4 h-4" /> },
    { id: 'agents', label: 'Agentic System', icon: <Bot className="w-4 h-4" /> },
    { id: 'data', label: 'Data Layer', icon: <Database className="w-4 h-4" /> },
    { id: 'chat', label: 'RAG Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'tech', label: 'Tech Stack', icon: <Code className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 px-8 py-6 shrink-0 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BidExtract Architecture</h1>
                <p className="text-indigo-200 text-sm">AI-Powered Document Intelligence Platform</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/90 text-sm font-medium">Currently Live</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/40 border border-dashed border-white/60" />
                <span className="text-white/70 text-sm">Proposed</span>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-white text-indigo-600 font-medium shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="flex-1 overflow-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-8 py-8">
          {activeSection === 'overview' && <ProposedOverview />}
          {activeSection === 'hybrid-ocr' && <HybridOCRPipeline />}
          {activeSection === 'agents' && <AgenticSystem />}
          {activeSection === 'data' && <DataLayerArchitecture />}
          {activeSection === 'chat' && <RAGChatSystem />}
          {activeSection === 'tech' && <TechnologyStack />}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 shrink-0 w-full">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Enterprise Ready</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Auto-Scaling</span>
            <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> SOC2 Compliant</span>
          </div>
          <div className="text-slate-400">
            Built with thoughtful engineering
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDemo;
