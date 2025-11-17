import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'No session or user found'
      }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
    });

  } catch (error: any) {
    console.error('Error getting user:', error);
    return NextResponse.json({ 
      error: 'Failed to get user',
      message: error.message,
    }, { status: 500 });
  }
}
