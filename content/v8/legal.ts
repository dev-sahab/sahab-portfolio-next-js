import { TRACKING_TOOLS } from '@/lib/v8/consent'
import { site } from './site'

/**
 * Privacy Policy, Terms of Service and Cookie Policy, written for a
 * worldwide client base with a focus on the US, UK and EU.
 *
 * Grounded in what the code actually does: forms → MongoDB + Resend email,
 * hosting on Vercel, images on Cloudinary, theme choice in local storage, a
 * login cookie for the dashboard only, and analytics / marketing tools that
 * load only after consent (lib/v8/consent.ts — the lists below describe
 * every tool in TRACKING_TOOLS).
 *
 * Research notes (2026-11-12): privacy text follows GDPR / UK GDPR Art. 13
 * (controller, purposes + legal bases incl. the legitimate interest,
 * recipients, international transfers, retention, rights, complaint);
 * US: CCPA/CPRA-style rights + "no sale/sharing" + Global Privacy Control;
 * cookies: consent before non-essential cookies (ePrivacy / PECR), equal
 * accept/reject; the theme preference fits the UK 2025 PECR
 * "appearance/preferences" exception.
 *
 * review: a plain-language starting point, not legal advice. Have it
 * checked before launch and bump `updated` on every change.
 */

export type LegalBlock = string | { list: string[] } | { tools: true }

export interface LegalSection {
  id: string
  heading: string
  body: LegalBlock[]
}

export interface LegalDoc {
  key: 'privacy' | 'terms' | 'cookies'
  title: string
  /** Rich heading for the page hero. */
  heroTitle: string
  description: string
  /** ISO date. */
  updated: string
  intro: string
  sections: LegalSection[]
}

const UPDATED = '2026-11-12'
// The policies describe every tool the site uses (lib/v8/consent.ts), whether
// or not its ID is set yet — Sahab runs analytics and marketing tools.
const DECLARED = TRACKING_TOOLS
const usesTracking = DECLARED.length > 0
const toolNames = new Intl.ListFormat('en', { type: 'conjunction' }).format(DECLARED.map((t) => t.name))
const usesMarketing = DECLARED.some((t) => t.category === 'marketing')

// ── Privacy Policy ──
export const privacyPolicy: LegalDoc = {
  key: 'privacy',
  title: 'Privacy Policy',
  heroTitle: 'Privacy, *in plain words.*',
  description: `How ${site.name} collects, uses and protects your information, with your rights under GDPR, UK GDPR and US state privacy laws.`,
  updated: UPDATED,
  intro: usesTracking
    ? 'This site collects only what you choose to send through a form, plus analytics and marketing data if you allow it in the cookie settings. Your details are never sold.'
    : 'This site collects only what you choose to send through a form. There are no analytics, no ad trackers and no third-party cookies, and your details are never sold.',
  sections: [
    {
      id: 'who',
      heading: 'Who is responsible',
      body: [
        `This website is run by ${site.legalName} (“${site.name}”, “I”), an independent web developer working with clients in the US, UK, Europe and worldwide. I decide how your information is used, which makes me the data controller. Questions or requests: ${site.email}.`,
      ],
    },
    {
      id: 'what',
      heading: 'What I collect',
      body: [
        '**Information you send me.** When you use the contact or quote form, or email me directly:',
        {
          list: [
            'Your name and email address (needed so I can reply)',
            'Project details you choose to add: type of project, budget range, timeline, website link and your message',
          ],
        },
        '**Technical data.** The hosting provider briefly processes your IP address and browser details to deliver pages and keep the site secure. Your IP address is also used, in memory and for a few minutes only, to stop the forms being spammed. It isn’t stored with your message.',
        usesTracking
          ? `**Analytics and marketing data, only with your consent.** If you allow it in the cookie settings, ${toolNames} collect information such as the pages you visit, how you found the site, your device and approximate location. See the Cookie Policy for details.`
          : '**No analytics or tracking.** No analytics, advertising or social media tools run on this site today. If that changes, they will only load after you give consent, and this policy will be updated first.',
        'Please don’t send payment details, passwords or other sensitive information through the forms.',
      ],
    },
    {
      id: 'why',
      heading: 'Why I use it, and the legal basis',
      body: [
        {
          list: [
            '**Replying to your enquiry and preparing a quote:** because you asked me to (steps before a possible contract).',
            '**Working on your project** if you go ahead: to perform our agreement.',
            '**Keeping the site and forms secure and spam-free:** my legitimate interest in running a safe website, which doesn’t override your privacy because only the minimum is processed, briefly.',
            ...(usesTracking ? ['**Analytics and advertising measurement:** your consent, which you can withdraw at any time in the cookie settings.'] : []),
          ],
        },
        'No decisions about you are made by automated means, and I won’t add you to a mailing list without asking.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Who else handles it',
      body: [
        'Trusted service providers process data on my behalf, under contract and only to run this website:',
        {
          list: [
            'Vercel (website hosting)',
            'MongoDB Atlas (stores form messages)',
            'Resend (delivers the email I receive when you send a form)',
            'Cloudinary (stores and serves the site’s images; receives no form data)',
            ...DECLARED.map((t) => `${t.provider} (${t.name}), only if you allow ${t.category}`),
          ],
        },
        'If we work together, I may share project details with the design, SEO or marketing partners I bring in, but only with your agreement and only what they need.',
        'I may also disclose information if the law requires it, or to protect the site and its users from fraud or abuse.',
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      body: [
        'I work remotely from outside the UK and EU, and the providers above run servers in several countries, including the United States. When your information leaves the UK or EU, it’s protected by recognized safeguards such as the EU Standard Contractual Clauses, the UK International Data Transfer Addendum, or the EU-US Data Privacy Framework where the provider is certified.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long I keep it',
      body: [
        // review: confirm the retention periods.
        {
          list: [
            'Enquiries that don’t become a project: deleted within 24 months of our last contact.',
            'Client project correspondence: kept for as long as needed to support the work and meet legal, tax and accounting duties (usually up to 6 years).',
            ...(usesTracking ? ['Analytics and marketing data: kept by those tools for the periods shown in the Cookie Policy.'] : []),
          ],
        },
        'You can ask me to delete your details sooner at any time.',
      ],
    },
    {
      id: 'eu-uk-rights',
      heading: 'Your rights (EU, UK and elsewhere)',
      body: [
        'You can ask me to:',
        {
          list: [
            'Give you a copy of the information I hold about you',
            'Correct it if it’s wrong, or delete it',
            'Restrict or object to how it’s used',
            'Send it to you or another service in a portable format',
            'Withdraw consent at any time, without affecting what happened before',
          ],
        },
        `Email ${site.email}. I reply within one month, usually much sooner, and may ask you to confirm your identity. You can also complain to your data protection authority: the ICO in the UK, or the supervisory authority where you live in the EU. I’d appreciate the chance to fix any concern first.`,
      ],
    },
    {
      id: 'us-rights',
      heading: 'US privacy rights',
      body: [
        'If you live in California or another US state with a consumer privacy law (such as Virginia, Colorado, Connecticut or Texas), you have the right to know what personal information I collect and why, to get a copy, to correct it, and to have it deleted. I won’t treat you differently for using these rights.',
        usesMarketing
          ? '**I don’t sell your personal information.** If you allow marketing cookies, advertising tools may count as “sharing” for targeted advertising under some state laws. You can opt out any time with “Reject all” in the cookie settings, and the site honours the Global Privacy Control (GPC) browser signal as an opt-out.'
          : '**I don’t sell or share your personal information** for targeted advertising, and the site honours the Global Privacy Control (GPC) browser signal.',
        `To make a request, email ${site.email}. You can also use an authorised agent.`,
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      body: [
        'The site runs over HTTPS with modern security headers, the forms are validated and rate-limited, and only I (and anyone I give dashboard access to) can read submitted messages. No system is perfectly secure, but your information is handled with care, and you’ll be told without undue delay if a breach ever puts it at risk.',
      ],
    },
    {
      id: 'children',
      heading: 'Children',
      body: ['This site is for businesses and adults. It isn’t aimed at children under 16, and I don’t knowingly collect their information.'],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      body: ['If this policy changes, the new version will be posted here with a new “last updated” date. Significant changes will be highlighted on this page.'],
    },
  ],
}

// ── Terms of Service ──
export const termsOfService: LegalDoc = {
  key: 'terms',
  title: 'Terms of Service',
  heroTitle: 'Terms of *using this site.*',
  description: `The terms for using ${site.name}'s website: content, portfolio work, quotes, links, liability and governing law.`,
  updated: UPDATED,
  intro:
    'These terms cover your use of this website. Each client project is governed by its own written quote and agreement, which takes priority if anything differs.',
  sections: [
    {
      id: 'use',
      heading: 'Using this website',
      body: [
        'You’re welcome to browse, read and share links to this site. By using it you agree not to:',
        {
          list: [
            'Try to break, overload or get unauthorised access to the site, its forms or its dashboard',
            'Use the forms to send spam, malware or harmful content',
            'Scrape or copy the site’s content in bulk, including to train AI models',
          ],
        },
      ],
    },
    {
      id: 'content',
      heading: 'Content and ownership',
      body: [
        `Unless stated otherwise, the text, design, code samples and original images on this site belong to ${site.legalName}. You may quote short parts of articles with a link back to the original. Please ask before reusing anything else.`,
        'Product names and logos (such as WordPress, Webflow or WooCommerce) belong to their owners and are used only to describe the tools I work with. No endorsement is implied.',
      ],
    },
    {
      id: 'portfolio',
      heading: 'Client work shown here',
      body: [
        'Projects in the portfolio are work made for clients. The client sites, their brands and content belong to those clients, and are shown as professional samples unless the client has asked otherwise. If you’re a client and want a project removed, email me and it will be taken down.',
      ],
    },
    {
      id: 'projects',
      heading: 'Quotes and project work',
      body: [
        'Sending a form doesn’t create a contract or any obligation. Every project gets a written quote covering scope, price, timeline and payment. Work starts only after you accept it, and that quote and agreement then govern the project, including payment, revisions, delivery and ownership of the finished work.',
      ],
    },
    {
      id: 'accuracy',
      heading: 'Information on this site',
      body: [
        'Articles and guides are shared in good faith for general information and aren’t professional advice for your situation. Platforms change quickly, so check details before relying on them. Services, prices and timelines on the site are indicative until confirmed in a quote.',
      ],
    },
    {
      id: 'links',
      heading: 'Links to other websites',
      body: ['This site links to client websites and other services. I’m not responsible for their content, availability or privacy practices.'],
    },
    {
      id: 'liability',
      heading: 'Disclaimer and liability',
      body: [
        'The site is provided “as is” and “as available”, and may occasionally be unavailable. To the extent the law allows, I’m not liable for indirect or consequential losses arising from your use of the site or from relying on its content.',
        'Nothing in these terms limits liability that can’t legally be limited, or your statutory rights as a consumer in your country, including in the UK and EU.',
      ],
    },
    {
      id: 'law',
      heading: 'Governing law',
      body: [
        // review: confirm the governing law with a lawyer.
        'These website terms are governed by the laws of the country where the business is based. If you use the site as a consumer, you keep the protection of the mandatory laws of the country where you live, and you can bring a claim in your local courts. For client projects, the governing law is set in each project agreement.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes and contact',
      body: [
        `These terms may be updated from time to time; the date above shows the current version. If any part is found unenforceable, the rest still applies. Questions? Email ${site.email}.`,
      ],
    },
  ],
}

// ── Cookie Policy ──
export const cookiePolicy: LegalDoc = {
  key: 'cookies',
  title: 'Cookie Policy',
  heroTitle: usesTracking ? 'Cookies, *only with your OK.*' : 'No tracking cookies. *Really.*',
  description: usesTracking
    ? `Which cookies ${site.name}'s website uses, why, and how to change your choice at any time.`
    : `${site.name}'s website uses no tracking or advertising cookies. Here's exactly what is stored in your browser, and why.`,
  updated: UPDATED,
  intro: usesTracking
    ? 'Only strictly necessary storage is used by default. Analytics and marketing cookies are set only after you allow them, and you can change your mind at any time.'
    : 'This site uses no analytics, advertising or social media cookies, so there’s no cookie banner to click through. Here’s the complete list of what is stored, and why.',
  sections: [
    {
      id: 'what',
      heading: 'What cookies are',
      body: [
        'Cookies and similar technologies (like local storage) are small pieces of data a website saves in your browser. Some are needed for the site to work; others, like analytics and advertising cookies, are optional and need your consent in the UK and EU.',
      ],
    },
    {
      id: 'necessary',
      heading: 'Strictly necessary (always on)',
      body: [
        {
          list: [
            '`sahab-theme` (local storage): remembers whether you chose the light or dark theme. Saved only when you click the theme switch, never leaves your browser, contains nothing about you.',
            ...(usesTracking ? ['`sahab-consent` (local storage): remembers your cookie choices so you aren’t asked on every page.'] : []),
            'Sign-in cookies (dashboard only): keep site admins logged in and protect the login form. Visitors never receive them.',
          ],
        },
        'These don’t need consent because they only adapt the site to a choice you made, or are required for a service you asked for.',
      ],
    },
    {
      id: 'optional',
      heading: 'Analytics and marketing (only with consent)',
      body: usesTracking
        ? [
            'These tools load only if you allow their category in the cookie settings:',
            { tools: true },
            'Google Search Console and similar SEO tools work from Google’s side and set no cookies in your browser.',
          ]
        : [
            'None are used today. If analytics or marketing tools are added, they will load only after you allow them in a cookie banner, and the tools and cookies will be listed here first.',
          ],
    },
    {
      id: 'choices',
      heading: 'Changing your choice',
      body: usesTracking
        ? [
            'Use “Cookie settings” in the footer to change or withdraw your consent at any time. Withdrawing removes those cookies and reloads the page without the tools.',
            'If your browser sends a Global Privacy Control (GPC) signal, marketing cookies stay off unless you switch them on yourself. You can also clear cookies and local storage in your browser settings.',
          ]
        : ['You can clear cookies and local storage at any time in your browser settings. The site works without them; it will simply forget your theme choice.'],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      body: ['When tools are added or removed, this page is updated first and you’ll be asked for your choice again.'],
    },
  ],
}

export const legalDocs = [privacyPolicy, termsOfService, cookiePolicy]
