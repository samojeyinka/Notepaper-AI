import React from 'react';

const FEATURES = [
  { number: '01', tag: 'THE NOTEBOOK', title: 'A page that feels like yours', body: 'Write by hand or type. Keep class notes, longer papers, and passing thoughts in one place.', visual: 'page' },
  { number: '02', tag: 'THE STUDY PLAN', title: 'A clear next step', body: 'Shape your material into a study plan, so you can see what to work on and when.', visual: 'plan' },
  { number: '03', tag: 'THE FLASHCARDS', title: 'Practice the important parts', body: 'Turn key ideas into prompts and answers you can use for active recall.', visual: 'cards' },
  { number: '04', tag: 'THE QUIZ', title: 'Find what needs another look', body: 'Test your understanding with questions drawn from your own learning material.', visual: 'quiz' },
  { number: '05', tag: 'VOICE NOTES', title: 'Catch an idea out loud', body: 'Speak a thought or record a lecture and bring the words into your notebook.', visual: 'voice' },
  { number: '06', tag: 'YOUR LIBRARY', title: 'Find the note you need', body: 'Keep notes together by course or subject and search when it is time to review.', visual: 'library' },
];

function FeatureVisual({ type }) {
  if (type === 'page') return <div className="feature-visual feature-visual-page"><span className="feature-visual-meta">BIOLOGY 101</span><strong>Cellular respiration</strong><i>Glucose becomes usable energy</i><i>Glycolysis begins in the cytoplasm</i><i>The mitochondria complete the process</i></div>;
  if (type === 'plan') return <div className="feature-visual feature-visual-plan"><div><span>MON</span><b>Review key terms</b></div><div><span>TUE</span><b>Practice recall</b></div><div><span>WED</span><b>Check understanding</b></div></div>;
  if (type === 'cards') return <div className="feature-visual feature-visual-cards"><div><span>QUESTION</span><b>Where does glycolysis happen?</b></div><div><span>ANSWER</span><b>In the cell cytoplasm</b></div></div>;
  if (type === 'quiz') return <div className="feature-visual feature-visual-quiz"><b>Which molecule stores usable energy?</b><i>Glucose</i><i className="feature-choice-active">ATP</i><i>Oxygen</i></div>;
  if (type === 'voice') return <div className="feature-visual feature-visual-voice"><div className="feature-wave" aria-hidden="true">{[18, 30, 14, 38, 24, 44, 16, 34, 48, 22, 38, 16, 28, 42, 18, 32, 14, 40, 24].map((height, index) => <i key={index} style={{ height: `${height}px` }} />)}</div><span>Lecture thought, 2 min</span></div>;
  return <div className="feature-visual feature-visual-library"><div><span>01</span><b>Biology</b><small>12 notes</small></div><div><span>02</span><b>History</b><small>8 notes</small></div><div><span>03</span><b>Literature</b><small>6 notes</small></div></div>;
}

export default function FeaturesGrid() {
  return (
    <section className="feature-stories py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="feature-stories-heading mb-10 md:mb-14">
          <p className="landing-kicker">A NOTEBOOK WITH ROOM TO GROW</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.05em] leading-tight mt-4">One place for the whole learning loop.</h2>
          <p className="text-stone-600 text-base md:text-lg leading-relaxed mt-4 max-w-xl">Start with what you have written. Keep going with the tools that help it stay with you.</p>
        </div>
        <div className="feature-story-grid">
          {FEATURES.map((feature) => (
            <article key={feature.number} className={`feature-story-card feature-story-${feature.visual}`}>
              <div className="feature-story-copy">
                <span className="feature-story-tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
              <FeatureVisual type={feature.visual} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
