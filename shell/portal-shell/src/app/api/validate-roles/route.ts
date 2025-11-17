import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        message: 'User is not authenticated. Please login first.'
      }, { status: 401 });
    }

    const { user, accessToken, idToken } = session;

    // Log completo en el servidor
    console.log('\n' + '='.repeat(100));
    console.log('🔍 ROLES VALIDATION - COMPLETE DEBUG INFO');
    console.log('='.repeat(100));
    
    console.log('\n📋 1. RAW USER OBJECT:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log('\n🔑 2. ACCESS TOKEN INFO:');
    if (accessToken) {
      console.log('✅ Access Token exists');
      console.log('Length:', accessToken.length);
      console.log('Preview:', `${accessToken.substring(0, 30)}...${accessToken.substring(accessToken.length - 30)}`);
      
      // Decodificar payload
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      
      console.log('\n📦 3. ACCESS TOKEN PAYLOAD:');
      console.log(JSON.stringify(payload, null, 2));
      
      console.log('\n🎭 4. ROLES ANALYSIS:');
      const possibleRoleKeys = [
        'https://bff-shell/roles',
        'https://dev-utn-frc-iaew.auth0.com/roles',
        'roles',
        'user_roles',
        'app_metadata',
      ];
      
      possibleRoleKeys.forEach(key => {
        const value = payload[key];
        if (value !== undefined) {
          console.log(`  ✅ Found roles at key "${key}":`, value);
        } else {
          console.log(`  ❌ No roles at key "${key}"`);
        }
      });
      
      console.log('\n📊 5. ALL TOKEN CLAIMS:');
      Object.keys(payload).forEach(key => {
        console.log(`  - ${key}:`, typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key]);
      });
      
    } else {
      console.log('❌ No Access Token found');
    }
    
    console.log('\n🆔 6. ID TOKEN INFO:');
    if (idToken) {
      console.log('✅ ID Token exists');
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const idPayload = JSON.parse(Buffer.from(base64, 'base64').toString());
      console.log('ID Token Payload:', JSON.stringify(idPayload, null, 2));
    } else {
      console.log('❌ No ID Token found');
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('🎯 SUMMARY:');
    console.log('- User Email:', user.email);
    console.log('- User Name:', user.name);
    console.log('- Has Access Token:', !!accessToken);
    console.log('- Has ID Token:', !!idToken);
    
    if (accessToken) {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );
      const rolesInBffShell = payload['https://bff-shell/roles'];
      const rolesInAuth0Domain = payload['https://dev-utn-frc-iaew.auth0.com/roles'];
      const rolesPlain = payload['roles'];
      
      console.log('- Roles (https://bff-shell/roles):', rolesInBffShell || 'NOT FOUND');
      console.log('- Roles (https://dev-utn-frc-iaew.auth0.com/roles):', rolesInAuth0Domain || 'NOT FOUND');
      console.log('- Roles (plain "roles"):', rolesPlain || 'NOT FOUND');
    }
    
    console.log('='.repeat(100) + '\n');

    // Retornar información segura al navegador
    let decodedAccessToken = null;
    let decodedIdToken = null;
    
    if (accessToken) {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      decodedAccessToken = JSON.parse(Buffer.from(base64, 'base64').toString());
    }
    
    if (idToken) {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      decodedIdToken = JSON.parse(Buffer.from(base64, 'base64').toString());
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        sub: user.sub,
      },
      tokens: {
        hasAccessToken: !!accessToken,
        hasIdToken: !!idToken,
      },
      accessTokenPayload: decodedAccessToken,
      idTokenPayload: decodedIdToken,
      rolesFound: {
        'https://bff-shell/roles': decodedAccessToken?.['https://bff-shell/roles'] || null,
        'https://dev-utn-frc-iaew.auth0.com/roles': decodedAccessToken?.['https://dev-utn-frc-iaew.auth0.com/roles'] || null,
        'roles': decodedAccessToken?.['roles'] || null,
      },
      instructions: {
        message: 'Check server logs (docker logs portal-shell) for detailed information',
        steps: [
          '1. Verify Action is DEPLOYED in Auth0 Dashboard → Actions → Library',
          '2. Verify Action is attached to post-login trigger in Auth0 Dashboard → Actions → Triggers',
          '3. Verify user has roles assigned in Auth0 Dashboard → User Management → Users → [Your User] → Roles',
          '4. Logout and login again to get a fresh token with roles',
        ]
      }
    });

  } catch (error: any) {
    console.error('\n❌ ERROR IN VALIDATION:', error);
    return NextResponse.json({ 
      error: 'Failed to validate roles',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
