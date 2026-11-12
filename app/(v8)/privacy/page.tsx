import LegalDocument from '@/components/v8/pages/legal/LegalDocument'
import { privacyPolicy } from '@/content/v8/legal'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'

export const metadata = pageMetadata({ title: privacyPolicy.title, description: privacyPolicy.description, path: routes.privacy })

export default function Page() {
  return <LegalDocument doc={privacyPolicy} />
}
