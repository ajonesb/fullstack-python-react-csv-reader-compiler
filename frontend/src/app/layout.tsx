import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Catalog - CSV Upload and Multi-Currency Pricing',
  description: 'Upload CSV files and manage product inventory with multi-currency pricing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
