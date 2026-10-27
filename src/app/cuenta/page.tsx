import type { Metadata } from "next";
import { AccountScreen } from "@/components/account-menu";

export const metadata: Metadata = {
  title: "Cuenta",
};

export default function CuentaPage() {
  return <AccountScreen />;
}
