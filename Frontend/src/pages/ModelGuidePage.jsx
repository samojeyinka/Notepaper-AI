import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../components/user/Sidebar';
import { useAIKeys, openAIKeyModal } from '../hooks/useAIKeys';
import { PROVIDERS } from '../api/aiKeysService';

// Static mirror of Backend/config/ai_models.php so the guide renders instantly.
const FALLBACK_PRESETS = {
    gemini: {
        label: 'Google Gemini',
        tagline: 'Great all-rounder (strong free tier via Google AI Studio).',
        default_model: 'gemini-3-flash-preview',
        models: [
            { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: 'Cheapest option (best for bulk generation and simple tasks).', kind: 'fast' },
            { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Very low cost, quick drafts and short summaries.', kind: 'fast' },
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Best balance of speed and quality for study material.', kind: 'balanced' },
            { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', desc: 'Fast, cheap, great for everyday note generation.', kind: 'balanced' },
            { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', desc: 'Deepest reasoning for long, complex study material.', kind: 'smart' },
        ],
    },
    deepseek: {
        label: 'DeepSeek',
        tagline: 'Top value for money (very low cost, strong reasoning).',
        default_model: 'deepseek-chat',
        models: [
            { id: 'deepseek-chat', label: 'DeepSeek Chat', desc: 'Fast and inexpensive (perfect for bulk generation).', kind: 'balanced' },
            { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', desc: 'Advanced chain-of-thought reasoning for hard problems.', kind: 'smart' },
        ],
    },
    openai: {
        label: 'OpenAI',
        tagline: 'Reliable and widely available (broad model choice).',
        default_model: 'gpt-5.4',
        models: [
            { id: 'gpt-5.4-nano', label: 'GPT-5.4 Nano', desc: 'Cheapest tier for short, simple tasks.', kind: 'fast' },
            { id: 'gpt-5.4', label: 'GPT-5.4', desc: 'The everyday workhorse for notes and summaries.', kind: 'balanced' },
            { id: 'gpt-5.4-pro', label: 'GPT-5.4 Pro', desc: 'Most capable OpenAI model for complex reasoning.', kind: 'smart' },
        ],
    },
    claude: {
        label: 'Anthropic Claude',
        tagline: 'Excellent prose and long-context understanding.',
        default_model: 'claude-sonnet-4-6',
        models: [
            { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', desc: 'Fast and affordable for high-volume tasks.', kind: 'fast' },
            { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: 'Smart balance (great for study plans and essays).', kind: 'balanced' },
            { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', desc: 'Top-tier reasoning and writing quality.', kind: 'smart' },
        ],
    },
};

const KIND_BADGE = {
    fast: 'bg-emerald-100 text-emerald-700',
    balanced: 'bg-plum-100 text-plum-700',
    smart: 'bg-stone-900 text-white',
};

const KIND_LABEL = { fast: 'Fastest', balanced: 'Balanced', smart: 'Smartest' };

const ModelCard = ({ model, isDefault }) => (
    <div className="flex flex-col gap-1 p-4 border border-stone-200 bg-white hover:border-plum-300 hover:shadow-sm transition-all">
        <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-stone-800">{model.label}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${KIND_BADGE[model.kind] ?? 'bg-stone-100 text-stone-600'}`}>
                {KIND_LABEL[model.kind] ?? model.kind}
            </span>
        </div>
        <p className="text-[12px] text-stone-500 leading-relaxed">{model.desc}</p>
        <p className="text-[11px] font-mono text-stone-400">{model.id}</p>
        {isDefault && (
            <span className="self-start mt-1 text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white px-1.5 py-0.5">
                Recommended
            </span>
        )}
    </div>
);

const ProviderPanel = ({ presets, providerId }) => {
    const info = PROVIDERS.find((p) => p.id === providerId);
    const preset = presets[providerId];
    const [open, setOpen] = useState(false);

    return (
        <div className="group border border-stone-200 bg-paper overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 p-4 pb-2 text-left group-hover:bg-white transition-colors"
            >
                <div className="flex items-center gap-4 min-w-0">
                  
                    <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{preset.label ?? info.label}</p>
                        <p className="text-[12px] text-stone-500 mt-0.5 leading-snug">{preset.tagline ?? ''}</p>
                    </div>
                </div>
                <span className={`material-icons-round text-stone-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <div className="px-4 pb-4 flex items-center gap-1.5 text-[11px] text-stone-400 group-hover:bg-white transition-colors">
                Get a key at
                <a
                    href={info.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-plum-700 hover:text-plum-600 font-medium underline underline-offset-2"
                >
                    {info.site}
                    <span className="material-icons-round text-[12px]">open_in_new</span>
                </a>
            </div>

            {open && (
                <div className="px-4 py-4 pt-0 border-t border-stone-200 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {(preset?.models ?? []).map((m) => (
                            <ModelCard key={m.id} model={m} isDefault={m.id === preset?.default_model} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ModelGuidePage() {
    const { data, loaded, hasKeys } = useAIKeys();
    const presets = loaded && data?.presets ? data.presets : FALLBACK_PRESETS;

    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/model-guide" />

            <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pt-20 lg:pt-10 pb-32 min-w-0 overflow-x-hidden">
                <div className="max-w-3xl mx-auto">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-plum-700 mb-1.5">Model Guide</p>
                    <h1 className="font-display-serif text-[28px] md:text-[34px] font-semibold tracking-tight text-stone-900 leading-tight">
                        Choose your AI provider
                    </h1>
                    <p className="text-stone-500 text-[13px] md:text-sm mt-2 max-w-2xl leading-relaxed">
                        With bring-your-own-key, you connect your own provider and pay them directly, no subscription to Notepaper. All providers work with every AI feature; pick whichever fits your budget and needs.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={openAIKeyModal}
                            className="px-5 py-2.5 bg-stone-900 hover:bg-plum-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
                        >
                            <span className="material-icons-round text-[18px]">vpn_key</span>
                            {hasKeys ? 'Manage my keys' : 'Add my API key'}
                        </button>
                        {hasKeys && (
                            <Link
                                to="/lockedin/profile-settings"
                                className="text-sm font-medium text-plum-700 hover:text-plum-600 underline underline-offset-2"
                            >
                                Manage keys in settings
                            </Link>
                        )}
                    </div>

                    <div className="space-y-3 mt-8">
                        {Object.keys(FALLBACK_PRESETS).map((id) => (
                            <ProviderPanel key={id} presets={presets} providerId={id} />
                        ))}
                    </div>

               

            
                </div>
            </main>
        </div>
    );
}