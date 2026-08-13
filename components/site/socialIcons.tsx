import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import {
  SiX,
  SiUpwork,
  SiFiverr,
  SiFacebook,
  SiInstagram,
  SiYoutube,
  SiDribbble,
  SiBehance,
  SiPinterest,
  SiTiktok,
  SiWhatsapp,
  SiTelegram,
  SiDiscord,
  SiMedium,
  SiStackoverflow,
  SiDevdotto,
  SiReddit,
  SiThreads,
  SiMastodon,
  SiSnapchat,
  SiTwitch,
  SiVimeo,
  SiSpotify,
  SiPatreon,
  SiBuymeacoffee,
} from "react-icons/si";
import { TbBrandFiverr } from "react-icons/tb";
import { Globe } from "lucide-react";

export interface SocialPlatform {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "github",
    label: "GitHub",
    icon: FaGithub,
    placeholder: "https://github.com/username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: SiX,
    placeholder: "https://x.com/username",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: SiFacebook,
    placeholder: "https://facebook.com/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: SiInstagram,
    placeholder: "https://instagram.com/username",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: SiYoutube,
    placeholder: "https://youtube.com/@username",
  },
  {
    key: "upwork",
    label: "Upwork",
    icon: SiUpwork,
    placeholder: "https://upwork.com/freelancers/~yourid",
  },
  {
    key: "fiverr",
    label: "Fiverr",
    icon: TbBrandFiverr,
    placeholder: "https://fiverr.com/username",
  },
  {
    key: "dribbble",
    label: "Dribbble",
    icon: SiDribbble,
    placeholder: "https://dribbble.com/username",
  },
  {
    key: "behance",
    label: "Behance",
    icon: SiBehance,
    placeholder: "https://behance.net/username",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: SiPinterest,
    placeholder: "https://pinterest.com/username",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: SiTiktok,
    placeholder: "https://tiktok.com/@username",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: SiWhatsapp,
    placeholder: "https://wa.me/8801XXXXXXXXX",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: SiTelegram,
    placeholder: "https://t.me/username",
  },
  {
    key: "discord",
    label: "Discord",
    icon: SiDiscord,
    placeholder: "https://discord.gg/invite",
  },
  {
    key: "medium",
    label: "Medium",
    icon: SiMedium,
    placeholder: "https://medium.com/@username",
  },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    icon: SiStackoverflow,
    placeholder: "https://stackoverflow.com/users/...",
  },
  {
    key: "devto",
    label: "Dev.to",
    icon: SiDevdotto,
    placeholder: "https://dev.to/username",
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: SiReddit,
    placeholder: "https://reddit.com/u/username",
  },
  {
    key: "threads",
    label: "Threads",
    icon: SiThreads,
    placeholder: "https://threads.net/@username",
  },
  {
    key: "mastodon",
    label: "Mastodon",
    icon: SiMastodon,
    placeholder: "https://mastodon.social/@username",
  },
  {
    key: "snapchat",
    label: "Snapchat",
    icon: SiSnapchat,
    placeholder: "https://snapchat.com/add/username",
  },
  {
    key: "twitch",
    label: "Twitch",
    icon: SiTwitch,
    placeholder: "https://twitch.tv/username",
  },
  {
    key: "vimeo",
    label: "Vimeo",
    icon: SiVimeo,
    placeholder: "https://vimeo.com/username",
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: SiSpotify,
    placeholder: "https://open.spotify.com/artist/...",
  },
  {
    key: "patreon",
    label: "Patreon",
    icon: SiPatreon,
    placeholder: "https://patreon.com/username",
  },
  {
    key: "buymeacoffee",
    label: "Buy Me a Coffee",
    icon: SiBuymeacoffee,
    placeholder: "https://buymeacoffee.com/username",
  },
  {
    key: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com",
  },
];

const SOCIAL_PLATFORM_MAP: Record<string, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p]),
);

export function getSocialPlatform(key: string): SocialPlatform {
  return (
    SOCIAL_PLATFORM_MAP[key] ?? {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: Globe,
      placeholder: "https://…",
    }
  );
}
