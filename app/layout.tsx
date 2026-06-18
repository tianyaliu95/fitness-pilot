export const metadata = {
  title: 'Fitness Pilot',
  description: 'Vercel-ready Next.js + TypeScript app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
