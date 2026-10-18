// Conventional rules and parser options are inlined so this config resolves
// with just `npx @commitlint/cli` (no @commitlint/config-conventional install
// needed). Without `parserPreset.parserOpts`, commitlint never extracts the
// `type`, which makes the `type-enum` rule a silent no-op.
export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
      noteKeywords: ['BREAKING CHANGE', 'BREAKING-CHANGE'],
      revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
      revertCorrespondence: ['header', 'hash'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 120],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};