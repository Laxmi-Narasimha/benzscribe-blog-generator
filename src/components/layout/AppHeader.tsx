import { Link } from "react-router-dom";
import { Feather } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-glass border-b border-border/50">
      <div className="container flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-premium">
            <Feather className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-semibold text-gold-gradient leading-tight">
              BenzScribe
            </span>
            <span className="text-[10px] font-body text-muted-foreground tracking-widest uppercase hidden lg:block">
              by Benz Packaging Solutions
            </span>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/", label: "Studio" },
              { to: "/articles", label: "Articles" },
              { to: "/templates", label: "Templates" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 rounded-lg text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-premium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-2 h-6 w-px bg-border hidden md:block" />

          <button className="artisan-btn-ghost hidden md:flex">
            Settings
          </button>

          <div className="relative">
            <button className="flex items-center justify-center w-9 h-9 rounded-xl text-xs font-body font-bold text-primary-foreground overflow-hidden transition-premium hover:shadow-gold"
              style={{ backgroundImage: 'linear-gradient(135deg, hsl(36, 72%, 48%), hsl(38, 80%, 55%))' }}>
              BP
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
