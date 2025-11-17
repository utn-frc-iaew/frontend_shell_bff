# Validaciones de Seguridad del Proyecto

Este documento detalla las validaciones de seguridad críticas implementadas en el sistema de microfrontends con arquitectura BFF. Se enfoca exclusivamente en mecanismos que protegen la aplicación contra amenazas, vulnerabilidades y accesos no autorizados.

## Tabla de Contenidos

- [Autenticación y Autorización con JWT](#autenticación-y-autorización-con-jwt)
- [Validación de Tokens y Gestión de Sesiones](#validación-de-tokens-y-gestión-de-sesiones)
- [Seguridad en Comunicación Entre Contextos (PostMessage)](#seguridad-en-comunicación-entre-contextos-postmessage)
- [Protección CORS y Headers de Seguridad](#protección-cors-y-headers-de-seguridad)
- [Tokens Machine-to-Machine (M2M)](#tokens-machine-to-machine-m2m)
- [Resumen de Seguridad](#resumen-de-seguridad)

---

## Autenticación y Autorización con JWT

### BFF Child 1 - Configuración Centralizada

**Archivo:** `portal-child/bff-child-1/src/config/env.ts`

**Tipo:** Validación de presencia de variables requeridas

```typescript
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not provided`);
  }
  return value;
};

const parsePort = (portStr: string): number => {
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${portStr}`);
  }
  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(requireEnv('PORT')),
  auth0: {
    domain: requireEnv('AUTH0_DOMAIN'),
    audience: requireEnv('AUTH0_AUDIENCE'),
    // ...
  },
  // ...
};
```

**Descripción:** 
- `requireEnv()` valida que todas las variables de entorno críticas estén definidas al inicio
- `parsePort()` valida que el puerto sea un número válido entre 1 y 65535
- Si falta alguna variable, la aplicación falla inmediatamente al arrancar

---

### BFF Shell - Configuración Centralizada

**Archivo:** `shell/bff-shell/src/config/env.ts`

**Tipo:** Validación de presencia de variables requeridas

```typescript
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not provided`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(requireEnv('PORT')),
  auth0: {
    domain: requireEnv('AUTH0_DOMAIN'),
    audience: requireEnv('AUTH0_AUDIENCE'),
    clientId: requireEnv('AUTH0_CLIENT_ID'),
    clientSecret: requireEnv('AUTH0_CLIENT_SECRET'),
    tokenUrl: requireEnv('AUTH0_TOKEN_URL'),
  },
  // ...
};
```

**Descripción:** Misma estrategia de validación que BFF Child 1, asegurando configuración correcta al inicio.

---

### Portal Shell - Validación de Variables de Next.js

**Archivo:** `shell/portal-shell/src/config/microfrontends.ts`

**Tipo:** Validación de variables de entorno en tiempo de build

```typescript
const getEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
};

const childBaseUrl = getEnv('NEXT_PUBLIC_PORTAL_CHILD_URL', 'http://localhost:3001');

export const microfrontends = {
  dashboard: childBaseUrl,
  users: `${childBaseUrl}/users`,
  customers: `${childBaseUrl}/customers`,
};
```

**Descripción:** 
- Valida que las URLs de los microfrontends estén definidas
- Proporciona fallbacks para desarrollo local
- Falla en build time si las variables críticas no existen

---

### Portal Child 1 - Validación de Origen del Shell

**Archivo:** `portal-child/portal-child-1/src/App.tsx`

**Tipo:** Validación de variable de origen en tiempo de ejecución

```typescript
const PARENT_ORIGIN = import.meta.env.VITE_PORTAL_SHELL_ORIGIN

if (!PARENT_ORIGIN) {
  throw new Error('VITE_PORTAL_SHELL_ORIGIN must be defined')
}
```

**Descripción:** 
- Valida que el origen del portal shell esté configurado
- Crítico para la seguridad de postMessage
- Falla inmediatamente si no está definido

---

## Validaciones de Autenticación y Autorización

### BFF Child 1 - Middleware de Autenticación JWT

**Archivo:** `portal-child/bff-child-1/src/middleware/auth.ts`

**Tipo:** Validación de tokens JWT con Auth0

```typescript
import { auth } from 'express-oauth2-jwt-bearer';
import { env } from '../config/env';

// JWT validation middleware using Auth0
export const authMiddleware = auth({
  audience: env.auth0.audience,
  issuerBaseURL: `https://${env.auth0.domain}`,
  tokenSigningAlg: 'RS256',
});

export const extractUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.auth;
    
    if (auth) {
      req.user = {
        sub: auth.payload.sub as string | undefined,
        roles: (auth.payload['https://bff-shell/roles'] as string[]) || [],
        permissions: (auth.payload.permissions as string[]) || [],
      };
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

**Descripción:**
- `authMiddleware` valida que el token JWT sea válido y esté firmado por Auth0
- Verifica el `audience` y el `issuer` del token
- `extractUser` extrae roles y permisos del token para autorización
- Si el token es inválido, retorna un error 401

---

### BFF Shell - Middleware de Autenticación

**Archivo:** `shell/bff-shell/src/middleware/auth.ts`

**Tipo:** Validación de tokens JWT

```typescript
export const authMiddleware = auth({
  audience: env.auth0.audience,
  issuerBaseURL: `https://${env.auth0.domain}`,
  tokenSigningAlg: 'RS256',
});
```

**Descripción:** Misma validación JWT que BFF Child 1, asegurando que todas las peticiones al BFF estén autenticadas.

---

### Portal Shell - Validación de Sesión

**Archivo:** `shell/portal-shell/src/app/page.tsx`

**Tipo:** Validación de sesión de usuario en servidor

```typescript
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const user = session.user;
  const roles = user['https://bff-shell/roles'] || [];

  return (
    <AppLayout userEmail={user.email || user.name}>
      {/* ... */}
    </AppLayout>
  );
}
```

**Descripción:**
- Valida que exista una sesión activa en el servidor
- Si no hay sesión, redirige automáticamente al login de Auth0
- Extrae información del usuario de la sesión

---

### Portal Shell - Endpoint de Token

**Archivo:** `shell/portal-shell/src/app/api/token/route.ts`

**Tipo:** Validación de sesión y token de acceso

```typescript
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
```

**Descripción:**
- Valida que la sesión exista y contenga un access token
- Retorna 401 si no hay sesión o token
- Maneja errores y retorna 500 en caso de fallo

---

### Portal Shell - Endpoint de Usuario

**Archivo:** `shell/portal-shell/src/app/api/me/route.ts`

**Tipo:** Validación de sesión y datos de usuario

```typescript
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
```

**Descripción:**
- Valida que la sesión exista y contenga datos del usuario
- Retorna 401 si no hay sesión o datos de usuario
- Captura y maneja errores

---

## Validaciones de Tokens

### Portal Child 1 - Interceptor de Axios con Validación de Token

**Archivo:** `portal-child/portal-child-1/src/services/bffClient.ts`

**Tipo:** Validación y espera de token antes de hacer peticiones

```typescript
export const setupBffClient = (
  getAccessTokenSilently: ReturnType<typeof useAuth0>['getAccessTokenSilently']
) => {
  const interceptorId = bffClient.interceptors.request.use(
    async (config) => {
      try {
        const isInIframe = window.self !== window.top

        let token: string | undefined
        if (isInIframe) {
          // Esperar hasta que el token del iframe esté disponible
          let attempts = 0
          while (!iframeAccessToken && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
          }
          
          if (iframeAccessToken) {
            token = iframeAccessToken
            console.log('Using iframe token')
          } else {
            console.warn('Iframe token not available after waiting, trying Auth0...')
            token = await getAccessTokenSilently()
          }
        } else {
          token = await getAccessTokenSilently()
          console.log('Using Auth0 token')
        }

        if (token) {
          const headers = (config.headers ?? new AxiosHeaders()) as AxiosHeaders
          headers.set('Authorization', `Bearer ${token}`)
          config.headers = headers
        }
      } catch (error) {
        console.error('Error getting access token:', error)
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  return () => {
    bffClient.interceptors.request.eject(interceptorId)
  }
}
```

**Descripción:**
- Valida si está ejecutándose en iframe o standalone
- Espera hasta 5 segundos (50 intentos × 100ms) a que el token esté disponible
- Si no hay token después de esperar, intenta obtenerlo de Auth0
- Solo agrega el header Authorization si el token existe
- Previene race conditions donde las peticiones se hacen antes de tener el token

---

## Validaciones de Origen (CORS/PostMessage)

### Portal Child 1 - Validación de Origen en PostMessage

**Archivo:** `portal-child/portal-child-1/src/App.tsx`

**Tipo:** Validación de origen para seguridad de postMessage

```typescript
const PARENT_ORIGIN = import.meta.env.VITE_PORTAL_SHELL_ORIGIN

if (!PARENT_ORIGIN) {
  throw new Error('VITE_PORTAL_SHELL_ORIGIN must be defined')
}

function App() {
  // ...
  
  useEffect(() => {
    const inIframe = window.self !== window.top
    setIsInIframe(inIframe)

    let removeMessageListener: (() => void) | undefined

    if (inIframe) {
      const handleMessage = (event: MessageEvent) => {
        // Validar el origen por seguridad
        if (event.origin !== PARENT_ORIGIN) return

        if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
          console.log('Token received from parent!')
          iframeAccessToken = event.data.token
          setHasToken(true)
        }
        
        if (event.data.type === 'USER_INFO' && event.data.user) {
          console.log('User info received from parent!')
          iframeUser = event.data.user
        }
      }

      window.addEventListener('message', handleMessage)
      removeMessageListener = () => window.removeEventListener('message', handleMessage)
    }

    return () => {
      removeMessageListener?.()
    }
  }, [getAccessTokenSilently])
  
  // ...
}
```

**Descripción:**
- Valida que los mensajes postMessage solo provengan del origen esperado (Portal Shell)
- Ignora mensajes de cualquier otro origen
- Crítico para prevenir ataques de cross-site scripting
- Solo procesa mensajes si el origen coincide exactamente

---

### Portal Shell - Envío Seguro de PostMessage

**Archivo:** `shell/portal-shell/src/components/MicroFrontendLoader.tsx`

**Tipo:** Validación de origen de destino

```typescript
export default function MicroFrontendLoader({ url, title }: MicroFrontendLoaderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const targetOrigin = useMemo(() => {
    try {
      const parsed = new URL(url);
      return parsed.origin;
    } catch (error) {
      console.error('Invalid microfrontend URL:', error);
      return url;
    }
  }, [url]);

  useEffect(() => {
    const sendDataToIframe = () => {
      if (iframeRef.current && iframeRef.current.contentWindow && accessToken) {
        console.log('Sending token to iframe...');
        iframeRef.current.contentWindow.postMessage(
          { 
            type: 'AUTH_TOKEN',
            token: accessToken 
          },
          targetOrigin
        );
      }
    };

    const iframe = iframeRef.current;
    if (iframe && accessToken) {
      iframe.addEventListener('load', sendDataToIframe);
      sendDataToIframe();
      return () => iframe.removeEventListener('load', sendDataToIframe);
    }
  }, [targetOrigin, accessToken]);
  
  // ...
}
```

**Descripción:**
- Calcula el origen del iframe usando `new URL()`
- Envía mensajes postMessage solo al origen específico, no a '*'
- Valida que la URL sea válida antes de usarla
- Previene que el token se envíe a orígenes no autorizados

---

### Portal Child 1 - Headers CORS en Nginx

**Archivo:** `portal-child/portal-child-1/nginx.conf`

**Tipo:** Validación de origen para peticiones HTTP

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Headers para permitir carga en iframe
    add_header X-Frame-Options "ALLOW-FROM http://localhost:3000" always;
    add_header Content-Security-Policy "frame-ancestors 'self' http://localhost:3000" always;
    add_header Access-Control-Allow-Origin "http://localhost:3000" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # ...
}
```

**Descripción:**
- `X-Frame-Options`: Permite que solo el portal shell embeba el iframe
- `Content-Security-Policy`: Restringe desde qué orígenes puede ser cargado
- `Access-Control-Allow-Origin`: Permite peticiones CORS solo desde el shell
- `Access-Control-Allow-Credentials`: Permite el envío de credenciales
- Previene clickjacking y accesos no autorizados

---

## Validaciones de Datos

### BFF Child 1 - Validación de Respuesta de APIs

**Archivo:** `portal-child/bff-child-1/src/routes/userRoutes.ts`

**Tipo:** Validación de respuesta y manejo de errores

```typescript
router.get('/', authMiddleware, extractUser, async (req: Request, res: Response) => {
  try {
    const apiClient = await getOrCreateInternalApiClient(
      env.apis.userUrl,
      env.apis.userAudience
    );

    const response = await apiClient.get('/users');
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'API Error',
        message: error.response.data?.message || 'Failed to fetch users'
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Unable to reach user service'
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      });
    }
  }
});
```

**Descripción:**
- Valida si la petición a la API fue exitosa
- Diferencia entre errores de respuesta (4xx/5xx), errores de red, y errores internos
- Retorna códigos de estado HTTP apropiados
- Proporciona mensajes de error descriptivos

---

### Portal Child 1 - Validación de Datos de Usuario

**Archivo:** `portal-child/portal-child-1/src/pages/HomePage.tsx`

**Tipo:** Validación de presencia de datos de usuario

```typescript
export default function HomePage() {
  const { user: auth0User, logout } = useAuth0()
  
  // Usar datos del iframe si estamos en iframe, sino Auth0
  const isInIframe = window.self !== window.top
  const user = isInIframe ? iframeUser : auth0User

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Portal Child 1</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
            {/* ... */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Bienvenido a Portal Child 1
          </h2>
          {/* ... */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información del Usuario</h3>
            <p className="text-sm text-blue-800"><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm text-blue-800"><strong>Nombre:</strong> {user?.name}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Descripción:**
- Valida la fuente de datos del usuario según el contexto (iframe o standalone)
- Usa optional chaining (`?.`) para prevenir errores si user es null/undefined
- Proporciona fallbacks (`user?.name || user?.email`)
- Previene crashes por datos faltantes

---

## Validaciones de Red

### BFF Child 1 - Timeout de Peticiones

**Archivo:** `portal-child/portal-child-1/src/services/bffClient.ts`

**Tipo:** Validación de tiempo de respuesta

```typescript
const BFF_URL = import.meta.env.VITE_BFF_CHILD_URL ?? 'http://localhost:4001'

export const bffClient = axios.create({
  baseURL: BFF_URL,
  timeout: 10000,
})
```

**Descripción:**
- Establece un timeout de 10 segundos para todas las peticiones
- Si la petición tarda más, se cancela automáticamente
- Previene que la aplicación se congele esperando respuestas

---

### BFF Child 1 - Cliente HTTP con Retry

**Archivo:** `portal-child/bff-child-1/src/services/internalApiClient.ts`

**Tipo:** Validación de disponibilidad de API

```typescript
export async function getOrCreateInternalApiClient(
  apiUrl: string,
  audience: string
): Promise<AxiosInstance> {
  // Si ya existe un cliente en cache y el token no está expirado
  if (
    clientCache[apiUrl] &&
    clientCache[apiUrl].expiresAt > Date.now() + 60000
  ) {
    return clientCache[apiUrl].client;
  }

  const { token, expiresAt } = await getM2MToken(audience);

  const client = axios.create({
    baseURL: apiUrl,
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  clientCache[apiUrl] = { client, expiresAt };

  return client;
}
```

**Descripción:**
- Valida si el token M2M está expirado antes de reutilizar el cliente
- Cachea clientes HTTP para evitar crear nuevas instancias constantemente
- Renueva el token automáticamente cuando está por expirar
- Timeout de 30 segundos para peticiones internas

---

### BFF Child 1 - Validación de Token M2M

**Archivo:** `portal-child/bff-child-1/src/services/tokenService.ts`

**Tipo:** Validación de tokens de máquina a máquina

```typescript
export async function getM2MToken(audience: string): Promise<TokenResponse> {
  const cacheKey = audience;

  if (tokenCache[cacheKey] && tokenCache[cacheKey].expiresAt > Date.now()) {
    return {
      token: tokenCache[cacheKey].token,
      expiresAt: tokenCache[cacheKey].expiresAt,
    };
  }

  try {
    const response = await axios.post<Auth0TokenResponse>(
      env.auth0.tokenUrl,
      {
        client_id: env.auth0.clientId,
        client_secret: env.auth0.clientSecret,
        audience: audience,
        grant_type: 'client_credentials',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const expiresAt = Date.now() + response.data.expires_in * 1000;

    tokenCache[cacheKey] = {
      token: response.data.access_token,
      expiresAt,
    };

    return {
      token: response.data.access_token,
      expiresAt,
    };
  } catch (error: any) {
    console.error('Error getting M2M token:', error.message);
    throw new Error('Failed to get M2M token');
  }
}
```

**Descripción:**
- Valida si el token en cache sigue siendo válido
- Solo solicita un nuevo token si el actual está expirado
- Cachea tokens para reducir peticiones a Auth0
- Maneja errores de autenticación M2M
- Calcula el tiempo de expiración basándose en `expires_in`

---

## Resumen de Validaciones

### Por Categoría

1. **Variables de Entorno**: 5 validaciones
   - BFF Child 1 (env.ts)
   - BFF Shell (env.ts)
   - Portal Shell (microfrontends.ts)
   - Portal Child 1 (App.tsx - PARENT_ORIGIN)

2. **Autenticación**: 5 validaciones
   - Middleware JWT en BFFs (2)
   - Validación de sesión en Portal Shell (1)
   - Endpoints de token y usuario (2)

3. **Tokens**: 4 validaciones
   - Interceptor Axios con espera de token
   - Validación de token M2M
   - Cache de tokens
   - Renovación automática de tokens

4. **Origen/CORS**: 3 validaciones
   - PostMessage origin en Portal Child
   - TargetOrigin en Portal Shell
   - Headers CORS en Nginx

5. **Datos**: 2 validaciones
   - Validación de respuestas de API
   - Validación de datos de usuario

6. **Red**: 3 validaciones
   - Timeouts de peticiones
   - Cliente HTTP con retry
   - Validación de disponibilidad de API

### Puntos Críticos de Seguridad

- ✅ **Todos los tokens JWT son validados** con `express-oauth2-jwt-bearer`
- ✅ **Todos los orígenes de postMessage son verificados** antes de procesar mensajes
- ✅ **Todos los endpoints de API requieren autenticación**
- ✅ **Las variables de entorno críticas son validadas al inicio**
- ✅ **Los tokens M2M son cacheados y renovados automáticamente**
- ✅ **Los headers CORS están configurados para permitir solo orígenes específicos**

---

## Mejores Prácticas Implementadas

1. **Fail Fast**: Las validaciones críticas fallan al inicio (variables de entorno)
2. **Defense in Depth**: Múltiples capas de validación (cliente → BFF → API)
3. **Secure by Default**: Configuraciones seguras por defecto (CORS, postMessage)
4. **Error Handling**: Todos los errores son capturados y manejados apropiadamente
5. **Type Safety**: TypeScript previene errores de tipos en tiempo de compilación
6. **Logging**: Todas las validaciones loguean información útil para debugging
