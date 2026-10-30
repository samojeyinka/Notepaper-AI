const fs = require('fs');

const files = [
  'Frontend/src/pages/FeaturesPage.jsx',
  'Frontend/src/pages/HowItWorksPage.jsx',
  'Frontend/src/pages/AboutUsPage.jsx',
  'Frontend/src/components/features/Features.jsx',
  'Frontend/src/components/features/FeaturesHero.jsx',
  'Frontend/src/components/features/FeaturesGrid.jsx',
  'Frontend/src/components/features/FeaturesShowcase.jsx',
  'Frontend/src/components/how-it-works/HowItWorksHero.jsx',
  'Frontend/src/components/how-it-works/HowItWorksSteps.jsx',
  'Frontend/src/components/about/AboutHero.jsx',
  'Frontend/src/components/about/StorySection.jsx',
  'Frontend/src/components/about/ValuesSection.jsx',
  'Frontend/src/components/landing/CTA.jsx'
];

let issues = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check if this line is an import, comment, or className/attribute
    const trimmed = line.trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    
    // Check for hyphens or dashes or semicolons in JSX visible text or strings
    // If line has title:, description:, body:, summary:, preview...
    const dataMatch = line.match(/(title|description|body|summary|previewTitle|previewSubtitle|previewContent|previewMeta|tag|kicker|badge|headingText|bodyText|buttonText)\s*[:=]\s*['"`](.*?)['"`]/);
    if (dataMatch) {
      const text = dataMatch[2];
      if (/[-–—;]/.test(text)) {
        console.log(`[DATA] ${file}:${idx + 1} -> ${text}`);
        issues++;
      }
    }

    // Also check visible text between tags: >Some text<
    const tagMatches = line.matchAll(/>([^<>{}]*)</g);
    for (const m of tagMatches) {
      const text = m[1].trim();
      if (text && /[-–—;]/.test(text)) {
        console.log(`[JSX TEXT] ${file}:${idx + 1} -> ${text}`);
        issues++;
      }
    }
  });
}

if (issues === 0) {
  console.log('SUCCESS: No hyphens, dashes, or semicolons found in visible copy!');
} else {
  console.log(`Found ${issues} issue(s).`);
}
