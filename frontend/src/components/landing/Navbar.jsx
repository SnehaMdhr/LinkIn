import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import ThemeDropdown from "../ThemeDropdown";
import logo from "../../assets/logo_only.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

function Navbar({ onLoginOpen, onRegisterOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="LinkIn" className="h-10 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-black dark:text-white">Link</span>
            <span className="text-[#AFF33E]">In</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeDropdown />
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={onLoginOpen}
          >
            Login
          </Button>
          <Button size="sm" onClick={onRegisterOpen}>
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
