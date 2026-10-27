import type { Metadata } from "next";
import { FighterScreen } from "@/components/fighter-screen";

export const metadata: Metadata = {
  title: "Mis luchadores",
};

export default function FighterPage() {
  return <FighterScreen />;
}
