"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    }
    if (isLoggedIn && pathname === "/login") {
      router.replace("/");
    }
  }, [router, pathname]);

  if (!loggedIn && pathname === "/login") {
    // On login page, not logged in: show only children (login form)
    return <main className="w-full">{children}</main>;
  }

  if (!loggedIn) {
    // Not logged in, but not on login page: don't render anything (redirecting)
    return null;
  }

  // Logged in: show sidebar, navbar, and children
  return (
    <>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </>
  );
}