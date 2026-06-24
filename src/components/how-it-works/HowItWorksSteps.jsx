

export default function HowItWorksSteps() {
  return (
    <section className="relative max-w-5xl mx-auto px-6">
      {/* Parchment Roll Background */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full md:w-[800px] h-full parchment-roll -z-10 border-x border-slate-200/50"></div>

      {/* Steps Container */}
      <div className="space-y-32 relative">
        {/* STEP 1: Record or Type */}
        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-12 group">
          {/* Left - Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-52 h-52 md:w-64 md:h-64 bg-white paper-shadow rotate-3 p-8 flex flex-col items-center justify-center hand-drawn-border">
              <div className="w-24 h-24 bg-accent-yellow/20 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-accent-yellow">
                  mic
                </span>
              </div>
              <span className="font-sketch text-slate-400 text-sm">Paper Cutout #01</span>
              <div className="washi-tape -top-2 -right-4 bg-yellow-200/60"></div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="md:w-1/2 text-left space-y-4">
            <div className="inline-block px-4 py-1 bg-accent-yellow/10 text-accent-yellow font-bold rounded-full text-sm mb-2">
              STEP 01
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-elegant font-extrabold">Record or Type</h2>
            <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed">
              Simply start talking or type out your raw thoughts. Our AI listens for nuances, pauses,
              and emphasis to capture the context of your ideas, not just the words.
            </p>
            <div className="font-sketch text-primary text-lg mt-4 transform -rotate-2">
              "Whisper or shout, we catch it all!"
            </div>
          </div>

          {/* Down Arrow */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 hidden md:block">
            <svg
              className="text-slate-300 w-24 h-32"
              fill="none"
              viewBox="0 0 100 150"
            >
              <path
                d="M50,0 Q80,75 50,140"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
              <path
                d="M35,120 L50,140 L65,120"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
            </svg>
            <div className="absolute left-28 top-12 w-48 font-sketch text-slate-400 leading-tight">
              AI processing engine starts here...
            </div>
          </div>
        </div>

        {/* STEP 2: AI Transformation */}
        <div className="relative flex flex-col md:flex-row-reverse items-center gap-12 group">
          {/* Left - Image */}
          <div className="md:w-1/2 flex justify-center md:justify-start">
            <div className="relative w-80 h-96 bg-white paper-shadow -rotate-2 p-10 lined-paper border-r-4 border-primary/20">
              <div className="space-y-6">
                {/* Strikethrough text */}
                <div className="opacity-30">
                  <p className="font-sans text-sm text-slate-400 line-through">
                    Meeting notes: discussed budget and timelines...
                  </p>
                </div>

                {/* Handwritten text */}
                <div className="relative">
                  <p className="font-handwritten text-2xl text-primary leading-loose">
                    The vision for Q4 centers on{' '}
                    <span className="bg-accent-yellow/30 px-1">tactile growth</span>...
                  </p>
                  <span className="material-symbols-outlined absolute -top-4 -right-4 text-accent-yellow animate-pulse">
                    auto_awesome
                  </span>
                  <span className="material-symbols-outlined absolute bottom-0 -left-6 text-primary scale-75">
                    flare
                  </span>
                </div>

                {/* Footer line */}
                <div className="pt-8">
                  <div className="w-full h-px bg-slate-100 mb-2"></div>
                  <p className="font-sketch text-slate-300">Transformation Engine v2.4</p>
                </div>
              </div>
              <div className="washi-tape-vert -top-6 left-1/2 bg-blue-100/50"></div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="md:w-1/2 text-left md:text-right space-y-4">
            <div className="inline-block px-4 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm mb-2">
              STEP 02
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-elegant font-extrabold">AI Transformation</h2>
            <p className="text-[15px] md:text-lg text-slate-600 leading-relaxed">
              Watch as digital text morphs into organic, handwritten ink. Our proprietary model
              synthesizes a unique pen-style for you, complete with natural pressure variations and
              flourishes.
            </p>
            <div className="font-sketch text-accent-pink text-lg mt-4 transform rotate-1">
              "Magical ink synthesis technology"
            </div>
          </div>

          {/* Down Arrow */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 hidden md:block">
            <svg
              className="text-slate-300 w-24 h-32"
              fill="none"
              viewBox="0 0 100 150"
            >
              <path
                d="M50,0 Q20,75 50,140"
                fill="none"
                stroke="currentColor"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
              <path
                d="M35,120 L50,140 L65,120"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>
            </svg>
            <div className="absolute -left-52 top-12 w-48 font-sketch text-slate-400 leading-tight text-right">
              Indexing content for deep search...
            </div>
          </div>
        </div>

        {/* STEP 3: Organize & Study */}
        <div className="relative flex flex-col md:flex-row items-center gap-12 group pb-20">
          {/* Left - Images */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative grid grid-cols-2 gap-4">
              {/* Card 1 - Green */}
              <div className="w-40 h-40 bg-accent-green/20 paper-shadow rotate-3 p-6 hand-drawn-border flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-accent-green">
                  folder_open
                </span>
                <p className="font-sketch mt-2">Study Folders</p>
              </div>

              {/* Card 2 - Pink (offset) */}
              <div className="w-40 h-40 bg-accent-pink/20 paper-shadow -rotate-6 p-6 hand-drawn-border flex flex-col items-center justify-center translate-y-8">
                <span className="material-symbols-outlined text-4xl text-accent-pink">quiz</span>
                <p className="font-sketch mt-2">AI Quiz Maker</p>
              </div>

              <div className="washi-tape top-0 right-0 bg-green-100/40"></div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="md:w-1/2 text-left space-y-4">
            <div className="inline-block px-4 py-1 bg-accent-green/10 text-accent-green font-bold rounded-full text-sm mb-2">
              STEP 03
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-elegant font-extrabold">
              Organize &amp; Study
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Your notes are automatically tagged and filed. AI extracts key concepts to build smart
              flashcards and personalized quizzes, helping you master any subject with the warmth of
              paper.
            </p>
            <div className="font-sketch text-slate-500 text-lg mt-4 transform -rotate-1">
              "Everything findable, everything learnable."
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}