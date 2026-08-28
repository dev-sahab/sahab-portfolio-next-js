import type { Metadata } from "next";
import NotFoundContent from "@/components/site/NotFoundContent";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main>
      <NotFoundContent />
    </main>
  );
}
