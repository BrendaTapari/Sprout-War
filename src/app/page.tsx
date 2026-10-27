import type { Metadata } from "next";
import { HomeScreen } from "@/components/home-screen";

export const metadata: Metadata = {
  title: "Ring",
};

export default function HomePage() {
  return <HomeScreen />;
}
