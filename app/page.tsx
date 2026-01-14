import { auth } from '@clerk/nextjs/server';
import { getUserProjects } from '@/app/actions';
import LandingClient from '@/app/landing-client';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  // If user is logged in, redirect straight to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // Only guests see the landing page
  // We can pass false/false since we know they are not signed in
  return (
    <LandingClient 
      isSignedIn={false} 
      hasProjects={false} 
    />
  );
}
