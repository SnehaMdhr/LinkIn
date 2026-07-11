import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaGlobe,
  FaLink,
} from "react-icons/fa";
import { SiTiktok } from "react-icons/si";

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: SiTiktok,
  youtube: FaYoutube,
  portfolio: FaGlobe,
  website: FaGlobe,
  other: FaLink,
};

export default function PlatformIcon({ platform, className = "w-4 h-4" }) {
  const key = platform?.toLowerCase().trim();
  const Icon = iconMap[key] || FaLink;

  return <Icon className={className} />;
}
