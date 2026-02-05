import React from 'react'
import { PrivacyHero } from './PrivacyHero'
import { GoldenRule } from './GoldenRule'
import { ThreePillars } from './ThreePillars'
import { FinePrint } from './FinePrint'
import { DataSecurityCTA } from './DataSecurityCTA'

const Privacy = () => {
  return (
    <div className='max-w-6xl mx-auto'>
    <PrivacyHero/>
    <GoldenRule/>
    <ThreePillars/>
    <FinePrint/>
    <DataSecurityCTA/>
    </div>
  )
}

export default Privacy