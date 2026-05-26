import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Public 404 page.
 *
 * Rendered for any URL the application does not recognise (unknown path,
 * stale link, deprecated admin route, etc.). It deliberately:
 *  - does not auto-redirect to the home page
 *  - does not render Header / Footer chrome of the public app
 *  - does not reveal any information about the application's internals
 */
export function NotFound() {
  const handleGoHome = () => {
    const base = import.meta.env.BASE_URL || '/';
    // Use replace() so the bad URL is removed from history.
    window.location.replace(base);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0a0e17' }}
      role="main"
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Compass className="w-10 h-10 text-white" aria-hidden="true" />
        </div>

        <p className="text-7xl font-bold text-white tracking-tight mb-2">
          404
        </p>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
          Please check the URL or return to the home page.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 py-3"
        >
          <Home className="w-4 h-4 mr-2" />
          Go to home page
        </Button>
      </div>
    </div>
  );
}
