import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  const session = cookies().get("neotravel_session");

  if (!session || session.value !== "direction") {
    redirect("/login");
  }

  return <DashboardClient />;
}