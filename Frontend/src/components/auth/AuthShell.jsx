import React from 'react';

/**
 * Shared shell for auth pages: paper background, one  two-column
 * card with a quiet dark brand panel on the left and the form on the right.
 */
export default function AuthShell({ aside, children }) {
  return (
    <main className="w-full bg-paper py-8 md:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white  overflow-hidden ring-1 ring-stone-900/5 shadow-[0_30px_70px_-40px_rgba(28,25,23,0.35)] grid grid-cols-1 lg:grid-cols-2">
        <AuthAside
          title={aside.title}
          sub={aside.sub}
          step={aside.step}
          totalSteps={aside.totalSteps}
        >
          {aside.children}
        </AuthAside>
        <section className="flex items-center justify-center bg-white py-12 md:py-16 px-5 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}

/**
 * Dark brand panel shown on large screens. `title` is an array where the
 * last entry is rendered as the italic accent line. Optional `children` are
 * rendered under the supporting copy (e.g. reassurance bullets).
 */
export function AuthAside({ title = [], sub, step, totalSteps, children }) {
  const lines = Array.isArray(title) ? title : [title];
  const accent = lines.length > 1 ? lines.pop() : '';
  const primary = lines.join(' ');

  return (
    <section
      className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-stone-900 text-white"
      style={{
        backgroundSize: '26px 26px',
      }}
    >
  

    

      <div className="relative z-10 max-w-md space-y-6">
        <h1 className="font-display-serif text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.12]">
          {primary}
          {accent && (
            <>
              <br />
              <span className="italic text-plum-300">{accent}</span>
            </>
          )}
        </h1>
        {sub && <p className="text-stone-400 text-base xl:text-lg leading-relaxed">{sub}</p>}
        {children && <div className="space-y-3 pt-1">{children}</div>}
        {step != null && totalSteps != null && (
          <div className="flex items-center gap-3 pt-3">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className="h-1.5  transition-all duration-500 ease-out"
                  style={{
                    width: s === step ? '28px' : '8px',
                    backgroundColor: s <= step ? '#b7a1e6' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
            <span className="text-[13px] text-stone-500">
              Step {step} of {totalSteps}
            </span>
          </div>
        )}
      </div>

     
    </section>
  );
}
