import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavHeader } from "@/components/NavHeader";
import { ScrollToTopOnRouteChange } from "@/components/ScrollToTopOnRouteChange";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GMDB",
  description: "Search and sort movies with TMDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        />
      </head>
      <body className="max-w-full">
        <ScrollToTopOnRouteChange />
        <Script
          src="https://kit.fontawesome.com/f92549a95d.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <NavHeader />
        <div className="side-bars">
          <div className="left-bar" />
          <div className="right-bar" />
        </div>
        {children}
        <footer>
          <Link href="/" className="logo">
            GMDB
          </Link>
          <div className="links">
            <a href="" className="link__wrapper">
              <i className="fa-brands fa-x-twitter link" />
            </a>
            <a href="" className="link__wrapper">
              <i className="fa-brands fa-instagram link" />
            </a>
            <a href="" className="link__wrapper">
              <i className="fa-brands fa-tiktok link" />
            </a>
            <a href="" className="link__wrapper">
              <i className="fa-brands fa-facebook link" />
            </a>
          </div>
          <h1 className="copyright">© Gabriel Moore 2026</h1>
        </footer>
      </body>
    </html>
  );
}
