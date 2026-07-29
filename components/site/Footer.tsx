import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import type { SiteSettings as ISettings } from "@/types";
import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { SiUpwork, SiX } from "react-icons/si";

async function getSettings() {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    return { settings };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

const pages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/get-quote", label: "Get a Quote" },
];

const services = [
  "WordPress Development",
  "Webflow Builds",
  "WooCommerce",
  "MERN Stack",
  "Figma → Code",
];

export default async function Footer() {
  const { settings } = (await getSettings()) as { settings: ISettings | null };
  const social = settings?.social;
  const socialIcons: Record<string, React.ReactNode> = {
    github: <FaGithub />,
    linkedin: <FaLinkedinIn />,
    twitter: <SiX />, // X (Twitter)
    upwork: <SiUpwork />,
  };
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <div className="footer-top">
          <div>
            <div
              style={{
                fontFamily: "var(--f-d)",
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: "-.02em",
                marginBottom: 11,
              }}
            >
              Sahab<span style={{ color: "var(--accent)" }}>.</span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text2)",
                lineHeight: 1.62,
                marginBottom: 20,
                maxWidth: 245,
              }}
            >
              Building digital products that move businesses forward — one pixel
              at a time.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {Object.entries(social || {}).map(
                ([key, value]) =>
                  value && (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      style={{
                        width: 36,
                        height: 36,
                        border: "1px solid var(--border2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontFamily: "var(--f-m)",
                        color: "var(--text2)",
                        transition: "border-color .3s, color .3s",
                      }}
                    >
                      {socialIcons[key] ?? key.slice(0, 2).toUpperCase()}
                    </a>
                  ),
              )}
            </div>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--f-m)",
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 17,
              }}
            >
              Pages
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {pages.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    style={{
                      fontSize: 14,
                      color: "var(--text2)",
                      transition: "color .3s",
                    }}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--f-m)",
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 17,
              }}
            >
              Services
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/contact"
                    style={{
                      fontSize: 14,
                      color: "var(--text2)",
                      transition: "color .3s",
                    }}
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontFamily: "var(--f-m)",
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 17,
              }}
            >
              Legal
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <li>
                <Link
                  href="/privacy-policy"
                  style={{ fontSize: 14, color: "var(--text2)" }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  style={{ fontSize: 14, color: "var(--text2)" }}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 13,
          }}
        >
          <p
            style={{
              fontFamily: "var(--f-m)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            © {year} Sahab Uddin Mintu. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--f-m)",
              fontSize: 11,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Built with <span style={{ color: "var(--accent)" }}>♥</span> &
            strong coffee
          </p>
        </div>
      </div>
    </footer>
  );
}
