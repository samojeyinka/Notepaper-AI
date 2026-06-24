import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'
import CustomerSupport from '../components/globals/CustomerSupport'
import { HelpSupport } from '../components/HelpSupport'
import SEO from '../components/globals/SEO'

const HelpSupportPage = () => {
  return (
    <>
      <SEO
        title="Help & Support"
        path="/help-&-support"
        description="Need help with Notepaper AI? Browse our support resources or open a ticket with the team."
      />
    <Header/>
        <HelpSupport/>
      <CustomerSupport/>
    <Footer/>
    </>
  )
}

export default HelpSupportPage