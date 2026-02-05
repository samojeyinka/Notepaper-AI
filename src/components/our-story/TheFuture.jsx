export const TheFuture = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mt-40">
        {/* Left Content */}
        <div className="lg:col-span-5 space-y-8">
          <div className="inline-block bg-purple-100 px-4 py-1 rounded-full font-sketch text-purple-600 text-xl -rotate-1">
            Chapter III
          </div>
          <h2 className="text-5xl font-serif-elegant font-bold">The Future</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We envision a world where technology doesn't distract, but deepens focus. Notepaper AI is evolving into a personal thinking partner—a digital journal that helps you connect dots across years of thoughts, while keeping your data as private as a locked diary.
          </p>
        </div>

        {/* Right Visual */}
        <div className="lg:col-span-7 relative h-[500px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Gradient Blur Background */}
            <div className="w-96 h-96 rounded-full bg-purple-100 blur-3xl absolute opacity-30"></div>

            {/* Promise Card */}
            <div className="bg-white paper-shadow p-12 rotate-2 relative z-10 max-w-md lined-paper border-t-8 border-purple-200">
              <h4 className="font-handwritten text-2xl text-slate-800 mb-4 italic">
                Our promise:
              </h4>
              <p className="font-handwritten text-lg text-slate-600 leading-loose">
                To preserve the beauty of human expression in an increasingly automated world. The pen is mightier than ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};