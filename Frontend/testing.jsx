<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Notepaper AI Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&amp;family=Caveat:wght@400;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --primary: #A78BFA;
            --note-yellow: #FBBF24;
            --note-green: #10B981;
            --note-purple: #A78BFA;
        }
        .blob-shape {
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }
        .pentagon-shape {
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }
        .polaroid-card {
            transition: transform 0.3s ease;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .polaroid-card:hover {
            transform: translateY(-8px) rotate(-1deg);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#A78BFA",
                        "background-light": "#F8FAFC",
                        "background-dark": "#0F172A",
                    },
                    fontFamily: {
                        display: ["Plus Jakarta Sans", "sans-serif"],
                        handwriting: ["Caveat", "cursive"],
                    },
                },
            },
        };
    </script>
</head>
<body class="font-display bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen">
<div class="flex min-h-screen">
<aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20">
<div class="p-8 flex items-center space-x-2">
<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
<span class="material-symbols-outlined">edit_note</span>
</div>
<span class="text-xl font-bold tracking-tight">Notepaper<span class="text-primary">.ai</span></span>
</div>
<nav class="flex-1 px-4 space-y-2 mt-4">
<a class="flex items-center space-x-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-primary rounded-2xl transition-all" href="#">
<span class="material-symbols-outlined">grid_view</span>
<span class="font-semibold">Dashboard</span>
</a>
<a class="flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all" href="#">
<span class="material-symbols-outlined">description</span>
<span>My Notes</span>
</a>
<a class="flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all" href="#">
<span class="material-symbols-outlined">mic</span>
<span>Recordings</span>
</a>
<a class="flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all" href="#">
<span class="material-symbols-outlined">event_note</span>
<span>Study Plan</span>
</a>
<a class="flex items-center space-x-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all" href="#">
<span class="material-symbols-outlined">quiz</span>
<span>Quizzes</span>
</a>
</nav>
<div class="p-4 mx-4 mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
<div class="flex items-center space-x-3 mb-3">
<div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-sm">stars</span>
</div>
<span class="text-xs font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
</div>
<p class="text-sm font-bold mb-1">Free Tier</p>
<div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-3">
<div class="bg-primary h-1.5 rounded-full w-3/4"></div>
</div>
<p class="text-[10px] text-slate-500 mb-3">750/1000 AI Credits used</p>
<button class="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center space-x-2">
<span class="material-symbols-outlined text-sm">bolt</span>
<span>Upgrade to Pro</span>
</button>
</div>
</aside>
<main class="flex-1 ml-64 p-8">
<header class="relative mb-16 pt-4">
<div class="flex justify-between items-start">
<div class="relative z-10">
<div class="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4">
<span class="material-symbols-outlined text-sm mr-1">auto_awesome</span>
                        AI-POWERED WORKSPACE
                    </div>
<h1 class="text-6xl font-extrabold text-slate-900 dark:text-white leading-tight -ml-1">
                        Creative <span class="relative">
                            Hub
                            <svg class="absolute -bottom-2 left-0 w-full h-3 text-primary/30" preserveAspectRatio="none" viewBox="0 0 100 10">
<path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" stroke-width="4"></path>
</svg>
</span>
</h1>
<p class="text-xl text-slate-500 dark:text-slate-400 mt-6 max-w-md font-medium leading-relaxed">
                        Transforming your <span class="text-slate-900 dark:text-white font-bold italic underline decoration-primary/50">digital whispers</span> into organized masterpieces.
                    </p>
</div>
<div class="flex items-center space-x-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-3xl backdrop-blur-sm border border-white dark:border-slate-700 shadow-sm">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
<input class="pl-10 pr-4 py-2 bg-transparent border-none rounded-2xl w-48 focus:ring-0 text-sm" placeholder="Find anything..." type="text"/>
</div>
<div class="w-[1px] h-6 bg-slate-200 dark:bg-slate-700"></div>
<button class="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary">
<img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHdJM_IMxFny9z7zuCwC5G3fA4cSdflQJCZ0oXsjNmvii6OpAxNxz85wKVeKDROwx_AJQ1dIAYh-ayH4r9SNVH6FU8DFzjEdOKhhMbylDqhjNrW0DI_7b2Az66SNvIOIE4wpVHwmcXgI8a3bqW7lYnE9O3LywNyVoY3hJ4hdcRcKIGIgJmd939vyINbr7NqwWTY4PT0mhjYB9RaZajxt1ocASHOaeQv-eCEQ2wPYlYQa4smpAp_fdkUpVD9T6l3smacr_vcy3_mSzi"/>
</div>
</div>
</div>
<div class="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
</header>
<section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
<button class="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
<div class="pentagon-shape bg-[#FBBF24] w-28 h-28 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-4xl">add</span>
</div>
<span class="font-bold text-xl">New Note</span>
<div class="absolute top-4 right-4 text-[10px] font-bold text-slate-300 group-hover:text-primary">CTRL + N</div>
</button>
<button class="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
<div class="w-28 h-28 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-4xl">mic</span>
</div>
<span class="font-bold text-xl">Voice Record</span>
<div class="absolute top-4 right-4 text-[10px] font-bold text-slate-300 group-hover:text-primary">REC</div>
</button>
<button class="group relative flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
<div class="blob-shape bg-[#A78BFA] w-28 h-28 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined text-4xl">auto_awesome</span>
</div>
<span class="font-bold text-xl">AI Generate</span>
<div class="absolute top-2 right-2 flex space-x-1">
<span class="bg-primary/20 text-primary text-[8px] px-2 py-0.5 rounded-full font-black">PRO</span>
</div>
</button>
</section>
<section class="mb-16 bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-indigo-600 dark:to-primary rounded-[3.5rem] p-12 text-white relative overflow-hidden">
<div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
<div class="max-w-md">
<h2 class="text-3xl font-bold mb-4 leading-tight">Elevate your study game with Notepaper Pro</h2>
<p class="text-white/70 mb-8 leading-relaxed">Unlock unlimited AI generation, handwriting recognition, and smart quiz generation from your voice recordings.</p>
<div class="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl w-fit mb-8 border border-white/20">
<button class="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-lg">Monthly</button>
<button class="px-6 py-2 text-white/80 hover:text-white rounded-xl font-bold text-sm">Yearly <span class="text-[10px] bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full ml-1">-20%</span></button>
</div>
<ul class="space-y-4 mb-8">
<li class="flex items-center space-x-3">
<span class="material-symbols-outlined text-primary-light">check_circle</span>
<span class="text-sm font-medium">Unlimited Cloud Storage</span>
</li>
<li class="flex items-center space-x-3">
<span class="material-symbols-outlined text-primary-light">check_circle</span>
<span class="text-sm font-medium">Advanced AI Summaries</span>
</li>
<li class="flex items-center space-x-3">
<span class="material-symbols-outlined text-primary-light">check_circle</span>
<span class="text-sm font-medium">No-Ads Experience</span>
</li>
</ul>
<button class="bg-primary hover:bg-primary/90 text-white dark:bg-white dark:text-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center space-x-3">
<span>Get Started Now</span>
<span class="material-symbols-outlined">arrow_forward</span>
</button>
</div>
<div class="relative">
<div class="grid grid-cols-2 gap-4 w-80 lg:w-96">
<div class="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 transform -rotate-3 hover:rotate-0 transition-all">
<div class="w-10 h-10 bg-yellow-400 rounded-full mb-3 flex items-center justify-center">
<span class="material-symbols-outlined text-white">psychology</span>
</div>
<div class="h-2 w-12 bg-white/30 rounded-full mb-2"></div>
<div class="h-2 w-full bg-white/10 rounded-full"></div>
</div>
<div class="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 transform rotate-6 translate-y-8 hover:rotate-0 transition-all">
<div class="w-10 h-10 bg-green-400 rounded-full mb-3 flex items-center justify-center">
<span class="material-symbols-outlined text-white">data_saver_on</span>
</div>
<div class="h-2 w-12 bg-white/30 rounded-full mb-2"></div>
<div class="h-2 w-full bg-white/10 rounded-full"></div>
</div>
<div class="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 transform -translate-y-4 hover:rotate-0 transition-all">
<div class="w-10 h-10 bg-purple-400 rounded-full mb-3 flex items-center justify-center">
<span class="material-symbols-outlined text-white">draw</span>
</div>
<div class="h-2 w-12 bg-white/30 rounded-full mb-2"></div>
<div class="h-2 w-full bg-white/10 rounded-full"></div>
</div>
</div>
</div>
</div>
<div class="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-3xl -z-0"></div>
<div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 opacity-20 blur-3xl -z-0"></div>
</section>
<div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
<div class="xl:col-span-3">
<div class="flex justify-between items-center mb-8">
<h2 class="text-3xl font-bold flex items-center">
                        Recent Notes
                        <span class="material-symbols-outlined ml-3 text-primary">arrow_outward</span>
</h2>
<a class="text-primary font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl transition-all" href="#">View Library</a>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<div class="polaroid-card bg-white dark:bg-slate-900 p-4 pb-10 transform -rotate-2">
<div class="aspect-[4/5] bg-slate-50 dark:bg-slate-800 mb-4 overflow-hidden rounded-sm relative border dark:border-slate-700">
<div class="absolute inset-0 p-4 font-handwriting text-slate-600 dark:text-slate-300 text-xl leading-relaxed">
                                buy more oil paints and the new canvas for the sunset series.
                            </div>
</div>
<h3 class="font-bold text-slate-800 dark:text-slate-100">Weekly Supplies</h3>
<p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Oct 12, 2023</p>
</div>
<div class="polaroid-card bg-white dark:bg-slate-900 p-4 pb-10 transform rotate-1">
<div class="aspect-[4/5] bg-slate-50 dark:bg-slate-800 mb-4 overflow-hidden rounded-sm relative border dark:border-slate-700">
<div class="absolute inset-0 p-4 font-handwriting text-slate-600 dark:text-slate-300 text-xl leading-relaxed">
                                dashboard that feels like a physical desk with scraps of...
                            </div>
</div>
<h3 class="font-bold text-slate-800 dark:text-slate-100">Project Concept</h3>
<p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Oct 10, 2023</p>
</div>
<div class="polaroid-card bg-white dark:bg-slate-900 p-4 pb-10 transform -rotate-1">
<div class="aspect-[4/5] bg-slate-50 dark:bg-slate-800 mb-4 overflow-hidden rounded-sm relative border dark:border-slate-700">
<div class="absolute inset-0 p-4 font-handwriting text-slate-600 dark:text-slate-300 text-xl leading-relaxed">
                                for coffee at 3pm to discuss the upcoming semester plan.
                            </div>
</div>
<h3 class="font-bold text-slate-800 dark:text-slate-100">Coffee Chat</h3>
<p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Oct 09, 2023</p>
</div>
<div class="polaroid-card bg-white dark:bg-slate-900 p-4 pb-10 transform rotate-3">
<div class="aspect-[4/5] bg-slate-50 dark:bg-slate-800 mb-4 overflow-hidden rounded-sm relative border dark:border-slate-700">
<div class="absolute inset-0 p-4 font-handwriting text-slate-600 dark:text-slate-300 text-xl leading-relaxed italic">
                                "The only way to do great work is to love what you do."
                            </div>
</div>
<h3 class="font-bold text-slate-800 dark:text-slate-100">Daily Quote</h3>
<p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Oct 08, 2023</p>
</div>
</div>
</div>
<div class="xl:col-span-1">
<h2 class="text-2xl font-bold mb-8">Upcoming Quizzes</h2>
<div class="space-y-4">
<div class="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm">
<div class="flex items-center justify-between mb-4">
<div class="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
<span class="material-symbols-outlined">science</span>
</div>
<span class="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Tomorrow</span>
</div>
<h4 class="font-bold text-slate-900 dark:text-white">Organic Chemistry</h4>
<p class="text-slate-500 text-sm mt-1">Chapter 4: Molecular Bonds</p>
<div class="mt-4 flex items-center text-xs text-slate-400">
<span class="material-symbols-outlined text-sm mr-1">schedule</span>
                            10:00 AM • 45 mins
                        </div>
</div>
<div class="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm">
<div class="flex items-center justify-between mb-4">
<div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
<span class="material-symbols-outlined">history_edu</span>
</div>
<span class="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Oct 15</span>
</div>
<h4 class="font-bold text-slate-900 dark:text-white">World History</h4>
<p class="text-slate-500 text-sm mt-1">The Renaissance Period</p>
<div class="mt-4 flex items-center text-xs text-slate-400">
<span class="material-symbols-outlined text-sm mr-1">schedule</span>
                            2:30 PM • 30 mins
                        </div>
</div>
<button class="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center space-x-2">
<span class="material-symbols-outlined">add_circle</span>
<span class="font-bold">Add to Plan</span>
</button>
</div>
</div>
</div>
</main>
<button class="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30">
<span class="material-symbols-outlined text-3xl">auto_fix_high</span>
</button>
<button class="fixed bottom-8 left-8 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-600 dark:text-slate-400 z-30" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-symbols-outlined dark:hidden">dark_mode</span>
<span class="material-symbols-outlined hidden dark:block">light_mode</span>
</button>
</div>

</body></html>