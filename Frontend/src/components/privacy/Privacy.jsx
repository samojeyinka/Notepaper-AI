import React from 'react'
import { PrivacyHero } from './PrivacyHero'
import { GoldenRule } from './GoldenRule'
import { ThreePillars } from './ThreePillars'
import { FinePrint } from './FinePrint'
import { DataSecurityCTA } from './DataSecurityCTA'

const Privacy = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-8 md:pt-16 pb-20 md:pb-28">
      <PrivacyHero />
      <GoldenRule />
      <ThreePillars />
      <FinePrint />
      <DataSecurityCTA />
    </div>
  )
}

export default Privacy
