"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Truck, Plus, List, Package, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const customerLinks = [
  { href: "/post-job", label: "Post Job", icon: Plus },
  { href: "/my-jobs", label: "My Jobs", icon: List },
];

const driverLinks = [
  { href: "/browse", label: "Browse Jobs", icon: Package },
  { href: "/my-hauls", label: "My Hauls", icon: Truck },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
];

export default function Navbar({ role = "customer" }: { role?: "customer" | "driver" | "both" }) {
  const pathname = usePathname();
  const links =
    role === "driver"
      ? driverLinks
      : role === "both"
      ? [...customerLinks, ...driverLinks]
      : customerLinks;

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-orange-500 tracking-tight">
          HAUL
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <div className="ml-3">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
