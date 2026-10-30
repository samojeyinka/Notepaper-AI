import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import { HelpSupport } from '../components/HelpSupport'
import SEO from '../components/globals/SEO'
import '@/styles/Landing.css'

const HelpSupportPage = () => {
  return (
    <div className="landing-page help-support-page bg-paper font-display text-stone-900 antialiased">
      <SEO
        title="Help & Support"
        path="/help-&-support"
        description="Need help with Notepaper? Browse our guides and answers, or open a ticket with the team."
      />
      <Header />
      <HelpSupport />
      <CustomerSupport />
      <Footer />
    </div>
  )
}

export default HelpSupportPage
