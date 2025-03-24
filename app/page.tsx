import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to a proper home page which will handle authentication
  redirect('/home');
} 