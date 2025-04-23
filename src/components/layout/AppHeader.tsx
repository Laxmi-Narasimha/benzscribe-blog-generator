
import { Link } from "react-router-dom";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BenzScribe
            </span>
            <span className="text-sm text-gray-500 hidden lg:inline-block">by Benz Packaging Solutions</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/articles" className="text-sm font-medium transition-colors hover:text-blue-600">
              My Articles
            </Link>
            <Link to="/templates" className="text-sm font-medium transition-colors hover:text-blue-600">
              Templates
            </Link>
          </nav>
          <div className="ml-4 flex items-center space-x-4">
            <button 
              className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
            >
              Settings
            </button>
            <div className="relative">
              <button className="relative h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden">
                BP
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
