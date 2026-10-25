import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  notFound();
}

export default function UnmatchedPage() {
  // Resolve the root 404 metadata even when the parallel modal slot matches.
  notFound();
}
