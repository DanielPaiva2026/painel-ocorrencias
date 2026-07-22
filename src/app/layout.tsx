import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { LayoutWrapper } from '@/components/LayoutWrapper';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'AlpiSerra - Painel de Ocorrências',
  description: 'Sistema integrado de Serviços Terceirizados',
  manifest: "/manifest.json",
  themeColor: "#0f766e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AlpiSerra",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-sans antialiased flex h-screen overflow-hidden bg-slate-50 relative`}>
        {/* Background blobs for aesthetics */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-brand-cyan/20 blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-teal/10 blur-3xl -z-10" />
        
        {/* Watermark Logo */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-10">
          <img src="/logo.png" alt="AlpiSerra Watermark" className="w-[600px] max-w-[80vw] object-contain" />
        </div>
        
        <LayoutWrapper>
          {children}
        </LayoutWrapper>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
