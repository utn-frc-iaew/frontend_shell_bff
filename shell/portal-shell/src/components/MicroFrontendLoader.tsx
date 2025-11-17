'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface MicroFrontendLoaderProps {
  url: string;
  title: string;
}

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
    // Obtener el token del endpoint
    fetch('/api/token')
      .then(res => res.json())
      .then(data => {
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      })
      .catch(err => console.error('Error fetching token:', err));
    
    // Obtener información del usuario
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // Enviar usuario al iframe cuando esté cargado
          const iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: 'USER_INFO',
                user: data.user
              },
              targetOrigin
            );
          }
        }
      })
      .catch(err => console.error('Error fetching user:', err));
  }, [targetOrigin]);

  useEffect(() => {
    // Enviar el token al iframe cuando esté disponible y el iframe cargue
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
      // También enviar inmediatamente por si ya está cargado
      sendDataToIframe();
      return () => iframe.removeEventListener('load', sendDataToIframe);
    }
  }, [targetOrigin, accessToken]);

  return (
    <div className="w-full h-full bg-white" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <iframe
        ref={iframeRef}
        src={url}
        title={title}
        className="w-full h-full border-2 border-blue-300"
        style={{ 
          minHeight: 'calc(100vh - 100px)', 
          display: 'block',
          width: '100%',
          height: '100%'
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        allow="fullscreen"
      />
    </div>
  );
}
