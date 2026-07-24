// import Nav from '../components/Nav'
// import Hero from '../components/Hero'
// import ProductShowcase from '../components/ProductShowcase'
// import Capabilities from '../components/Capabilities'
// import TrustMetrics from '../components/TrustMetrics'
// import HowItWorks from '../components/HowItWorks'
// import ThreeQuestions from '../components/ThreeQuestions'
// import BrokerBanner from '../components/BrokerBanner'
// import Faq from '../components/Faq'
// import FinalCta from '../components/FinalCta'
// import Footer from '../components/Footer'

// function App() {
//   return (
//     <div className="bg-cream text-ink">
//       <Nav />
//       <Hero />
//       <ProductShowcase />
//       <Capabilities />
//       <TrustMetrics />
//       <HowItWorks />
//       <ThreeQuestions />
//       <BrokerBanner />
//       <Faq />
//       <FinalCta />
//       <Footer />
//     </div>
//   )
// }

// export default App





















import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null
      if (user) {
        window.location.href = "https://beta.acqar.com/chat"
      } else {
        setCheckingAuth(false)
      }
    })
  }, [])

  if (checkingAuth) return null

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
