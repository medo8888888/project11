import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Landing } from "@/components/marketing/Landing";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "PM" ? "/dashboard" : "/reviews");
  return <Landing />;
}
