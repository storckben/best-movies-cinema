import { Link } from 'react-router-dom';

const footerSections = [
  {
    title: 'Filmes da Semana',
    links: [
      { label: 'Em Cartaz', href: '/filmes' },
      { label: 'Em Breve', href: '/filmes' },
      { label: 'Pré-venda', href: '/filmes' },
    ],
  },
  {
    title: 'Programação',
    links: [
      { label: 'Em Cartaz', href: '/' },
      { label: 'Em Breve', href: '/' },
      { label: 'Salas Premium', href: '/' },
    ],
  },
  {
    title: 'Snack Bar',
    links: [
      { label: 'Cardápio', href: '/' },
      { label: 'Copo Reutilizável', href: '/' },
    ],
  },
  {
    title: 'Cinemak Club',
    links: [
      { label: 'Sobre o Programa', href: '/' },
      { label: 'Cinemak Club Fan', href: '/' },
      { label: 'Cinemak Club Plus', href: '/' },
      { label: 'Cinemak Club Black', href: '/' },
    ],
  },
  {
    title: 'Cinemak',
    links: [
      { label: 'Sobre a Cinemak', href: '/' },
      { label: 'Acessibilidade', href: '/' },
      { label: 'Assessoria de Imprensa', href: '/' },
      { label: 'Trabalhe Conosco', href: '/' },
    ],
  },
  {
    title: 'Contato',
    links: [
      { label: 'Central de Atendimento', href: '/' },
      { label: 'FAQ', href: '/' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Facebook', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-8">
      {/* Newsletter */}
      <div className="container py-6 border-b border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">Cadastre-se</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Siga-nos</span>
            <div className="flex gap-3">
              {socialLinks.map(s => (
                <a key={s.label} href={s.href} className="text-xs text-muted-foreground hover:text-primary transition-colors font-semibold uppercase">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-3">
                {section.title}
              </h4>
              <ul className="space-y-1.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Copyright © {new Date().getFullYear()} Cinemak
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
