"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const footerLinks = {
  club: {
    title: "El Club",
    links: [
      { label: "Directiva", href: "/club/directiva" },
      { label: "Instalaciones", href: "/club/instalaciones" },
      { label: "Estatuto", href: "/club/estatuto" },
      { label: "Reglamento", href: "/club/reglamento" },
      { label: "Memorias", href: "/club/memorias" },
    ],
  },
  deportes: {
    title: "Disciplinas",
    links: [
      { label: "Fútbol", href: "/deportes/futbol" },
      { label: "Básquetbol", href: "/deportes/basquetbol" },
      { label: "Handball", href: "/deportes/handball" },
      { label: "Hockey", href: "/deportes/hockey" },
      { label: "Ver todos", href: "/deportes" },
    ],
  },
  socios: {
    title: "Socios",
    links: [
      { label: "Hacete socio", href: "/socios" },
      { label: "Beneficios", href: "/beneficios" },
      { label: "Mi cuenta", href: "/mi-cuenta" },
      { label: "Tienda", href: "/tienda" },
    ],
  },
  contacto: {
    title: "Contacto",
    links: [
      { label: "Ubicación", href: "#ubicacion" },
      { label: "Teléfono", href: "tel:099613671" },
      { label: "Email", href: "mailto:secretaria@clubseminario.com.uy" },
    ],
  },
};

const mainSponsors = [
  { name: "Renato Conti", logo: "/logo-rc.png" },
  { name: "Itaú", logo: "/logo-itau.png" },
  { name: "UCU", logo: "/logo-ucu.png" },
  { name: "Summum", logo: "/logo-summum.png" },
];

const secondarySponsors = [
  { name: "Zillertal", logo: "/logo-zillertal.png" },
  { name: "Suat", logo: "/logo-suat.png" },
  { name: "Gatorade", logo: "/logo-gatorade.png" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/clubseminario",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Twitter/X",
    href: "https://x.com/clubseminariouy",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/club.seminario",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* CTA Section */}
      <section className="bg-gradient-to-b from-white via-amber-100 to-amarillo py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-bordo-dark mb-4">
            ¿Querés ser parte de la Bordó?
          </h2>
          <p className="text-bordo-dark/80 mb-6 max-w-2xl mx-auto">
            Más de 1000 socios ya forman parte de esta familia
          </p>
          <Link
            href="/socios"
            className="inline-flex items-center gap-2 bg-bordo-dark text-white px-8 py-3 rounded-full font-semibold hover:bg-bordo transition-colors"
          >
            Hacete socio
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="relative bg-bordo-dark text-white overflow-hidden">
        {/* Decorative top wave */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 md:h-16"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-amarillo"
            />
          </svg>
        </div>

      <div className="relative container mx-auto px-4 lg:px-8 pt-20 md:pt-24 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div
                className={cn(
                  "relative w-14 h-14",
                  "transition-all duration-300 group-hover:scale-105"
                )}
              >
                <Image
                  src="/logo-cs.png"
                  alt="Escudo Club Seminario"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <span className="block text-xl font-bold tracking-tight text-white">
                  Club Seminario
                </span>
                <span className="block text-xs font-medium tracking-widest uppercase text-amarillo">
                  Desde 2010
                </span>
              </div>
            </Link>
            <p className="mt-6 text-white/70 text-sm leading-relaxed max-w-xs">
              Formando deportistas y construyendo comunidad bajo valores
              ignacianos.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "bg-white/10 text-white/80",
                    "hover:bg-amarillo hover:text-bordo-dark",
                    "transition-all duration-300 hover:scale-110"
                  )}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-amarillo uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm text-white/70 hover:text-white",
                        "transition-all duration-200 hover:translate-x-1 inline-block"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Location & Contact Bar */}
        <div className="py-8 border-b border-white/10">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amarillo"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Ubicación
                </p>
                <p className="text-sm text-white/90">
                  Soriano 1472, Colegio Seminario
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amarillo"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Teléfono
                </p>
                <a
                  href="tel:099613671"
                  className="text-sm text-white/90 hover:text-amarillo transition-colors"
                >
                  099 613 671
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amarillo"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">
                  Horarios
                </p>
                <p className="text-sm text-white/90">
                  Martes, jueves y viernes de 10 a 13 hs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div className="py-8 border-b border-white/10">
          <h3 className="text-sm font-semibold text-amarillo uppercase tracking-wider mb-6 text-center">
            Nuestros Sponsors
          </h3>
          {/* Main Sponsors */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-6">
            {mainSponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="relative h-12 w-24 md:h-14 md:w-28 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          {/* Secondary Sponsors */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {secondarySponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="relative h-8 w-16 md:h-10 md:w-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            &copy; {currentYear} Club Seminario. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link
              href="/privacidad"
              className="hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="hover:text-white transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/contacto"
              className="hover:text-white transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
