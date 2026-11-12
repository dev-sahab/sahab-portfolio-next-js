import LegalDocument from '@/components/v8/pages/legal/LegalDocument'
import { cookiePolicy } from '@/content/v8/legal'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'

export const metadata = pageMetadata({ title: cookiePolicy.title, description: cookiePolicy.description, path: routes.cookies })

export default function Page() {
  return <LegalDocument doc={cookiePolicy} />
}
