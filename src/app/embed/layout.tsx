// Embed layout — no navbar, no footer, no analytics
// Used by the builder in goautos-admin to show exact previews via iframe

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return just the children without navbar/footer
  // The parent RootLayout still provides HeroUIProvider, ClientProvider, ThemeProvider, etc.
  // We just need to hide the Navbar and Footer that are in the root layout
  return (
    <>
      <style>{`
        /* Hide navbar and footer when inside /embed route */
        nav, footer, [data-navbar], [data-footer] { display: none !important; }
        /* Remove padding that accounts for navbar */
        .pt-16 { padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
