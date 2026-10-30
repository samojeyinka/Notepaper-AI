import React from 'react';
import { notepaperMark } from '../../assets/assets';

export default function AuthShell({ aside, children }) {
  return (
    <main className="auth-main w-full px-4 sm:px-6 py-8 md:py-12">
      <div className="auth-shell max-w-7xl mx-auto overflow-hidden grid grid-cols-1 lg:grid-cols-[.92fr_1.08fr]">
        <AuthAside
          title={aside.title}
          sub={aside.sub}
          step={aside.step}
          totalSteps={aside.totalSteps}
        >
          {aside.children}
        </AuthAside>
        <section className="auth-form-section flex items-center justify-center px-5 sm:px-10 py-9 md:py-12 lg:py-14">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthAside({ title = [], sub, step, totalSteps, children }) {
  const lines = [...(Array.isArray(title) ? title : [title])];
  const accent = lines.length > 1 ? lines.pop() : '';
  const primary = lines.join(' ');

  return (
    <section className="auth-aside relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-12 xl:p-14">
      <div className="auth-aside-content relative z-10">

        <div className="auth-aside-copy mt-10 lg:mt-16 max-w-md">
          <h2 className="text-3xl sm:text-4xl xl:text-[48px] font-semibold tracking-[-0.055em] leading-[1.05]">
            {primary}{accent && <><br /><span>{accent}</span></>}
          </h2>
          {sub && <p className="text-sm sm:text-base leading-relaxed mt-5 max-w-md">{sub}</p>}
          {children && <div className="auth-aside-perks mt-7">{children}</div>}
        </div>
      </div>

      <div className="auth-paper-art relative z-10 mt-10" aria-hidden="true">
        <span>YOUR NOTEBOOK</span>
        <strong>A place to begin.</strong>
        <i /><i /><i />
      </div>

      {step != null && totalSteps != null && (
        <div className="auth-progress relative z-10 flex items-center gap-3 mt-7">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map((currentStep) => (
              <span key={currentStep} className={currentStep === step ? 'auth-progress-active' : currentStep < step ? 'auth-progress-done' : ''} />
            ))}
          </div>
          <span className="text-xs">Step {step} of {totalSteps}</span>
        </div>
      )}
      <div className="auth-aside-orbit" aria-hidden="true" />
    </section>
  );
}
