<!DOCTYPE html>
<html class="scroll-smooth" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sign Up | Notepaper.ai</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Playfair+Display:ital,wght@0,700;1,700&amp;family=Caveat:wght@400;700&amp;family=Gochi+Hand&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
<style type="text/tailwindcss">
        :root {
            --paper-cream: #fdfaf3;
            --paper-edge: #e7e2d5;
            --ruled-line: #e2e8f0;
            --ink-blue: #1e293b;
            --tape-color: rgba(255, 255, 255, 0.4);
        }
        .paper-texture {
            background-color: var(--paper-cream);
            background-image: 
                radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0);
            background-size: 24px 24px;
        }
        .paper-scrap {
            filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));
            border: 1px solid var(--paper-edge);
            position: relative;
        }
        .rough-edge {
            clip-path: polygon(
                0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%
            );
        }
        .tape {
            background: var(--tape-color);
            width: 60px;
            height: 20px;
            transform: rotate(-15deg);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            backdrop-filter: blur(1px);
        }
        .ruled-input {
            border: none;
            border-bottom: 1px solid var(--ruled-line);
            background: transparent;
            padding-left: 0;
            padding-right: 0;
            border-radius: 0;
        }
        .ruled-input:focus {
            box-shadow: none;
            border-bottom-color: #9333ea;
        }
        .handwritten {
            font-family: 'Caveat', cursive;
        }
        .scribble {
            font-family: 'Gochi Hand', cursive;
        }
        .organic-pentagon {
            clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
        }
    </style>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#9333ea",
                        "paper-cream": "#fdfaf3",
                        accent: {
                            yellow: "#ffedbc",
                            green: "#dcfce7",
                            blue: "#e0e7ff",
                            peach: "#fee2e2"
                        }
                    },
                    fontFamily: {
                        sans: ["Plus Jakarta Sans", "sans-serif"],
                        display: ["Playfair Display", "serif"],
                        hand: ["Caveat", "cursive"],
                    }
                }
            }
        };
    </script>
</head>
<body class="bg-stone-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 md:p-6">
<main class="w-full max-w-6xl flex flex-col md:flex-row overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl min-h-[85vh]">
<section class="hidden md:flex flex-1 relative paper-texture p-12 overflow-hidden items-center justify-center border-r border-stone-200">
<div class="absolute top-8 left-8 flex items-center gap-2 z-20">
<div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
<span class="material-symbols-outlined text-white text-xl">sticky_note_2</span>
</div>
<span class="text-slate-800 font-bold tracking-tight">Notepaper.ai</span>
</div>
<div class="relative z-10 w-full max-w-lg">
<div class="relative h-[400px] mb-8">
<div class="absolute inset-0 bg-white paper-scrap rough-edge transform rotate-1 p-8 flex flex-col justify-center">
<h1 class="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 leading-tight">
                        Turn thoughts into <span class="font-display italic text-primary">masterpieces.</span>
</h1>
<p class="text-slate-600 text-lg font-medium opacity-90">
                        The AI-powered creative hub for modern thinkers, students, and professionals.
                    </p>
</div>
<div class="absolute -top-10 -right-4 w-32 h-32 bg-accent-yellow paper-scrap organic-pentagon flex items-center justify-center transform rotate-12">
<span class="material-symbols-outlined text-4xl text-amber-600">edit_note</span>
<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-slate-400 shadow-inner"></div>
</div>
<div class="absolute -bottom-6 -left-6 w-40 h-28 bg-accent-peach paper-scrap rough-edge transform -rotate-3 p-4">
<div class="tape absolute -top-4 left-1/2 -translate-x-1/2"></div>
<p class="handwritten text-xl leading-none text-rose-800 pt-2">"This app changed my whole workflow..."</p>
<div class="flex items-center gap-2 mt-2">
<img alt="User avatar" class="w-6 h-6 rounded-full border border-rose-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Xu1OjV5L3VKF6dwYX_LVs0lUBVgEl1Sx4GZuWU6dUCKTUS_XQh8zRjTZZeJUri_YHl0bjKdpUKlVdVq3RxPasgqwThglTNPNhmd8XNNCTgYhjRspL6nKRF9M7e41p3z74BDxIcbegQoXDl86RONwEg-n8DrL3n5Gl_4I3uf8GWyGZ6YOJFK08FWIFKSs6VsLduzQCXF2AtEpTxkh7t4y5O7yDRV448fhgFjR7BRgjsD9q4_0ev69zQaKbFhzs8ufQzi6K-b2LFHU"/>
<span class="text-[10px] uppercase tracking-wider font-bold text-rose-700">Alex R.</span>
</div>
</div>
<div class="absolute top-20 -right-12 w-24 h-24 rounded-full bg-accent-green paper-scrap flex items-center justify-center transform -rotate-6">
<span class="material-symbols-outlined text-3xl text-emerald-600">auto_awesome</span>
<div class="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md"></div> 
</div>
<div class="absolute bottom-10 -right-8 w-36 h-48 bg-accent-blue paper-scrap rough-edge transform rotate-6 p-4">
<div class="w-full h-24 bg-indigo-200/50 rounded-sm mb-2"></div>
<div class="space-y-1">
<div class="h-1 w-full bg-indigo-300/30"></div>
<div class="h-1 w-4/5 bg-indigo-300/30"></div>
<div class="h-1 w-full bg-indigo-300/30"></div>
</div>
</div>
</div>
</div>
</section>
<section class="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-slate-900 relative">
<div class="max-w-md mx-auto w-full">
<div class="flex md:hidden items-center gap-2 mb-8">
<div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
<span class="material-symbols-outlined text-white">sticky_note_2</span>
</div>
<span class="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Notepaper.ai</span>
</div>
<header class="mb-10">
<h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Join the Hub</h2>
<p class="text-slate-500 dark:text-slate-400">Start your creative journey in seconds.</p>
</header>
<div class="grid grid-cols-2 gap-4 mb-8">
<button class="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm">
<img alt="Google" class="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFSMyDTmLqM6JquEooO7-0kXHACkccZ3df1MJ66QGGlvf01WhVpS-JWMf1aVLns2KoZqDdaTjzBNoZyPKTY-faIyg3VpjdcA0zVfjhMYApUJhNzmPkzBXWywj6IhJyTpDxEJJttoMjiFxa6HR7uhFc_URAR3Cw4aYf8fp2G3a83XpR9eFPI0OkfaUUl-9lTiD1nd2bh_qxPHcOQ0ednjhFAuWs0skdAsgHBbFJpPolpIlDiZI4V_-erN40Y8-myBifVLJTi_2mjLJa"/>
<span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
</button>
<button class="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 shadow-sm">
<img alt="Apple" class="w-5 h-5 dark:invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgmycMs_L7F8j-vKUJ9XJ8CiPEJdVGPcqJz3zjYXZT5fJGnQPTW8UKknl6FgVn-OdpwKDM3KyRtRYClKBlu2IGKESC6kqjwpXJlRye9K8Do2mwWIOpweEpZ66OzGHVq0fMQc5tiYWCW9ERV2xVCJoINMoHU66ZGCp-YCeblPF4fnFglDjm2cVa5DbY0d2NZzPgqIUzFqTe_5p5SROzBJF6wujRpr9iZO0czT7E4BdEIyF-ik_VV-Y8dLg9WA-mC3nHHjzVaRVu71IY"/>
<span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Apple</span>
</button>
</div>
<div class="relative flex py-5 items-center">
<div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
<span class="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest handwritten text-lg">or email</span>
<div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
</div>
<form class="space-y-6" onsubmit="event.preventDefault();">
<div class="group">
<label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1" for="name">Full Name</label>
<input class="w-full ruled-input focus:ring-0 text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600" id="name" placeholder="Type your name..." type="text"/>
</div>
<div class="group">
<label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1" for="email">Email Address</label>
<input class="w-full ruled-input focus:ring-0 text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600" id="email" placeholder="you@example.com" type="email"/>
</div>
<div class="group">
<div class="flex justify-between mb-1">
<label class="block text-xs font-bold text-slate-400 uppercase tracking-widest" for="password">Password</label>
<a class="text-xs font-semibold text-primary hover:underline handwritten text-base" href="#">Forgot?</a>
</div>
<div class="relative">
<input class="w-full ruled-input focus:ring-0 text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600" id="password" placeholder="••••••••" type="password"/>
<button class="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" type="button">
<span class="material-symbols-outlined text-lg">visibility</span>
</button>
</div>
</div>
<div class="flex items-center gap-2 py-2">
<input class="rounded-sm text-primary focus:ring-primary border-slate-300" id="terms" type="checkbox"/>
<label class="text-xs text-slate-500 dark:text-slate-400" for="terms">
                        I agree to the <a class="text-primary font-semibold" href="#">Terms</a> and <a class="text-primary font-semibold" href="#">Privacy</a>.
                    </label>
</div>
<div class="relative pt-4">
<div class="absolute -top-6 right-0 scribbled-arrow pointer-events-none hidden md:block">
<span class="scribble text-primary text-xl rotate-12 inline-block">Start here!</span>
<svg class="w-12 h-12 text-primary -rotate-45 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
</svg>
</div>
<button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" type="submit">
                        Create Free Account
                    </button>
</div>
</form>
<footer class="mt-8 text-center">
<p class="text-slate-500 dark:text-slate-400 text-sm">
                    Already have an account? 
                    <a class="text-primary font-bold hover:underline handwritten text-lg ml-1" href="#">Log in here</a>
</p>
</footer>
</div>
<div class="absolute bottom-6 left-0 right-0 text-center text-[10px] text-slate-400 dark:text-slate-600 px-4">
            © 2024 Notepaper AI Inc. Crafted with care for creative minds.
        </div>
</section>
</main>
<button class="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-symbols-outlined dark:hidden">dark_mode</span>
<span class="material-symbols-outlined hidden dark:block">light_mode</span>
</button>

</body></html>