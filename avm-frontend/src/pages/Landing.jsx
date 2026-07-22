import Nav from '../components/Nav'
import Hero from '../components/Hero'
import ProductShowcase from '../components/ProductShowcase'
import Capabilities from '../components/Capabilities'
import TrustMetrics from '../components/TrustMetrics'
import HowItWorks from '../components/HowItWorks'
import ThreeQuestions from '../components/ThreeQuestions'
import BrokerBanner from '../components/BrokerBanner'
import Faq from '../components/Faq'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'

function App() {
  return (
    <div className="bg-cream text-ink">
      <Nav />
      <Hero />
      <ProductShowcase />
      <Capabilities />
      <TrustMetrics />
      <HowItWorks />
      <ThreeQuestions />
      <BrokerBanner />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  )
}

export default App
