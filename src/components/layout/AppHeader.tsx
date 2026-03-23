import { Link } from "react-router-dom";
import { Feather } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-glass">
      <div className="container flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, hsl(38, 75%, 48%), hsl(40, 80%, 58%))' }}>
            <Feather className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display text-gold-gradient leading-tight tracking-tight">
              BenzScribe
            </span>
            <span className="text-[9px] font-body text-muted-foreground tracking-[0.2em] uppercase hidden lg:block">
              Benz Packaging Solutions
            </span>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden md:flex items-center">
            {[
              { to: "/", label: "Studio" },
              { to: "/articles", label: "Library" },
              { to: "/templates", label: "Templates" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 rounded-xl text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-3 h-5 w-px bg-border/60 hidden md:block" />

          <button className="ml-3 flex items-center justify-center w-9 h-9 rounded-full text-xs font-body font-bold text-primary-foreground overflow-hidden transition-all duration-300 hover:shadow-gold"
            style={{ background: 'linear-gradient(135deg, hsl(38, 75%, 48%), hsl(40, 80%, 58%))' }}>
            BP
          </button>
        </div>
      </div>
    </header>
  );
}
