import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const { user, accessToken, idToken } = session;

    // Log en el servidor (visible en docker logs)
    console.log('='.repeat(80));
    console.log('🔑 DEBUG TOKEN INFO');
    console.log('='.repeat(80));
    console.log('👤 User:', JSON.stringify(user, null, 2));
    console.log('📋 Access Token:', accessToken);
    console.log('🆔 ID Token:', idToken);
    console.log('='.repeat(80));

    // Decodificar el payload del access token (si existe)
    if (accessToken) {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      
      console.log('📦 Access Token Payload:', JSON.stringify(payload, null, 2));
      console.log('🎭 Roles:', payload['https://bff-shell/roles'] || 'No roles found');
      console.log('='.repeat(80));
    }

    // Retornar información al navegador (SIN el token completo por seguridad)
    return NextResponse.json({
      user,
      tokenInfo: accessToken ? {
        length: accessToken.length,
        preview: `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 20)}`,
        decoded: accessToken ? JSON.parse(
          Buffer.from(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        ) : null
      } : null,
      message: 'Check server logs (docker logs portal-shell) for full token'
    });

  } catch (error: any) {
    console.error('❌ Error getting token:', error);
    return NextResponse.json({ 
      error: 'Failed to get token',
      message: error.message 
    }, { status: 500 });
  }
}
