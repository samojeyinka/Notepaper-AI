import React from 'react';

const STORY = [
  { number: '01', tag: 'THE START', title: 'A better place to put your thoughts', body: 'A good notebook gives ideas somewhere to land. We wanted the same calm feeling on screen, with room for handwriting, typed notes, and the small thoughts that become something bigger.' },
  { number: '02', tag: 'THE QUESTION', title: 'What happens after the page is full?', body: 'Students collect pages of useful material, then face the extra work of turning it into a way to study. We asked how the notebook itself could help with that next part.' },
  { number: '03', tag: 'THE ANSWER', title: 'Keep the notes. Make them useful.', body: 'NotepaperAI connects the act of writing with study plans, flashcards, and quizzes. Your notes stay at the center while the tools help you return to what matters.' },
];

export default function StorySection() {
  return (
    <section className="about-story py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="about-story-intro"><p className="landing-kicker">WHY WE STARTED</p><h2>There is a moment between<br /><span>writing and remembering.</span></h2></div>
        <div className="about-story-list">
          {STORY.map((item) => <article key={item.number} className="about-story-row"><span className="about-story-number">{item.number}</span><div className="about-story-title"><p className="landing-kicker">{item.tag}</p><h3>{item.title}</h3></div><p className="about-story-body">{item.body}</p></article>)}
        </div>
      </div>
    </section>
  );
}
