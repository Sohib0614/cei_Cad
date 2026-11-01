import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CEI Estimation LLC — Precision CAD Takeoff & Estimating Suite',
  description: 'Enterprise CAD and Blueprint Takeoff Platform for Roofing, Siding, Gutters, Concrete, Insulation, and Paint.',
  icons: {
    icon: '/branding/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cei-slate-900 text-slate-100 antialiased h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}

