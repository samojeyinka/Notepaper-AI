import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAIKeys, subscribeAIKeyModal } from '../../hooks/useAIKeys';
import { PROVIDERS } from '../../api/aiKeysService';

const PROVIDER_ICONS = Object.fromEntries(PROVIDERS.map((p) => [p.id, p.icon]));

const MODEL_KIND_LABEL = { fast: 'fast', balanced: 'balanced', smart: 'smart' };

const ModelSelect = ({ presets, provider, value, onChange }) => {
    const models = presets?.[provider]?.models ?? [];
    const defaultId = presets?.[provider]?.default_model ?? models[0]?.id ?? '';
    const known = models.map((m) => m.id);

    // Never surface a stale/unknown id now that custom models are gone.
    const selected = value && known.includes(value) ? value : (defaultId || known[0] || '');

    if (models.length === 0) {
        return <p className="text-[12px] text-stone-400">This provider uses its own default model.</p>;
    }

    return (
        <select
            value={selected}
            onChange={(e) => onChange(e.target.value || null)}
            className="w-full px-3.5 py-2.5 border text-sm border-stone-200 bg-white focus:outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-100"
        >
            {models.map((m) => (
                <option key={m.id} value={m.id}>
                    {m.label} ({MODEL_KIND_LABEL[m.kind] ?? m.kind}
                    {m.id === defaultId ? ', default' : ''})
                </option>
            ))}
        </select>
    );
};

const KeyForm = ({ presets, initial, onSave, onCancel, isFirstKey }) => {
    const { verify } = useAIKeys();
    const [provider, setProvider] = useState(initial?.provider ?? 'gemini');
    const [key, setKey] = useState('');
    const [model, setModel] = useState(initial?.model ?? presets?.[initial?.provider ?? 'gemini']?.default_model ?? null);
    const [isDefault, setIsDefault] = useState(initial ? initial.is_default : isFirstKey);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const isEdit = !!initial;

    const switchProvider = (id) => {
        setProvider(id);
        if (!model || !(presets?.[id]?.models ?? []).some((m) => m.id === model)) {
            setModel(presets?.[id]?.default_model ?? presets?.[id]?.models?.[0]?.id ?? null);
        }
    };

    const runTest = async () => {
        setError(null);
        setSuccess(false);
        setTesting(true);
        try {
            const res = await verify({ provider, key, model });
            if (res?.data && res.data.provider) {
                setSuccess(true);
            } else {
                setError('Could not connect with this key.');
            }
        } catch (e) {
            setError(e.message || 'Connection test failed.');
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            await onSave({ provider, key, model, is_default: isDefault });
        } catch (err) {
            setError(err.message || 'Could not save this key.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {PROVIDERS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            disabled={isEdit}
                            onClick={() => switchProvider(p.id)}
                            className={`
                                flex items-center gap-2 px-3 py-2.5 border text-sm transition-all disabled:cursor-not-allowed
                                ${provider === p.id
                                    ? 'border-plum-500 bg-plum-50 text-plum-800 shadow-sm'
                                    : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'}
                            `}
                        >
                       
                            <span className="truncate font-medium">{p.label}</span>
                        </button>
                    ))}
                </div>
                <a
                    href={PROVIDERS.find((p) => p.id === provider)?.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-plum-700 font-medium hover:text-plum-600 mt-2"
                >
                    <span className="material-icons-round text-[14px]">key</span>
                    Get an API key
                </a>
            </div>

            <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    API Key
                </label>
                <div className="relative">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={isEdit ? 'Paste a new key to replace, or leave blank to keep' : 'Paste your API key'}
                        className="w-full px-3.5 py-2.5 pr-10 border text-sm border-stone-200 focus:outline-none focus:border-plum-400 focus:ring-2 focus:ring-plum-100 placeholder:text-stone-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        aria-label={showKey ? 'Hide key' : 'Show key'}
                    >
                        <span className="material-icons-round text-[18px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Model
                </label>
                <ModelSelect presets={presets} provider={provider} value={model} onChange={setModel} />
                <p className="text-[11px] text-stone-400 mt-1.5">
                    Pick which model this key uses. You can change it anytime.
                </p>
            </div>

            {!isEdit && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 accent-plum-600"
                    />
                    <span className="text-sm text-stone-600 font-medium">Use as my default provider</span>
                </label>
            )}

            {error && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px]">
                    {error}
                </div>
            )}
            {success && (
                <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] flex items-center gap-2">
                    <span className="material-icons-round text-[16px]">check_circle</span>
                    Connected successfully.
                </div>
            )}

            <div className="flex items-center gap-3 pt-1">
                <button
                    type="button"
                    onClick={runTest}
                    disabled={!key.trim() || testing}
                    className="px-4 py-2.5 border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {testing ? 'Testing…' : 'Test connection'}
                </button>
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
                >
                    {isEdit ? 'Cancel' : 'Back'}
                </button>
                <button
                    type="submit"
                    disabled={saving || (isEdit ? false : !key.trim())}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-plum-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving…' : isEdit ? 'Update key' : 'Save key'}
                </button>
            </div>
        </form>
    );
};

export const ExistingKeys = ({ data, onEdit, onRemove, onSetDefault }) => {
    const defaultProvider = data?.default_provider ?? null;
    const providers = data?.providers ?? {};

    return (
        <div className="space-y-3">
            {Object.keys(providers).map((providerId) => {
                const p = providers[providerId];
                const provider = PROVIDERS.find((x) => x.id === providerId);
                if (!p?.has_key) return null;
                const isDefault = defaultProvider === providerId;

                return (
                    <div
                        key={providerId}
                        className="flex items-center gap-3 p-3.5 border border-stone-200 bg-stone-50 hover:bg-white transition-colors"
                    >
                        <span className="w-9 h-9 bg-plum-100 text-plum-700 flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-[20px]">{PROVIDER_ICONS[providerId] ?? 'key'}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-stone-800">{provider?.label ?? providerId}</p>
                                {isDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-plum-600 text-white px-1.5 py-0.5">
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-stone-400 font-mono truncate">{p.masked_key ?? '••••••••'}</p>
                        </div>
                        {!isDefault && (
                            <button
                                onClick={() => onSetDefault({ provider: providerId, model: p.model })}
                                className="text-[12px] font-medium text-plum-700 hover:text-plum-600 px-2 py-1.5 hover:bg-plum-50 transition-colors"
                            >
                                Set default
                            </button>
                        )}
                        <button
                            onClick={() => onEdit({ provider: providerId, model: p.model, is_default: isDefault })}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 transition-colors"
                            aria-label="Change key"
                        >
                            <span className="material-icons-round text-[20px]">edit</span>
                        </button>
                        <button
                            onClick={() => onRemove(providerId)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Remove ${provider?.label ?? providerId}`}
                        >
                            <span className="material-icons-round text-[20px]">delete</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default function AIKeyModal() {
    const { data, loaded, save, setDefault, remove, refresh } = useAIKeys();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('list');
    const [editing, setEditing] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() =>
        subscribeAIKeyModal(() => {
            setIsOpen(true);
            setMode('list');
            setEditing(null);
            setNotice(null);
            if (!loaded) refresh();
        }), [loaded, refresh]);

    useEffect(() => {
        if (isOpen && !loaded) refresh();
    }, [isOpen, loaded, refresh]);

    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen]);

    if (!isOpen) return null;

    const hasAnyKeys = Object.values(data?.providers ?? {}).some((p) => p?.has_key);

    const handleSave = async (payload) => {
        await save(payload);
        setNotice(editing ? 'Provider updated.' : 'Key saved. AI features are now unlocked.');
        setMode('list');
        setEditing(null);
    };

    const handleRemove = async (providerId) => {
        await remove(providerId);
        setNotice('Key removed.');
    };

    const handleSetDefault = async ({ provider }) => {
        await setDefault(provider);
        setNotice('Default provider updated.');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <div className="relative w-[92%] max-w-lg bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 border border-stone-900/10 max-h-[90vh] flex flex-col">
                <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 bg-white/10 text-plum-300 flex items-center justify-center">
                            <span className="material-icons-round text-[20px]">key</span>
                        </span>
                        <div>
                            <h3 className="font-semibold text-[15px] leading-tight">AI Keys</h3>
                            <p className="text-[11px] text-stone-400">Connect your own AI provider</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 transition-colors" aria-label="Close">
                        <span className="material-icons-round text-[20px]">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {notice && (
                        <div className="mb-4 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] flex items-center gap-2">
                            <span className="material-icons-round text-[16px]">check_circle</span>
                            {notice}
                        </div>
                    )}

                    {mode === 'add' ? (
                        <>
                            {editing && (
                                <p className="text-sm text-stone-500 mb-4">
                                    Update the key for {PROVIDERS.find((p) => p.id === editing.provider)?.label}. Enter a new key to replace the current one.
                                </p>
                            )}
                            <KeyForm
                                presets={data?.presets ?? {}}
                                initial={editing}
                                isFirstKey={!hasAnyKeys}
                                onSave={handleSave}
                                onCancel={() => { setMode('list'); setEditing(null); }}
                            />
                        </>
                    ) : (
                        <>
                            {!hasAnyKeys ? (
                                <div className="text-center py-4">
                                   
                                    <h4 className="font-semibold text-[16px] text-stone-900">Bring your own AI key</h4>
                                    <p className="text-[13px] text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                        Connect your Google, DeepSeek, OpenAI or Claude key to unlock every AI feature, no subscription, pay the AI provider directly.
                                    </p>
                                    <button
                                        onClick={() => setMode('add')}
                                        className="mt-4 px-5 py-2.5 bg-stone-900 hover:bg-plum-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
                                    >
                                        <span className="material-icons-round text-[18px]">add</span>
                                        Add your first key
                                    </button>
                                    <p className="mt-4 text-[12px] text-stone-400">
                                        Not sure which one to pick?{' '}
                                        <Link to="/lockedin/model-guide" onClick={() => setIsOpen(false)} className="text-plum-700 font-medium underline underline-offset-2">
                                            See the model guide
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-400">
                                            Connected providers
                                        </p>
                                        <button
                                            onClick={() => setMode('add')}
                                            className="text-[12px] font-semibold text-plum-700 hover:text-plum-600 flex items-center gap-1"
                                        >
                                            <span className="material-icons-round text-[15px]">add</span>
                                            Add provider
                                        </button>
                                    </div>
                                    <ExistingKeys
                                        data={data}
                                        onEdit={(payload) => { setEditing(payload); setMode('add'); }}
                                        onRemove={handleRemove}
                                        onSetDefault={handleSetDefault}
                                    />
                                    <div className="mt-4 px-3.5 py-3 bg-stone-50 border border-stone-200 text-[12px] text-stone-500 leading-relaxed">
                                        <span className="font-semibold text-stone-700">How it works:</span> keys are encrypted at rest and used directly with your chosen provider. When no key is set, AI features show this screen. You can change or remove keys anytime.
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}