import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to <span className="text-primary-600">MenúFácil</span>
        </h1>
        
        <p className="text-xl text-center mb-12">
          Create and manage interactive digital menus for your restaurant
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
} 