import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Notepaper AI'
const BASE_URL = 'https://notepaperai.synchrome.co'
const DEFAULT_OG_IMAGE = 'https://notepaperai.synchrome.co/og/default.png'
const DEFAULT_DESCRIPTION =
  'Write like it’s paper. See it become something more with study plans, flashcards, and quizzes.'

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}) {
  const fullTitle = title
    ? `${title}: ${SITE_NAME}`
    : `${SITE_NAME}: Write like paper. Learn beyond it.`

  const canonical = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@notepaperai" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
