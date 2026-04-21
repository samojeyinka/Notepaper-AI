export const TheCraft = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mt-10 md:mt-40">
        {/* Left Visual (reordered on mobile) */}
        <div className="lg:col-span-7 order-2 lg:order-1 relative h-[380px] md:h-[500px]">
          {/* Polaroid - Top Left */}
          <div className="polaroid w-72 -rotate-12 absolute top-0 left-20 z-20">
            <div className="w-full h-28 md:h-56 bg-slate-200 overflow-hidden relative">
              <img
                alt="Code and Coffee"
                className="w-full h-full object-cover sepia-[0.2]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBru4VRKNWJZWDx5unW5lug8JDbwz8YxOHsYkwcATEYoirb-J3h6l2dDT33nzwEZoiAwGL7PkK-RuLbqMBiauFcciWTPH2rSH0EQofapDUu5ozLSJHvO9fpqmYY6yvTl2rft4G00jtEfI1bz2dgeI-eO8HyZrEGz_ok96Y-iYgsn3mHXJ3yDrmaKhncPb6w2AlACPL-u5N7IPbg_EjipNtoQr2ElYIs_zK5J_V96R1eCWraBv4hZzvyzvSAtpOPWjYsoEWSx763thjo"
              />
            </div>
            <p className="font-sketch text-center mt-3 text-slate-500">Midnight coding sessions</p>
            <div className="washi-tape bg-yellow-300/40 -top-4 -right-6 rotate-[20deg]"></div>
          </div>

          {/* Analytics Card - Bottom Right */}
          <div className="absolute bottom-0 right-10 w-52 h-52 md:w-64 md:h-64 bg-yellow-50 rotate-6 paper-shadow p-6 border-b-8 border-white">
            <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">
              analytics
            </span>
            <p className="font-sketch text-slate-500 text-sm">
              Mapping the 'Ink-Flow' neural network. Each stroke is a data point, but it must feel like magic.
            </p>
          </div>
        </div>

        {/* Right Content (reordered on mobile) */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-8">
          <div className="inline-block bg-green-100 px-2 md:px-4 py.` md:py-1 rounded-full font-sketch text-green-600 text-[13px] md:text-xl rotate-1">
            Chapter II
          </div>
          <h2 className="text-3xl md:text-5xl font-serif-elegant font-semibold md:font-bold">The Craft</h2>
          <p className="text-[13px] md:text-lg text-slate-600 leading-relaxed">
            Building the AI wasn't just about math. It was about studying the physics of a fountain pen, the texture of heavy-stock paper, and the psychology of memory. We spent years perfecting an engine that doesn't just recognize text, but understands the <span className="italic text-purple-500">emotion</span> of handwriting.
          </p>
        </div>
      </div>
    </section>
  );
};