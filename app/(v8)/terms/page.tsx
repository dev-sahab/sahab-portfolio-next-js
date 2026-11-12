import LegalDocument from '@/components/v8/pages/legal/LegalDocument'
import { termsOfService } from '@/content/v8/legal'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'

export const metadata = pageMetadata({ title: termsOfService.title, description: termsOfService.description, path: routes.terms })

export default function Page() {
  return <LegalDocument doc={termsOfService} />
}
