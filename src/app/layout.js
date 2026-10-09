import "./globals.css";

export const metadata = {
  title: "Susali — Healthcare Referral Management",
  description: "Digital patient journey management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}