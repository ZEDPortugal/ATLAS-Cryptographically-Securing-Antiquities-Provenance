import { Geist, Geist_Mono, EB_Garamond, Roboto, Golos_Text} from "next/font/google";
import "./globals.css";
import ConditionalNav from "./components/ConditionalNav";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ATLAS - Artifact Authentication",
  description: "Cryptographically securing antiquities provenance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${golosText.variable} ${geistMono.variable} ${ebGaramond.variable} ${geistSans.variable} antialiased font-golosText`}
      >
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
              <ConditionalNav />
              <div className="flex-1">{children}</div>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
