import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'Veridex — AI News Verification Platform',
  description: 'Verify any news claim, image, or article with multi-source AI analysis. Fight misinformation at scale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
