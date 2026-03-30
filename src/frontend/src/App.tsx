import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal } from "./hooks/useScrollReveal";

const PHONE_PRIMARY = "+919363916363";
const WA_BASE = "https://wa.me/919363916363";
const waLink = (msg: string) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;

// ─── Animated Counter ───────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const num = Number.parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/[\d]/g, "");
  const count = useCountUp(num, 1800, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div
        className="text-2xl font-bold font-serif"
        style={{ color: "#C9A84C" }}
      >
        {visible ? count : 0}
        {suffix}
      </div>
      <div className="text-xs" style={{ color: "#C8D4E0" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Image Lightbox ──────────────────────────────────────────────────────────
function Lightbox({
  src,
  alt,
  onClose,
}: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="lightbox.modal"
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white text-3xl font-bold z-10 w-10 h-10 flex items-center justify-center rounded-full"
        style={{
          background: "rgba(201,168,76,0.3)",
          border: "1px solid rgba(201,168,76,0.5)",
        }}
        onClick={onClose}
        data-ocid="lightbox.close_button"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-xl object-contain"
        style={{ border: "2px solid rgba(201,168,76,0.4)" }}
      />
    </div>
  );
}

// ─── Project Carousel ────────────────────────────────────────────────────────
interface CarouselImage {
  src: string;
  label: string;
  location: string;
}

function ProjectCarousel({
  title,
  images,
}: { title: string; images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [lightbox, setLightbox] = useState<CarouselImage | null>(null);
  const total = images.length;
  const perPage = 3;
  const maxIndex = Math.max(0, total - perPage);

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent(idx);
      setTimeout(() => setAnimating(false), 500);
    },
    [animating],
  );

  const prev = useCallback(() => {
    goTo(current <= 0 ? maxIndex : current - 1);
  }, [current, maxIndex, goTo]);

  const next = useCallback(() => {
    goTo(current >= maxIndex ? 0 : current + 1);
  }, [current, maxIndex, goTo]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const visible = images.slice(current, current + perPage);
  const displayed =
    visible.length < perPage
      ? [...visible, ...images.slice(0, perPage - visible.length)]
      : visible;

  return (
    <div className="mb-16 reveal-on-scroll">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: "#C9A84C" }}
        />
        <h3 className="font-serif text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="relative overflow-hidden">
        {/* Images grid with slide animation */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          style={{
            transition: "opacity 0.5s ease, transform 0.5s ease",
            opacity: animating ? 0.6 : 1,
            transform: animating ? "translateX(-8px)" : "translateX(0)",
          }}
        >
          {displayed.map((img, i) => (
            <button
              type="button"
              key={`${title}-${current}-${img.label}`}
              className="relative rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 text-left w-full"
              style={{
                border: "1px solid rgba(201,168,76,0.25)",
                height: "260px",
                background: "transparent",
                padding: 0,
              }}
              onClick={() => setLightbox(img)}
              data-ocid={`projects.item.${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,22,40,0.85) 0%, rgba(10,22,40,0.1) 60%)",
                }}
              />
              {/* Zoom icon */}
              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(201,168,76,0.9)" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0A1628"
                  strokeWidth={2.5}
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zM11 8v6M8 11h6" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="font-serif font-bold text-white text-sm mb-0.5">
                  {img.label}
                </div>
                <div className="text-xs" style={{ color: "#C9A84C" }}>
                  📍 {img.location}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={prev}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
            }}
            data-ocid="projects.pagination_prev"
          >
            ← Prev
          </button>

          <div className="flex gap-2 items-center">
            {Array.from({ length: maxIndex + 1 }, (_, idx) => idx).map(
              (idx) => (
                <button
                  type="button"
                  key={`dot-${idx}`}
                  onClick={() => goTo(idx)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: current === idx ? "24px" : "8px",
                    height: "8px",
                    background:
                      current === idx ? "#C9A84C" : "rgba(201,168,76,0.3)",
                  }}
                  data-ocid="projects.tab"
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ),
            )}
          </div>

          <button
            type="button"
            onClick={next}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              color: "#C9A84C",
            }}
            data-ocid="projects.pagination_next"
          >
            Next →
          </button>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

// ─── Navigation ────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Joint Venture", href: "#joint-venture" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,22,40,0.98)" : "rgba(10,22,40,0.85)",
        backdropFilter: "blur(16px)",
        boxShadow: scrolled ? "0 2px 32px rgba(0,0,0,0.5)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.2)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-3"
            data-ocid="nav.link"
          >
            <img
              src="/assets/uploads/img-20260329-wa0007-019d3b64-dc98-7339-be04-374137481145-1.jpg"
              alt="ARC Group Company Logo"
              className="w-12 h-12 rounded-full object-cover bg-white"
              style={{ border: "2px solid #C9A84C" }}
            />
            <div className="leading-tight">
              <div className="text-white font-bold text-sm tracking-wider">
                AL MAHARAJAH
              </div>
              <div
                className="text-xs tracking-widest"
                style={{ color: "#C9A84C" }}
              >
                PROPERTIES LLP
              </div>
              <div className="text-xs" style={{ color: "#9aaabb" }}>
                www.mrpllp.com
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 hover:text-white transition-colors font-medium tracking-wide"
                style={{ fontFamily: "DM Sans, sans-serif" }}
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              className="gold-btn px-5 py-2.5 rounded-lg text-sm uppercase tracking-widest"
              data-ocid="nav.primary_button"
            >
              Get Free Quote
            </a>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="lg:hidden pb-4"
            style={{ borderTop: "1px solid rgba(201,168,76,0.2)" }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-2 text-gray-300 hover:text-white transition-colors"
                data-ocid="nav.link"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gold-btn block mt-3 px-5 py-3 rounded-lg text-sm uppercase tracking-widest text-center w-full"
              data-ocid="nav.primary_button"
            >
              Get Free Quote
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const [videoModal, setVideoModal] = useState(false);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Full screen beach apartment background */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-beach-apartment.dim_1600x900.jpg"
          alt="Luxury Beachfront Multistorey Apartments"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        {/* Bright overlay - lighter to show off the vibrant beach/building image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.50) 55%, rgba(10,22,40,0.15) 100%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to top, #0d1f3c, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.5)",
              color: "#C9A84C",
            }}
          >
            <span>✦</span> 36+ Years Experience | Chennai Trusted Builder
          </div>

          <h1 className="font-serif leading-tight mb-4">
            <span
              className="block text-white"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
            >
              Building Your Dream Home
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                color: "#C9A84C",
              }}
            >
              with 36+ Years of Trust
            </span>
          </h1>

          <p className="text-lg mb-4" style={{ color: "#C8D4E0" }}>
            Expert Civil Engineers | Trusted Builders | Quality Construction
          </p>

          <div
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold mb-8"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
            }}
          >
            ⚡ Limited Projects Accepted Every Month
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href={`tel:${PHONE_PRIMARY}`}
              className="gold-btn px-6 py-3 rounded-lg text-sm uppercase tracking-wide font-bold"
              data-ocid="hero.primary_button"
            >
              📞 Call Now
            </a>
            <a
              href={waLink(
                "Hello! I want to enquire about construction services.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg text-sm uppercase tracking-wide font-bold transition-all hover:brightness-110"
              style={{ background: "#25D366", color: "#fff" }}
              data-ocid="hero.secondary_button"
            >
              💬 WhatsApp Now
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-lg text-sm uppercase tracking-wide font-bold transition-all hover:brightness-110"
              style={{
                background: "transparent",
                border: "2px solid rgba(201,168,76,0.6)",
                color: "#C9A84C",
              }}
              data-ocid="hero.secondary_button"
            >
              Get Free Consultation
            </a>
          </div>

          {/* Watch Our Work button */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setVideoModal(true)}
              className="flex items-center gap-3 group"
              data-ocid="hero.secondary_button"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: "rgba(201,168,76,0.9)",
                  boxShadow: "0 0 24px rgba(201,168,76,0.4)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="#0A1628"
                  className="w-5 h-5 ml-0.5"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span
                className="text-sm font-bold tracking-wide"
                style={{ color: "#C8D4E0" }}
              >
                Watch Our Work
              </span>
            </button>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap gap-6 pt-6"
            style={{ borderTop: "1px solid rgba(201,168,76,0.2)" }}
          >
            {[
              { value: "36+", label: "Years Experience" },
              { value: "100+", label: "Happy Clients" },
              { value: "500+", label: "Projects Completed" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-4">
                {i > 0 && (
                  <div
                    className="h-8 w-px"
                    style={{ background: "rgba(201,168,76,0.3)" }}
                  />
                )}
                <AnimatedStat value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setVideoModal(false)}
          onKeyDown={(e) => e.key === "Escape" && setVideoModal(false)}
          role="presentation"
          data-ocid="hero.modal"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl font-bold z-10 w-10 h-10 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(201,168,76,0.3)",
              border: "1px solid rgba(201,168,76,0.5)",
            }}
            onClick={() => setVideoModal(false)}
            data-ocid="hero.close_button"
          >
            ×
          </button>
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden"
            style={{ border: "2px solid rgba(201,168,76,0.4)" }}
          >
            <img
              src="/assets/generated/hero-beach-apartment.dim_1600x900.jpg"
              alt="Our Work"
              className="w-full object-cover"
              style={{ maxHeight: "80vh" }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(10,22,40,0.3)" }}
            >
              <div className="text-center">
                <div className="font-serif text-white text-2xl font-bold mb-2">
                  AL Maharajah Properties
                </div>
                <div style={{ color: "#C9A84C" }}>
                  36+ Years Building Dreams in Chennai
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── About ──────────────────────────────────────────────────────────────────
function About() {
  return (
    <section
      id="about"
      className="py-20 lg:py-28"
      style={{ background: "#0d1f3c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-on-scroll">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#C9A84C" }}
            >
              About Us
            </div>
            <h2 className="section-heading text-left mb-6">
              36+ Years of Building{" "}
              <span style={{ color: "#C9A84C" }}>Trust & Excellence</span>
            </h2>
            <div className="gold-divider" style={{ margin: "0 0 1.5rem 0" }} />
            <p className="mb-4 leading-relaxed" style={{ color: "#C8D4E0" }}>
              AL MAHARAJAH PROPERTIES LLP has been a cornerstone of Chennai's
              construction landscape for over three and a half decades. Founded
              on the principles of integrity, quality, and transparency, we have
              helped hundreds of families build their dream homes.
            </p>
            <p className="mb-4 leading-relaxed" style={{ color: "#C8D4E0" }}>
              Our team of expert civil engineers brings decades of hands-on
              experience to every project — from independent houses and luxury
              villas to large-scale apartment complexes and commercial joint
              ventures.
            </p>
            <p
              className="mb-6 leading-relaxed text-sm"
              style={{ color: "#C9A84C" }}
            >
              🌐{" "}
              <a
                href="https://www.mrpllp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-bold"
                style={{ color: "#C9A84C" }}
              >
                www.mrpllp.com
              </a>
            </p>

            {/* ARC GROUP badge */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-8"
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.5)",
              }}
            >
              <span style={{ color: "#C9A84C", fontSize: "1.2rem" }}>🏆</span>
              <div>
                <div
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "#C9A84C" }}
                >
                  Proud Partner
                </div>
                <div className="text-white font-bold text-sm">
                  ARC GROUP COMPANY
                </div>
              </div>
            </div>

            <div>
              <a
                href={waLink(
                  "Hello! I'd like to talk to your experts about construction.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-btn px-8 py-3 rounded-lg uppercase tracking-widest text-sm inline-block"
                data-ocid="about.primary_button"
              >
                Talk to Our Experts
              </a>
            </div>
          </div>

          <div className="reveal-on-scroll">
            <div
              className="p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h3
                className="text-lg font-bold font-serif mb-6"
                style={{ color: "#C9A84C" }}
              >
                Why Families Trust Us
              </h3>
              {[
                {
                  icon: "🏗️",
                  title: "36+ Years Experience",
                  desc: "Decades of proven excellence in civil construction across Chennai",
                },
                {
                  icon: "🏛️",
                  title: "Civil Engineering Foundation",
                  desc: "Deep technical expertise backed by qualified engineers",
                },
                {
                  icon: "🤝",
                  title: "Transparency First",
                  desc: "Clear contracts, honest pricing, no hidden surprises",
                },
                {
                  icon: "🌟",
                  title: "Long-Term Value",
                  desc: "Premium materials and construction that stand the test of time",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 mb-5 last:mb-0">
                  <div className="text-2xl shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <div className="font-bold text-white mb-1">
                      {item.title}
                    </div>
                    <div className="text-sm" style={{ color: "#C8D4E0" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Awards & Certifications Ticker */}
        <div className="mt-16 reveal-on-scroll">
          <div
            className="py-4 rounded-xl overflow-hidden"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <div className="ticker-wrapper">
              <div className="ticker-track">
                {[
                  "✦ ISO Certified",
                  "✦ RERA Compliant",
                  "✦ ARC Group Partner",
                  "✦ 36+ Years Experience",
                  "✦ 100+ Projects Delivered",
                  "✦ Chennai's Trusted Builder",
                  "✦ Award-Winning Construction",
                  "✦ Quality Guaranteed",
                  // Duplicate for seamless loop
                  "✦ ISO Certified",
                  "✦ RERA Compliant",
                  "✦ ARC Group Partner",
                  "✦ 36+ Years Experience",
                  "✦ 100+ Projects Delivered",
                  "✦ Chennai's Trusted Builder",
                  "✦ Award-Winning Construction",
                  "✦ Quality Guaranteed",
                ].map((item, i) => (
                  <span
                    key={`${item.replace(/\s/g, "")}-${i}`}
                    className="ticker-item text-xs font-bold uppercase tracking-widest px-6"
                    style={{ color: "#C9A84C" }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ──────────────────────────────────────────────────────────
function WhyChooseUs() {
  const cards = [
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      title: "36+ Years Experience",
      desc: "Decades of construction mastery in the Chennai market",
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      ),
      title: "Expert Civil Engineers",
      desc: "Qualified engineers with deep structural expertise",
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: "On-Time Delivery",
      desc: "Strict timelines with milestone-based project tracking",
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
      title: "Transparent Pricing",
      desc: "Clear quotes with no hidden costs or surprises",
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      ),
      title: "Premium Quality Materials",
      desc: "Only certified, high-grade materials from trusted suppliers",
    },
    {
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-8 h-8"
        >
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "ARC GROUP Partnership",
      desc: "Backed by the strength and reputation of ARC GROUP",
    },
  ];

  return (
    <section className="py-20 lg:py-28" style={{ background: "#122040" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Our Strengths
          </div>
          <h2 className="section-heading">
            Why Choose <span style={{ color: "#C9A84C" }}>Us</span>
          </h2>
          <div className="gold-divider" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="reveal-on-scroll p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
              style={{
                transitionDelay: `${i * 80}ms`,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="mb-4" style={{ color: "#C9A84C" }}>
                {card.icon}
              </div>
              <h3 className="font-bold text-white font-serif text-lg mb-2">
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#C8D4E0" }}
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────
function Services() {
  const services = [
    {
      icon: "🏠",
      title: "Individual House Construction",
      desc: "Custom-designed homes built to your exact specifications and lifestyle",
      benefits: ["3D Design Planning", "Vastu Compliant", "5-Year Warranty"],
      wa: "I'm interested in Individual House Construction",
    },
    {
      icon: "🏰",
      title: "Luxury Villa Construction",
      desc: "Premium villas with architectural excellence and finest finishes",
      benefits: ["Premium Materials", "Landscape Design", "Smart Home Ready"],
      wa: "I'm interested in Villa Construction",
    },
    {
      icon: "🏢",
      title: "Apartment Development",
      desc: "End-to-end apartment projects from foundation to handover",
      benefits: ["RERA Compliant", "Structural Design", "Modern Amenities"],
      wa: "I'm interested in Apartment Development",
    },
    {
      icon: "🔨",
      title: "Renovation & Remodeling",
      desc: "Transform your existing space with a complete renovation makeover",
      benefits: ["Interior Design", "Structural Changes", "Quick Turnaround"],
      wa: "I'm interested in Renovation & Remodeling",
    },
    {
      icon: "🔑",
      title: "Turnkey Construction",
      desc: "Complete construction solution from concept to key handover",
      benefits: ["Single Point Contact", "Fixed Cost", "On-Time Delivery"],
      wa: "I'm interested in Turnkey Construction",
    },
    {
      icon: "🤝",
      title: "Joint Venture Projects",
      desc: "Partner with us for profitable land development opportunities",
      benefits: ["Revenue Sharing", "Zero Investment", "Legal Support"],
      wa: "I'm interested in Joint Venture Projects",
    },
  ];

  return (
    <section
      id="services"
      className="py-20 lg:py-28"
      style={{ background: "#0d1f3c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            What We Build
          </div>
          <h2 className="section-heading">
            Our <span style={{ color: "#C9A84C" }}>Services</span>
          </h2>
          <div className="gold-divider" />
          <p className="mt-4 max-w-xl mx-auto" style={{ color: "#C8D4E0" }}>
            Comprehensive construction services tailored for Chennai's
            discerning homeowners
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((svc, i) => (
            <div
              key={svc.title}
              className="reveal-on-scroll flex flex-col p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
              style={{
                transitionDelay: `${i * 80}ms`,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
              data-ocid={`services.item.${i + 1}`}
            >
              <div className="text-4xl mb-4">{svc.icon}</div>
              <h3 className="font-bold text-white font-serif text-lg mb-2">
                {svc.title}
              </h3>
              <p className="text-sm mb-4 flex-1" style={{ color: "#C8D4E0" }}>
                {svc.desc}
              </p>
              <ul className="mb-6 space-y-1">
                {svc.benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "#C8D4E0" }}
                  >
                    <span style={{ color: "#C9A84C" }}>✓</span> {b}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(svc.wa)}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-btn px-5 py-2.5 rounded-lg text-sm uppercase tracking-wide text-center"
                data-ocid="services.primary_button"
              >
                Enquire Now
              </a>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div
          className="reveal-on-scroll text-center py-10 px-6 rounded-2xl"
          style={{
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.4)",
          }}
        >
          <p
            className="mb-2 text-sm font-bold uppercase tracking-widest"
            style={{ color: "#C9A84C" }}
          >
            ⚡ Limited Projects Accepted Every Month
          </p>
          <h3 className="font-serif text-white text-2xl font-bold mb-4">
            Ready to Build Your Dream Home?
          </h3>
          <a
            href="#contact"
            className="gold-btn px-10 py-3 rounded-lg uppercase tracking-widest text-sm inline-block"
            data-ocid="services.secondary_button"
          >
            Get Free Consultation
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Joint Venture ───────────────────────────────────────────────────────────
function JointVenture() {
  const steps = [
    {
      num: "01",
      title: "Share Your Land Details",
      desc: "Tell us about your plot location, size and your goals",
    },
    {
      num: "02",
      title: "Feasibility Study",
      desc: "Our experts analyse development potential and returns",
    },
    {
      num: "03",
      title: "Legal Agreement",
      desc: "Transparent legal documentation protecting your interests",
    },
    {
      num: "04",
      title: "Build & Share Profits",
      desc: "We build; you enjoy your share of the revenue",
    },
  ];

  const benefits = [
    {
      icon: "💰",
      title: "Zero Investment",
      desc: "No capital outlay required from the landowner",
    },
    {
      icon: "📈",
      title: "High ROI Potential",
      desc: "Maximise the value of your land asset",
    },
    {
      icon: "🔧",
      title: "End-to-End Handling",
      desc: "We manage design, construction & sales",
    },
    {
      icon: "⚖️",
      title: "Legal Transparency",
      desc: "Clear agreements and RERA-compliant documentation",
    },
  ];

  return (
    <section
      id="joint-venture"
      className="py-20 lg:py-28"
      style={{ background: "#122040" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Partnership Opportunity
          </div>
          <h2 className="section-heading">
            Own Land? <span style={{ color: "#C9A84C" }}>Let's Build</span>
          </h2>
          <h2 className="section-heading">Together & Earn More</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="reveal-on-scroll">
            <h3 className="font-serif text-xl font-bold text-white mb-8">
              How It Works —{" "}
              <span style={{ color: "#C9A84C" }}>4 Simple Steps</span>
            </h3>
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="flex gap-5 p-5 rounded-xl transition-all hover:-translate-x-1"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <div
                    className="text-xl font-bold font-serif shrink-0 w-10 text-right"
                    style={{ color: "#C9A84C" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">
                      {step.title}
                    </div>
                    <div className="text-sm" style={{ color: "#C8D4E0" }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-on-scroll">
            <div
              className="rounded-2xl overflow-hidden mb-8"
              style={{ border: "2px solid rgba(201,168,76,0.3)" }}
            >
              <img
                src="/assets/generated/project-jv-1.dim_800x600.jpg"
                alt="Joint Venture Partnership"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">
                    {b.title}
                  </div>
                  <div className="text-xs" style={{ color: "#C8D4E0" }}>
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center reveal-on-scroll">
          <a
            href={waLink(
              "I have land and want to discuss a Joint Venture project",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-btn px-10 py-4 rounded-xl text-base uppercase tracking-widest inline-block"
            data-ocid="jv.primary_button"
          >
            💬 Discuss Your JV Project Now
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────
const carouselGroups = [
  {
    title: "Luxury Villas",
    images: [
      {
        src: "/assets/generated/project-villa-1.dim_800x600.jpg",
        label: "Serene Heights Villa",
        location: "Adyar, Chennai",
      },
      {
        src: "/assets/generated/project-villa-2.dim_800x600.jpg",
        label: "Royal Crest Villa",
        location: "ECR, Chennai",
      },
      {
        src: "/assets/generated/project-villa-3.dim_800x600.jpg",
        label: "Golden Palm Villa",
        location: "Sholinganallur, Chennai",
      },
      {
        src: "/assets/generated/project-villa-4.dim_800x600.jpg",
        label: "Emerald Breeze Villa",
        location: "Perungudi, Chennai",
      },
      {
        src: "/assets/generated/project-penthouse-1.dim_800x600.jpg",
        label: "Skyview Penthouse Villa",
        location: "OMR, Chennai",
      },
      {
        src: "/assets/generated/project-amenities-1.dim_800x600.jpg",
        label: "Premier Villa with Amenities",
        location: "Porur, Chennai",
      },
    ],
  },
  {
    title: "Apartment Projects",
    images: [
      {
        src: "/assets/generated/project-apartment-1.dim_800x600.jpg",
        label: "Maharajah Residences Block A",
        location: "Velachery, Chennai",
      },
      {
        src: "/assets/generated/project-apartment-2.dim_800x600.jpg",
        label: "Maharajah Residences Block B",
        location: "Porur, Chennai",
      },
      {
        src: "/assets/generated/project-township-1.dim_800x600.jpg",
        label: "Crown Township Apartments",
        location: "Tambaram, Chennai",
      },
      {
        src: "/assets/generated/project-penthouse-1.dim_800x600.jpg",
        label: "Sky Penthouse Complex",
        location: "Adyar, Chennai",
      },
      {
        src: "/assets/generated/project-villa-1.dim_800x600.jpg",
        label: "Heritage Garden Flats",
        location: "Mylapore, Chennai",
      },
      {
        src: "/assets/generated/project-amenities-1.dim_800x600.jpg",
        label: "Amenity-Rich Apartments",
        location: "Guindy, Chennai",
      },
    ],
  },
  {
    title: "Commercial & Office Spaces",
    images: [
      {
        src: "/assets/generated/project-commercial-1.dim_800x600.jpg",
        label: "Maharajah Business Park",
        location: "Tidel Park, Chennai",
      },
      {
        src: "/assets/generated/project-commercial-2.dim_800x600.jpg",
        label: "Corporate Plaza Tower",
        location: "Nungambakkam, Chennai",
      },
      {
        src: "/assets/generated/project-jv-1.dim_800x600.jpg",
        label: "JV Commercial Complex",
        location: "Anna Salai, Chennai",
      },
      {
        src: "/assets/generated/project-amenities-1.dim_800x600.jpg",
        label: "Mixed-Use Commercial Hub",
        location: "T. Nagar, Chennai",
      },
      {
        src: "/assets/generated/project-township-2.dim_800x600.jpg",
        label: "Retail & Office Township",
        location: "Perambur, Chennai",
      },
      {
        src: "/assets/generated/project-villa-4.dim_800x600.jpg",
        label: "Boutique Office Suites",
        location: "Egmore, Chennai",
      },
    ],
  },
  {
    title: "Township & Gated Communities",
    images: [
      {
        src: "/assets/generated/project-township-1.dim_800x600.jpg",
        label: "Maharajah Grand Township Phase I",
        location: "Tambaram, Chennai",
      },
      {
        src: "/assets/generated/project-township-2.dim_800x600.jpg",
        label: "Maharajah Grand Township Phase II",
        location: "Guduvanchery, Chennai",
      },
      {
        src: "/assets/generated/project-villa-4.dim_800x600.jpg",
        label: "Green Valley Gated Community",
        location: "Vandalur, Chennai",
      },
      {
        src: "/assets/generated/project-amenities-1.dim_800x600.jpg",
        label: "Club House & Amenities Block",
        location: "Tambaram, Chennai",
      },
      {
        src: "/assets/generated/project-apartment-1.dim_800x600.jpg",
        label: "Township Residential Towers",
        location: "Padappai, Chennai",
      },
      {
        src: "/assets/generated/project-apartment-2.dim_800x600.jpg",
        label: "Gated Community Villas",
        location: "Maraimalai Nagar, Chennai",
      },
    ],
  },
  {
    title: "Joint Venture Projects",
    images: [
      {
        src: "/assets/generated/project-jv-1.dim_800x600.jpg",
        label: "ARC JV Prime Development",
        location: "Kelambakkam, Chennai",
      },
      {
        src: "/assets/generated/project-township-1.dim_800x600.jpg",
        label: "Land Partner Development",
        location: "Chromepet, Chennai",
      },
      {
        src: "/assets/generated/project-commercial-1.dim_800x600.jpg",
        label: "Commercial JV Venture",
        location: "Sholinganallur, Chennai",
      },
      {
        src: "/assets/generated/project-villa-3.dim_800x600.jpg",
        label: "JV Luxury Villa Project",
        location: "Uthandi, Chennai",
      },
      {
        src: "/assets/generated/project-apartment-2.dim_800x600.jpg",
        label: "JV Apartment Complex",
        location: "Medavakkam, Chennai",
      },
      {
        src: "/assets/generated/project-commercial-2.dim_800x600.jpg",
        label: "Mixed JV Office-Retail",
        location: "Velachery, Chennai",
      },
    ],
  },
  {
    title: "Renovation & Remodeling",
    images: [
      {
        src: "/assets/generated/renovation-construction-1.dim_800x600.jpg",
        label: "Home Renovation in Progress",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/renovation-construction-2.dim_800x600.jpg",
        label: "Bathroom Remodeling",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/renovation-construction-3.dim_800x600.jpg",
        label: "Kitchen Demolition & Rebuild",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/renovation-construction-4.dim_800x600.jpg",
        label: "Living Room Transformation",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/renovation-construction-5.dim_800x600.jpg",
        label: "Wall Plastering & Finishing",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/renovation-construction-6.dim_800x600.jpg",
        label: "New Flooring Installation",
        location: "Chennai, Tamil Nadu",
      },
    ],
  },
  {
    title: "Interior Design",
    images: [
      {
        src: "/assets/generated/interior-kitchen-1.dim_800x600.jpg",
        label: "Modern Modular Kitchen",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-kitchen-2.dim_800x600.jpg",
        label: "Premium Dark Kitchen",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-wardrobe-1.dim_800x600.jpg",
        label: "Built-in Wardrobe Design",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-wardrobe-2.dim_800x600.jpg",
        label: "Walk-in Wardrobe Suite",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-tvunit-1.dim_800x600.jpg",
        label: "Designer TV Unit",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-living-1.dim_800x600.jpg",
        label: "Contemporary Living Room",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-arch-1.dim_800x600.jpg",
        label: "Architectural Interior",
        location: "Chennai, Tamil Nadu",
      },
      {
        src: "/assets/generated/interior-bedroom-1.dim_800x600.jpg",
        label: "Luxury Master Bedroom",
        location: "Chennai, Tamil Nadu",
      },
    ],
  },
];

function Projects() {
  return (
    <section
      id="projects"
      className="py-20 lg:py-28"
      style={{ background: "#0d1f3c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Our Portfolio
          </div>
          <h2 className="section-heading">
            Featured <span style={{ color: "#C9A84C" }}>Projects</span>
          </h2>
          <div className="gold-divider" />
          <p className="mt-4 max-w-2xl mx-auto" style={{ color: "#C8D4E0" }}>
            Over 36+ years, we've transformed hundreds of plots into stunning
            living and commercial spaces across Chennai
          </p>
        </div>

        {carouselGroups.map((group) => (
          <ProjectCarousel
            key={group.title}
            title={group.title}
            images={group.images}
          />
        ))}

        <div className="text-center reveal-on-scroll mt-4">
          <a
            href={waLink(
              "I'd like to see more of your projects and portfolio.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-btn px-10 py-3 rounded-xl uppercase tracking-widest text-sm inline-block"
            data-ocid="projects.primary_button"
          >
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Video Showcase ──────────────────────────────────────────────────────────
function VideoShowcase() {
  const [playing, setPlaying] = useState<number | null>(null);

  const videos = [
    {
      title: "Luxury Interior Transformation",
      subtitle: "Modular Kitchens, Wardrobes & Living Spaces",
      youtubeId: "ZcUFEWWkFHM",
      poster:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      badge: "Interiors",
      badgeColor: "#C9A84C",
      badgeBg: "rgba(201,168,76,0.2)",
    },
    {
      title: "Architectural Elevation Designs",
      subtitle: "3D Renders & Modern Facades",
      youtubeId: "KJxrLGNJZSE",
      poster:
        "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      badge: "Elevation",
      badgeColor: "#60A5FA",
      badgeBg: "rgba(96,165,250,0.2)",
    },
    {
      title: "Exterior & Landscape Showcase",
      subtitle: "Villas, Apartments & Commercial",
      youtubeId: "xEBEWgwuiPE",
      poster:
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      badge: "Exteriors",
      badgeColor: "#4ADE80",
      badgeBg: "rgba(74,222,128,0.2)",
    },
  ];

  return (
    <section
      id="videos"
      className="py-20 lg:py-28"
      style={{ background: "#0d1f3c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Our Work in Motion
          </div>
          <h2 className="section-heading">
            Watch Our{" "}
            <span style={{ color: "#C9A84C" }}>Projects Come to Life</span>
          </h2>
          <div className="gold-divider" />
          <p className="mt-4 max-w-2xl mx-auto" style={{ color: "#C8D4E0" }}>
            Explore our craftsmanship through real project walkthroughs —
            interiors, elevation designs, and stunning exteriors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {videos.map((video, i) => (
            <div
              key={video.title}
              className="reveal-on-scroll rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(201,168,76,0.3)",
                backdropFilter: "blur(12px)",
                transitionDelay: `${i * 100}ms`,
              }}
              data-ocid={`videos.item.${i + 1}`}
            >
              {/* Video area */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                {playing === i ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    style={{
                      padding: 0,
                      background: "transparent",
                      border: "none",
                    }}
                    onClick={() => setPlaying(i)}
                    aria-label={`Play ${video.title}`}
                  >
                    <img
                      src={video.poster}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(0,0,0,0.35)" }}
                    />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                        style={{
                          width: 64,
                          height: 64,
                          background: "rgba(201,168,76,0.9)",
                          boxShadow: "0 0 30px rgba(201,168,76,0.5)",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="white"
                          aria-hidden="true"
                        >
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Card content */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{
                      color: video.badgeColor,
                      background: video.badgeBg,
                      border: `1px solid ${video.badgeColor}40`,
                    }}
                  >
                    {video.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-white text-base mb-1">
                  {video.title}
                </h3>
                <p className="text-sm" style={{ color: "#C8D4E0" }}>
                  {video.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ─── Testimonials ────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote:
        "Highly professional builder — delivered exactly what was promised. Our villa in Adyar exceeded every expectation.",
      name: "Rajesh Kumar",
      location: "Velachery, Chennai",
      initials: "RK",
    },
    {
      quote:
        "Delivered on time with outstanding quality. The civil engineering team is truly world-class. Highly recommended!",
      name: "Priya Sundaram",
      location: "Adyar, Chennai",
      initials: "PS",
    },
    {
      quote:
        "Most trusted construction company in Chennai. Complete transparency throughout the build. No surprises, just results.",
      name: "Mohammed Farhan",
      location: "Porur, Chennai",
      initials: "MF",
    },
    {
      quote:
        "Best builders for villa construction in Chennai. AL Maharajah turned our dream home into a stunning reality.",
      name: "Lakshmi Narayanan",
      location: "OMR, Chennai",
      initials: "LN",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28"
      style={{ background: "#122040" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Client Stories
          </div>
          <h2 className="section-heading">
            What Our Clients <span style={{ color: "#C9A84C" }}>Say</span>
          </h2>
          <div className="gold-divider" />
          <p className="mt-4" style={{ color: "#C8D4E0" }}>
            100+ Satisfied Families Across Chennai
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="reveal-on-scroll flex flex-col p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                transitionDelay: `${i * 80}ms`,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
              data-ocid={`testimonials.item.${i + 1}`}
            >
              <div
                className="text-4xl font-serif font-bold mb-4"
                style={{ color: "#C9A84C", lineHeight: 1 }}
              >
                &ldquo;
              </div>
              <div className="flex mb-3">
                {["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                  <span key={sk} style={{ color: "#C9A84C" }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{ color: "#C8D4E0" }}
              >
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: "rgba(201,168,76,0.2)",
                    color: "#C9A84C",
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: "#C8D4E0" }}>
                    {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    requirement: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello AL Maharajah Properties!\n\nName: ${form.name}\nPhone: ${form.phone}\nRequirement: ${form.requirement}\nMessage: ${form.message}`;
    window.open(waLink(msg), "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section
      id="contact"
      className="py-20 lg:py-28"
      style={{ background: "#0d1f3c" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal-on-scroll">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#C9A84C" }}
          >
            Get In Touch
          </div>
          <h2 className="section-heading">
            Planning to Build Your{" "}
            <span style={{ color: "#C9A84C" }}>Dream Home?</span>
          </h2>
          <div className="gold-divider" />
          <p className="mt-4" style={{ color: "#C8D4E0" }}>
            Get expert guidance from experienced civil engineers.
          </p>
          <div
            className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-bold"
            style={{
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
            }}
          >
            ⚡ Limited Projects Accepted Every Month — Act Now!
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div
            className="reveal-on-scroll p-8 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(201,168,76,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h3 className="font-serif text-xl font-bold text-white mb-6">
              Send Us Your Enquiry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#C8D4E0" }}
                >
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white outline-none focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                  placeholder="Rajesh Kumar"
                  data-ocid="contact.input"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#C8D4E0" }}
                >
                  Phone Number *
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                  placeholder="+91 98765 43210"
                  data-ocid="contact.input"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-req"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#C8D4E0" }}
                >
                  Requirement
                </label>
                <select
                  id="contact-req"
                  value={form.requirement}
                  onChange={(e) =>
                    setForm({ ...form, requirement: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg text-white outline-none"
                  style={{
                    background: "rgba(13,31,60,0.95)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                  data-ocid="contact.select"
                >
                  <option value="">Select your requirement</option>
                  <option>House Construction</option>
                  <option>Villa</option>
                  <option>Apartment</option>
                  <option>Renovation</option>
                  <option>Joint Venture</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="contact-msg"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#C8D4E0" }}
                >
                  Message
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg text-white outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                  placeholder="Tell us about your project..."
                  data-ocid="contact.textarea"
                />
              </div>
              <button
                type="submit"
                className="gold-btn w-full py-4 rounded-xl text-base uppercase tracking-widest"
                data-ocid="contact.submit_button"
              >
                {submitted
                  ? "✅ Sent! Redirecting to WhatsApp..."
                  : "Submit Enquiry via WhatsApp"}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="reveal-on-scroll space-y-5">
            {/* Phone */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📞</span>
                <span className="font-bold text-white">Phone Numbers</span>
              </div>
              <div className="space-y-2">
                {["+91 93639 16363", "+91 99622 66333", "+91 76399 30943"].map(
                  (ph) => (
                    <a
                      key={ph}
                      href={`tel:+91${ph.replace(/\D/g, "").slice(2)}`}
                      className="block text-sm transition-colors hover:text-white"
                      style={{ color: "#C9A84C" }}
                      data-ocid="contact.link"
                    >
                      {ph}
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Email */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">✉️</span>
                <span className="font-bold text-white">Email</span>
              </div>
              {["almrpllp@gmail.com", "rajahmohamedmrp@gmail.com"].map(
                (email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="block text-sm transition-colors hover:text-white"
                    style={{ color: "#C9A84C" }}
                  >
                    {email}
                  </a>
                ),
              )}
            </div>

            {/* Website */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🌐</span>
                <span className="font-bold text-white">Website</span>
              </div>
              <a
                href="https://www.mrpllp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-white hover:underline font-bold"
                style={{ color: "#C9A84C" }}
                data-ocid="contact.link"
              >
                www.mrpllp.com
              </a>
            </div>

            {/* Address */}
            <div
              className="p-6 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">📍</span>
                <span className="font-bold text-white">Our Office</span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#C8D4E0" }}
              >
                Plot No. 10,12 B/4, F2 "SINDHU PARAGON",
                <br />
                5th Street, Sarathy Nagar, Velachery,
                <br />
                Chennai - 600042
              </p>
            </div>

            {/* Map */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(201,168,76,0.25)" }}
            >
              <iframe
                src="https://maps.google.com/maps?q=Velachery,Chennai,Tamil+Nadu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#071828" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/assets/uploads/img-20260329-wa0007-019d3b64-dc98-7339-be04-374137481145-1.jpg"
                alt="ARC Group Company Logo"
                className="w-14 h-14 rounded-full object-cover bg-white"
                style={{ border: "2px solid #C9A84C" }}
              />
              <div>
                <div className="text-white font-bold tracking-wider">
                  AL MAHARAJAH
                </div>
                <div
                  className="text-xs tracking-widest"
                  style={{ color: "#C9A84C" }}
                >
                  PROPERTIES LLP
                </div>
                <a
                  href="https://www.mrpllp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: "#C9A84C" }}
                  data-ocid="footer.link"
                >
                  www.mrpllp.com
                </a>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "#9aaabb" }}
            >
              Building trust and dreams for 36+ years. Chennai's most reliable
              civil construction partner.
            </p>
            <div className="flex gap-3">
              <a
                href={`tel:${PHONE_PRIMARY}`}
                className="gold-btn px-4 py-2 rounded-lg text-xs uppercase tracking-wide inline-block"
                data-ocid="footer.primary_button"
              >
                📞 Call Now
              </a>
              <a
                href={waLink("Hello AL Maharajah Properties!")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-wide font-bold inline-block"
                style={{ background: "#25D366", color: "#fff" }}
                data-ocid="footer.secondary_button"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-white font-bold uppercase tracking-widest text-xs mb-5"
              style={{
                borderBottom: "1px solid rgba(201,168,76,0.3)",
                paddingBottom: "0.5rem",
              }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                "#home",
                "#about",
                "#services",
                "#projects",
                "#joint-venture",
                "#testimonials",
                "#contact",
              ].map((href) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#9aaabb" }}
                    data-ocid="footer.link"
                  >
                    {href
                      .replace("#", "")
                      .replace("-", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-white font-bold uppercase tracking-widest text-xs mb-5"
              style={{
                borderBottom: "1px solid rgba(201,168,76,0.3)",
                paddingBottom: "0.5rem",
              }}
            >
              Services
            </h4>
            <ul className="space-y-2">
              {[
                "Individual House",
                "Luxury Villas",
                "Apartments",
                "Renovation",
                "Turnkey Projects",
                "Joint Ventures",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#9aaabb" }}
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-bold uppercase tracking-widest text-xs mb-5"
              style={{
                borderBottom: "1px solid rgba(201,168,76,0.3)",
                paddingBottom: "0.5rem",
              }}
            >
              Contact
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+919363916363"
                className="block transition-colors hover:text-white"
                style={{ color: "#9aaabb" }}
              >
                📞 +91 93639 16363
              </a>
              <a
                href="tel:+919962266333"
                className="block transition-colors hover:text-white"
                style={{ color: "#9aaabb" }}
              >
                📞 +91 99622 66333
              </a>
              <a
                href="mailto:almrpllp@gmail.com"
                className="block transition-colors hover:text-white"
                style={{ color: "#9aaabb" }}
              >
                ✉️ almrpllp@gmail.com
              </a>
              <a
                href="https://www.mrpllp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:underline font-bold"
                style={{ color: "#C9A84C" }}
              >
                🌐 www.mrpllp.com
              </a>
              <p style={{ color: "#9aaabb" }}>📍 Velachery, Chennai - 600042</p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs"
          style={{
            borderTop: "1px solid rgba(201,168,76,0.15)",
            color: "rgba(154,170,187,0.7)",
          }}
        >
          <p>© {year} AL MAHARAJAH PROPERTIES LLP. All Rights Reserved.</p>
          <p>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating Elements ────────────────────────────────────────────────────────
function FloatingElements() {
  return (
    <>
      {/* WhatsApp FAB */}
      <a
        href={waLink(
          "Hello AL Maharajah Properties! I'm interested in your services.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-110"
        style={{
          bottom: "80px",
          right: "20px",
          background: "#25D366",
          color: "#fff",
          boxShadow: "0 4px 24px rgba(37,211,102,0.5)",
        }}
        data-ocid="float.primary_button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp Us
      </a>

      {/* Mobile Call Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden"
        style={{
          background: "#0d1f3c",
          borderTop: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        <a
          href={`tel:${PHONE_PRIMARY}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold"
          style={{ color: "#C9A84C" }}
          data-ocid="float.primary_button"
        >
          📞 Call Us Now
        </a>
        <div style={{ width: "1px", background: "rgba(201,168,76,0.3)" }} />
        <a
          href="#contact"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold"
          style={{ color: "#fff", background: "rgba(201,168,76,0.15)" }}
          data-ocid="float.secondary_button"
        >
          ✉️ Free Quote
        </a>
      </div>
    </>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  useScrollReveal();

  return (
    <div className="min-h-screen" style={{ background: "#0d1f3c" }}>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyChooseUs />
        <Services />
        <Projects />
        <JointVenture />
        <VideoShowcase />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <FloatingElements />
    </div>
  );
}
