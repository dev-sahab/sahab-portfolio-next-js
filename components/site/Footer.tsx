import type { SiteSettings as ISettings } from "@/types";
import Link from "next/link";
import { getSocialPlatform } from "./socialIcons";
import "./Footer.scss";

const defaultPages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/get-quote", label: "Get a Quote" },
];

const defaultServices = [
  "WordPress Development",
  "Webflow Builds",
  "WooCommerce",
  "MERN Stack",
  "Figma → Code",
].map((s) => ({ href: "/contact", label: s }));

const defaultLegal = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer({ settings }: { settings?: ISettings | null }) {
  const social = settings?.social;
  const footerMenu = settings?.footerMenu && settings.footerMenu.length > 0
    ? [...settings.footerMenu].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : null;
  const menuByColumn = (column: string, fallback: { href: string; label: string }[]) => {
    if (!footerMenu) return fallback;
    const items = footerMenu.filter((item) => (item.column || "Pages") === column);
    return items.length > 0 ? items : fallback;
  };
  const pagesCol = menuByColumn("Pages", defaultPages);
  const servicesCol = menuByColumn("Services", defaultServices);
  const legalCol = menuByColumn("Legal", defaultLegal);
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">
              {settings?.siteTitle || "Sahab"}
              {!settings?.siteTitle && <span className="footer-brand-dot">.</span>}
            </div>
            <p className="footer-tagline">
              {settings?.footerTagline ||
                "Building digital products that move businesses forward — one pixel at a time."}
            </p>
            <div className="footer-social">
              {(social || []).map(({ platform, url }) => {
                if (!url) return null;
                const { label, icon: Icon } = getSocialPlatform(platform);
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-col">
            <h4>Pages</h4>
            <ul>
              {pagesCol.map((p) => (
                <li key={p.href + p.label}>
                  <Link href={p.href}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              {servicesCol.map((s) => (
                <li key={s.href + s.label}>
                  <Link href={s.href}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              {legalCol.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{settings?.footerCopyright || `© ${year} ${settings?.siteTitle || "Sahab Uddin Mintu"}. All rights reserved.`}</p>
          <p className="footer-credit">
            Built with <span className="footer-credit-heart">♥</span> & strong coffee
          </p>
        </div>
      </div>
    </footer>
  );
}
