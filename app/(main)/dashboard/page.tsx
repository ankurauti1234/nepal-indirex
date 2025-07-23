'use client'
import { logout } from "@/services/auth.service";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}