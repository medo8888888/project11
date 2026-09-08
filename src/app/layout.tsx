import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Approval & SLA Routing",
  description: "PM approval workflow with automated discipline-review SLA routing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
