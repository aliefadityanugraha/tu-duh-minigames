import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SocketProvider } from '../hooks/useSocket';
import '../../styles/globals.css';

// Entry point utama Next.js untuk merender layout global dan membungkus SocketProvider
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  // Penanganan transisi efek fade-out saat berpindah rute halaman (misal lobi -> game)
  useEffect(() => {
    const handleStart = () => setTransitioning(true);
    const handleComplete = () => setTransitioning(false);

    // Mendaftarkan event router
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // Bersihkan listener event router saat komponen di-unmount
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <SocketProvider>
      {/* Container transisi dengan efek opasitas CSS yang halus */}
      <div 
        className="transition-opacity duration-300 ease-in-out"
        style={{
          opacity: transitioning ? 0 : 1,
          pointerEvents: transitioning ? 'none' : 'auto',
          minHeight: '100vh',
        }}
      >
        <Component {...pageProps} />
      </div>
    </SocketProvider>
  );
}
