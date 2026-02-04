import React from 'react'

const Pricing = () => {
  return (
     <div className="pt-32 pb-24 relative z-10">
<div className="max-w-7xl mx-auto px-6 relative">
<div className="text-center space-y-6 mb-20 relative">
<h1 className="text-5xl lg:text-7xl font-bold font-serif text-slate-900 leading-tight">
                Simple pricing for <br/>
                unlimited creativity.
            </h1>
<p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                Choose the plan that fits your study flow. Upgrade anytime to unlock the full power of AI handwriting.
            </p>
<div className="flex flex-col items-center pt-8">
<div className="flex items-center justify-center gap-6 p-2 bg-slate-200/30 rounded-full border border-slate-200/50 switch-shadow">
<span className="text-sm font-bold text-slate-400 uppercase tracking-widest px-4">Monthly</span>
<button className="relative flex items-center w-20 h-10 bg-white rounded-full border-2 border-slate-200 shadow-sm p-1 group">
<div className="absolute right-1 w-8 h-8 bg-primary rounded-full transition-all duration-300 shadow-md"></div>
</button>
<span className="text-sm font-bold text-slate-900 uppercase tracking-widest px-4 flex items-center gap-2">
                        Annual 
                        <span className="px-2 py-0.5 bg-accent-green text-white text-[10px] rounded-md rotate-2">Save 20%</span>
</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto relative px-4">
<div className="relative bg-white p-12 card-shadow organic-edge-white border border-slate-100 flex flex-col h-full transform transition-all hover:translate-y-[-4px]">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-10 bg-slate-100/60 border-x border-slate-200/40 rotate-1 opacity-60"></div>
<div className="mb-8">
<div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-slate-400 text-3xl">eco</span>
</div>
<h3 className="text-3xl font-bold font-serif mb-2">Free</h3>
<div className="flex items-baseline gap-1">
<span className="text-5xl font-bold font-serif">$0</span>
<span className="text-slate-400 font-bold uppercase tracking-tighter text-sm">/ month</span>
</div>
</div>
<div className="space-y-6 mb-12 flex-grow">
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-accent-green">check_circle</span>
<span className="text-slate-600 font-medium">Limited AI Handwriting conversion</span>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-accent-green">check_circle</span>
<span className="text-slate-600 font-medium">3 voice recordings per month</span>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-accent-green">check_circle</span>
<span className="text-slate-600 font-medium">Standard paper textures</span>
</div>
</div>
<button className="w-full py-5 px-6 bg-slate-50 border-2 border-slate-200 text-slate-400 font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-colors rounded-sm">
                    Current Plan
                </button>
</div>
<div className="relative bg-[#E9E1FF] p-12 card-shadow organic-edge-purple border border-purple-200/50 flex flex-col h-full transform transition-all hover:translate-y-[-6px] z-10">
<div className="absolute -right-16 top-1/2 hidden lg:block sketch-annotation">
<svg className="rotate-[160deg]" height="100" viewBox="0 0 100 100" width="100">
<path d="M10,50 Q40,40 80,50" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
<path d="M70,40 L80,50 L70,60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"></path>
</svg>
<div className="scribble-note text-indigo-400 text-lg w-24 text-center mt-2 leading-tight">Best for Students!</div>
</div>
<div className="absolute -top-4 right-10 px-4 py-2 bg-yellow-300 text-yellow-900 text-xs font-black uppercase tracking-widest rotate-3 shadow-md border border-yellow-400">
                    Top Pick!
                </div>
<div className="mb-8">
<div className="w-16 h-16 bg-white/60 border-2 border-white/80 rounded-lg flex items-center justify-center mb-6 shadow-sm">
<span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
</div>
<h3 className="text-3xl font-bold font-serif mb-2 text-indigo-900">Premium</h3>
<div className="flex items-baseline gap-1">
<span className="text-5xl font-bold font-serif text-indigo-900">$7.99</span>
<span className="text-indigo-700/60 font-bold uppercase tracking-tighter text-sm">/ month</span>
</div>
</div>
<div className="space-y-6 mb-12 flex-grow text-indigo-900">
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary">done_all</span>
<span className="font-bold">Unlimited AI Handwriting</span>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary">done_all</span>
<span className="font-bold">Unlimited Voice Transcripts</span>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary">done_all</span>
<span className="font-bold">AI Quiz &amp; Flashcard Gen</span>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary">done_all</span>
<span className="font-bold">Custom Study Plans</span>
</div>
</div>
<div className="relative group">
<button className="w-full py-5 px-6 bg-white text-primary font-black uppercase tracking-widest text-sm shadow-md hover:shadow-xl transition-all active:scale-95 rounded-sm">
                        Upgrade to Premium
                    </button>
<div className="absolute -bottom-8 left-0 w-full text-center scribble-note text-indigo-500/60 text-sm">
                        Cancel anytime with one click
                    </div>
</div>
</div>
</div>
<div className="mt-32 text-center relative">
<div className="absolute -top-12 left-1/4 sketch-annotation opacity-30">
<svg height="40" viewBox="0 0 120 40" width="120">
<path d="M10,20 C40,5 80,35 110,20" fill="none" stroke="currentColor" stroke-width="1"></path>
</svg>
</div>
<p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mb-12">Trusted by 50,000+ creative minds</p>
<div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
<div className="flex items-center gap-3 font-serif font-black text-2xl tracking-tighter italic">UNIVERSITY</div>
<div className="flex items-center gap-3 font-serif font-black text-2xl tracking-tighter italic">CREATIVE</div>
<div className="flex items-center gap-3 font-serif font-black text-2xl tracking-tighter italic">STUDIO</div>
<div className="flex items-center gap-3 font-serif font-black text-2xl tracking-tighter italic">ACADEMY</div>
</div>
</div>
</div>
</div>
  )
}

export default Pricing