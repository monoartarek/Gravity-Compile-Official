import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/gc_logo.png";

const navLinks = [
  { name: "Services", path: "/services" },
  { name: "Tech", path: "/tech" },
  { name: "Projects", path: "/projects" },
  { name: "Process", path: "/process" },
  { name: "Team", path: "/team" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__container">

        {/* LEFT — Logo + Name */}
        <NavLink to="/" className="navbar__brand" onClick={handleLinkClick}>
          {/* <div className="navbar__logo">GC</div> */}
          <img src={logo} alt="Gravity Compile" className="navbar__logo-img" />
          <span className="navbar__company-name">Gravity Compile</span>
        </NavLink>

        {/* CENTER/RIGHT — Desktop Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/contact" className="navbar__cta">
              Get Started
            </NavLink>
          </li>
        </ul>

        {/* RIGHT — Hamburger (mobile only) */}
        <button
          className={`navbar__hamburger ${menuOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`navbar__mobile-menu ${menuOpen ? "navbar__mobile-menu--open" : ""}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `navbar__mobile-link ${isActive ? "navbar__mobile-link--active" : ""}`
                }
                onClick={handleLinkClick}
              >
                {link.name}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/contact" className="navbar__mobile-cta" onClick={handleLinkClick}>
              Get Started
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}