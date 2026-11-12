import Hero from '@/components/v8/sections/hero/Hero'
import ToolsMarquee from '@/components/v8/sections/tools/ToolsMarquee'
import SelectedWork from '@/components/v8/sections/work/SelectedWork'
import Services from '@/components/v8/sections/services/Services'
import About from '@/components/v8/sections/about/About'
import Reviews from '@/components/v8/sections/reviews/Reviews'
import Faq from '@/components/v8/sections/faq/Faq'
import Contact from '@/components/v8/sections/contact/Contact'
import JsonLd from '@/components/v8/ui/JsonLd'
import { personSchema, websiteSchema } from '@/lib/v8/seo'

/** v8 homepage (Figma: "Home v8 · Desktop 1440"). All content is static — see content/v8. */
export default function V8HomePage() {
  return (
    <>
      <Hero />
      <ToolsMarquee />
      <SelectedWork />
      <Services />
      <About />
      <Reviews />
      <Faq />
      <Contact />
      <JsonLd data={[websiteSchema(), personSchema()]} />
    </>
  )
}
