import React from 'react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full text-center py-6 mt-auto text-muted-foreground pb-24">
      <p className="text-sm font-medium">
        © {year} Valquiria Ferreira Confecções. Todos os direitos reservados.
      </p>
      <p className="text-xs mt-1 text-muted-foreground/80">
        Desenvolvido com amor por Bruno Vinícius
      </p>
    </footer>
  );
}
