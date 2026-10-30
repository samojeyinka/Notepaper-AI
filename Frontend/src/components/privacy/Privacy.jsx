import React from 'react'
import { PrivacyHero } from './PrivacyHero'
import { GoldenRule } from './GoldenRule'
import { ThreePillars } from './ThreePillars'
import { FinePrint } from './FinePrint'
import { DataSecurityCTA } from './DataSecurityCTA'

const Privacy = () => {
  return (
    <main className="privacy-document max-w-7xl mx-auto px-5 sm:px-6 pt-12 md:pt-20 pb-20 md:pb-28">
      <PrivacyHero />
      <GoldenRule />
      <ThreePillars />
      <FinePrint />
      <DataSecurityCTA />
    </main>
  )
}

export default Privacy
