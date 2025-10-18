
import './globals.css';

export const metadata = {
  title: "CarbonIQ - Carbon Emission Management System",
  description: "Manage and track carbon emissions for individuals and mining operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}



