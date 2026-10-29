import React from 'react';
import { GlassCard } from './GlassCard';
import { exportToJson } from '../lib/export';
import {
  X,
  FileCode2,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Download,
  GraduationCap,
  Sparkles,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface ModelCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelCardModal: React.FC<ModelCardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleExportJson = () => {
    const cardData = {
      model_name: "DistilBERT E-Commerce Sentiment Classifier",
      version: "2.0.0",
      architecture: {
        base_model: "distilbert-base-uncased",
        layers: 6,
        hidden_dimensions: 768,
        attention_heads: 12,
        parameter_count: "66,362,883 (approx 66M)",
        compression_ratio: "40% smaller than BERT-base, 60% faster inference"
      },
      training_specification: {
        dataset: "Amazon Customer Reviews (Home & Kitchen Balanced)",
        class_balance: "5,000 Negative (1-2★) / 5,000 Neutral (3★) / 5,000 Positive (4-5★)",
        split: "80% Train (12,000) / 20% Test (3,000)",
        epochs: 3,
        batch_size: 16,
        learning_rate: "2e-5 (AdamW)",
        weight_decay: 0.01,
        max_seq_length: 128
      },
      evaluation_metrics: {
        accuracy: 74.03,
        macro_f1: 74.11,
        macro_precision: 74.23,
        macro_recall: 74.03,
        per_class_f1: {
          positive: 85.16,
          negative: 72.52,
          neutral: 64.65
        },
        vs_logistic_regression: "+4.13% Accuracy / +4.03% Macro F1",
        vs_linear_svm: "+6.56% Accuracy / +6.57% Macro F1"
      },
      academic_context: {
        author: "Dhanashri Shinde",
        project: "Third-Year B.Tech Computer Engineering (Data Science)",
        mitigation_strategy: "Mitigates Amazon majority-class positive review skew via stratified balanced sampling."
      }
    };
    exportToJson("DistilBERT_Model_Card.json", cardData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <GlassCard className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col p-0 border border-white/15 shadow-2xl bg-[#080b14]/95 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-neon-violet/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-violet/20 border border-neon-violet/40 flex items-center justify-center text-neon-violet">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Academic Model Card</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-violet/20 text-violet-300 border border-neon-violet/30 font-semibold">
                  DistilBERT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mitchell et al. (2019) Model Reporting Standard for Machine Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors"
              title="Download Model Card JSON"
            >
              <Download className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-500">Architecture</div>
              <div className="text-sm font-bold text-white mt-0.5">DistilBERT-base</div>
              <div className="text-[10px] font-mono text-neon-violet">66M Parameters</div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-500">Test Accuracy</div>
              <div className="text-sm font-bold text-neon-lime mt-0.5">74.03%</div>
              <div className="text-[10px] font-mono text-slate-400">+4.13% vs LogReg</div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-500">Macro F1</div>
              <div className="text-sm font-bold text-neon-cyan mt-0.5">74.11%</div>
              <div className="text-[10px] font-mono text-slate-400">Positive F1: 85.16%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-500">Training Balance</div>
              <div className="text-sm font-bold text-white mt-0.5">15,000 Reviews</div>
              <div className="text-[10px] font-mono text-amber-300">1:1:1 Stratified</div>
            </div>
          </div>

          {/* Section 1: Model Details */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cpu className="w-4 h-4 text-neon-violet" />
              <span>1. Model Architecture & Compression</span>
            </div>
            <p>
              <strong>DistilBERT</strong> (Sanh et al., NeurIPS 2019) is a distilled version of BERT-base trained via knowledge distillation during pre-training. It retains <strong>97% of BERT’s natural language understanding</strong> capabilities while operating with <strong>40% fewer parameters</strong> (66M vs. 110M) and running <strong>60% faster</strong> on CPU and edge inference.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/[0.05] text-[11px] font-mono">
              <div><span className="text-slate-500">Transformer Layers:</span> 6</div>
              <div><span className="text-slate-500">Hidden Size:</span> 768</div>
              <div><span className="text-slate-500">Attention Heads:</span> 12</div>
            </div>
          </div>

          {/* Section 2: Dataset & Bias Mitigation */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Layers className="w-4 h-4 text-neon-cyan" />
              <span>2. Dataset Specifications & Class Bias Mitigation</span>
            </div>
            <p>
              Raw Amazon e-commerce reviews inherently suffer from extreme majority-class bias (~70% 5-star ratings). A model trained on raw distributions achieves high nominal accuracy simply by predicting positive, rendering it blind to product defects.
            </p>
            <p>
              To eliminate this bias, stratified downsampling created a strictly balanced dataset of <strong>15,000 reviews</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Negative (1★ & 2★):</strong> 5,000 reviews</li>
              <li><strong>Neutral (3★):</strong> 5,000 reviews</li>
              <li><strong>Positive (4★ & 5★):</strong> 5,000 reviews</li>
            </ul>
            <p className="text-[11px] text-slate-400 mt-1">
              Data split: 80% train (12,000 reviews) and 20% test (3,000 reviews; 1,000 per class held out).
            </p>
          </div>

          {/* Section 3: Training Hyperparameters */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <BookOpen className="w-4 h-4 text-neon-lime" />
              <span>3. Fine-Tuning Hyperparameters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-300">
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Optimizer</div>
                <div className="font-bold text-white">AdamW</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Learning Rate</div>
                <div className="font-bold text-white">2e-5</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Batch Size</div>
                <div className="font-bold text-white">16</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Max Sequence Length</div>
                <div className="font-bold text-white">128 tokens</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Epochs</div>
                <div className="font-bold text-white">3</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Weight Decay</div>
                <div className="font-bold text-white">0.01</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Warmup Ratio</div>
                <div className="font-bold text-white">0.1 (Linear)</div>
              </div>
              <div className="p-2 rounded bg-black/30 border border-white/5">
                <div className="text-slate-500">Loss Function</div>
                <div className="font-bold text-white">Cross-Entropy</div>
              </div>
            </div>
          </div>

          {/* Section 4: Academic Findings & Neutral Challenge */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>4. Academic Findings & The Neutral Ambiguity Phenomenon</span>
            </div>
            <p>
              1. <strong>Superiority on Negations & Sarcasm:</strong> DistilBERT captures long-range clause dependencies (e.g., <em>"not bad at all"</em>, <em>"great if you like broken glass"</em>) where n-gram TF-IDF Bag-of-Words fails due to isolated word frequency counts.
            </p>
            <p>
              2. <strong>The Neutral Ambiguity Challenge:</strong> Across all tested models, 3-star neutral reviews exhibited lower F1 scores (DistilBERT: 64.65%, LogReg: 62.45%, SVM: 58.22%). Customer 3-star reviews frequently combine equal parts praise and complaint (e.g. <em>"Great design but stopped working after a week"</em>), creating semantic tension that mirrors human annotator ambiguity.
            </p>
          </div>

          {/* Section 5: Ethical Considerations & Limitations */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-neon-red" />
              <span>5. Limitations & Responsible AI Guidelines</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Domain Adaptation:</strong> Fine-tuned primarily on Home & Kitchen e-commerce text. Highly technical or medical hardware reviews may require target-domain vocabulary adaptation.</li>
              <li><strong>Length Truncation:</strong> Inputs exceeding 128 tokens are truncated; long reviews may have late-paragraph sentiments masked.</li>
              <li><strong>Non-Generative:</strong> Classification only; the model does not generate synthetic responses, mitigating hallucination risks.</li>
            </ul>
          </div>

          {/* Academic Footer */}
          <div className="p-3 rounded-lg bg-neon-violet/10 border border-neon-violet/25 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-neon-violet" />
              <span className="font-medium text-slate-200">
                Third-Year B.Tech Computer Engineering (Data Science) Project
              </span>
            </div>
            <span className="font-mono text-violet-300 text-[11px]">
              Dhanashri Shinde
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

