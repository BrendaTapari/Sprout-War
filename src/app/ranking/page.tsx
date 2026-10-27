import type { Metadata } from "next";
import { RankingScreen } from "@/components/ranking-screen";

export const metadata: Metadata = {
  title: "Ranking",
};

export default function RankingPage() {
  return <RankingScreen />;
}
