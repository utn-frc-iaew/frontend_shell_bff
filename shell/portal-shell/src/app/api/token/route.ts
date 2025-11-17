import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ 
        error: 'No session or token found'
      }, { status: 401 });
    }

    console.log('Token endpoint - returning access token');

    return NextResponse.json({
      accessToken: session.accessToken,
    });

  } catch (error: any) {
    console.error('Error getting token:', error);
    return NextResponse.json({ 
      error: 'Failed to get token',
      message: error.message,
    }, { status: 500 });
  }
}
