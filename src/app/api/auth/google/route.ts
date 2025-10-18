// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uri:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api/auth/callback/google'
      : 'https://smart-edu.ai/api/auth/callback/google',
};

export async function GET() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleConfig.clientId}&response_type=code&scope=${encodeURIComponent('email profile')}&redirect_uri=${encodeURIComponent(googleConfig.redirect_uri)}&prompt=select_account`;

  return NextResponse.redirect(authUrl);
}
