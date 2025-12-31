import { Scissors } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-semibold text-foreground leading-tight">
              Valquiria Ferreira
            </h1>
            <p className="text-xs text-copper font-medium">Confecções</p>
          </div>
        </div>
      </div>
    </header>
  );
}
