import Link from "next/link";

const links = [
  { label: "Accueil", href: "/" },
  { label: "MENA", href: "/mena" },
  { label: "Europe", href: "/europe" },
  { label: "OSINT", href: "/osint" },
  { label: "Programme", href: "/programme" },
  { label: "Services", href: "/services" },
];

export default function Nav() {
  return (
    <nav className="bg-sand border-b-2 border-navy flex px-4 md:px-9 overflow-x-auto w-full">
      {links.map((link) => (
        <Link key={link.href} href={link.href}
          className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted px-3 md:px-4 py-3 hover:text-navy whitespace-nowrap flex-shrink-0">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
