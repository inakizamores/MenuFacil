import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">Page not found</h2>
        <p className="mt-6 text-base text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-10 flex justify-center space-x-4">
          <Button href="/" variant="primary">
            Go back home
          </Button>
          <Button href="/dashboard" variant="outline">
            Go to dashboard
          </Button>
        </div>
      </div>
      
      <div className="mt-16">
        <p className="text-center text-sm text-gray-600">
          Need help? <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">Contact support</Link>
        </p>
      </div>
    </div>
  );
} 