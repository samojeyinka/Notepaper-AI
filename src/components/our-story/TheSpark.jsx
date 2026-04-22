export const TheSpark = () => {
  return (
    <section className="py-10 md:py-15 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Content */}
        <div className="lg:col-span-5 space-y-4 md:space-y-8 relative">
          <div className="inline-block bg-yellow-100 px-2 md:px-4 py-0.5 md:py-1 rounded-full font-sketch text-yellow-600 text-[14px] md:text-xl -rotate-2">
            Chapter I
          </div>
          <h2 className="text-2xl md:text-5xl font-serif-elegant font-bold">The Spark</h2>
          <p className="text-[14px] md:text-lg text-slate-600 leading-relaxed">
            It began in a dusty attic filled with old journals. We realized that in the rush to digitize everything, we lost the tactile intimacy of a pen hitting paper—the way a smudge or a quick sketch captures a mood that a cursor never could.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-1 bg-slate-200"></div>
            <p className="font-handwritten text-slate-400 italic text-[12px] md:text-lg">Founding idea, 2021</p>
          </div>
        </div>

        {/* Right Visual */}
        <div className="lg:col-span-7 relative h-[370px] md:h-[500px] flex items-center justify-center">
          {/* Polaroid - Top Right */}
          <div className="polaroid w-64 rotate-6 absolute -top-10 right-20 z-20">
            <div className="w-full h-48 bg-slate-200 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/30 to-blue-200/30"></div>
              <img
                alt="Old Desk"
                className="w-full h-full object-cover grayscale-[0.3] contrast-125"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ19cO_9SxJYycyNkaEVf2vxr6O5EzrpjJnKCGLLtf-d_seJ4UdxzRMQdMdvlgTTLHLjhU8DpUQIicA09GcCF6_9MDZl6n6svSnIsfCjAuNyIrE50AcrA9Bn0egRda4Srlj4JsuS1EFU8RDqPa2sFdcYNa-ZEz3lf2nV-Ud9ZnQWlGl6Iiun_Gg_lWxKm6JFKhcpXVIN2hsoWzlIqYtybrftibnPE8_o9nF9nR8jorwMAt6etRzlfgin4i6tqGwDMLDChlKYqsV9Ia"
              />
            </div>
            <p className="font-sketch text-center mt-3 text-slate-500">The first notebook</p>
            <div className="washi-tape bg-blue-300/40 -top-4 -left-6 rotate-[-15deg]"></div>
          </div>

          {/* Grid Paper Card - Bottom Left */}
          <div className="bg-white paper-shadow torn-edge p-5 md:p-10 w-60 md:w-80 -rotate-3 absolute bottom-10 left-10 z-10 grid-paper border-l-4 border-purple-200">
            <p className="font-handwritten text-slate-700 leading-relaxed text-[14px] md:text-lg">
              "What if the screen felt like grain? What if the AI understood the 'why' behind the scribble?"
            </p>
            <div className="washi-tape bg-pink-300/40 top-2 right-4 rotate-[10deg]"></div>
          </div>
        </div>
      </div>
    </section>
  );
};