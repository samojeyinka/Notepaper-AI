import React from 'react';

const STEPS = [
  { number: '01', label: 'CAPTURE', title: 'Start with your own words', summary: 'Write on a paper like page, type a structured note, or dictate an idea while it is fresh.', kind: 'note' },
  { number: '02', label: 'ORGANIZE', title: 'Give your ideas a place', summary: 'Keep notes together by subject, then use them as the source for your study session.', kind: 'plan' },
  { number: '03', label: 'PRACTICE', title: 'Turn key ideas into recall', summary: 'Create flashcards from your notes and practice the details you want to remember.', kind: 'cards' },
  { number: '04', label: 'CHECK IN', title: 'See what you know', summary: 'Use a quiz to check your understanding and decide what deserves another review.', kind: 'quiz' },
];

function StepPreview({ kind }) {
  if (kind === 'note') return <div className="how-preview-paper"><small>BIOLOGY 101, TODAY</small><strong>Cellular energy</strong><p>Glycolysis begins in the cytoplasm. The next steps take place in the mitochondria.</p><span>Lecture notes</span></div>;
  if (kind === 'plan') return <div className="how-preview-plan"><small>THIS WEEK</small><div><b>01</b><span>Review cell structure</span><i>12 min</i></div><div><b>02</b><span>Recall key terms</span><i>8 min</i></div><div><b>03</b><span>Practice a quiz</span><i>10 min</i></div></div>;
  if (kind === 'cards') return <div className="how-preview-flash"><small>FLASHCARD, 4 OF 12</small><strong>Where does glycolysis happen?</strong><div>Think of your answer, then turn the card.</div></div>;
  return <div className="how-preview-quiz"><small>QUICK CHECK, 1 QUESTION</small><strong>What is the cell's usable energy molecule?</strong><div>Glucose</div><div className="how-answer">ATP <span>Correct</span></div><div>Oxygen</div></div>;
}

export default function HowItWorksSteps() {
  return (
    <section className="how-sequence py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="how-sequence-heading"><p className="landing-kicker">A SIMPLE RHYTHM</p><h2>Write it down.<br /><span>Work it through.</span></h2></div>
        <div className="how-sequence-list">
          {STEPS.map((step, index) => (
            <article key={step.number} className={`how-sequence-row ${index % 2 ? 'how-sequence-row-reverse' : ''}`}>
              <div className="how-sequence-copy"><div className="how-sequence-index"><span>{step.number}</span><i /></div><p className="landing-kicker">{step.label}</p><h3>{step.title}</h3><p className="how-sequence-summary">{step.summary}</p></div>
              <div className={`how-sequence-visual how-sequence-${step.kind}`}><StepPreview kind={step.kind} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
