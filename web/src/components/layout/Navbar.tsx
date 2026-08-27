"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Trophy,
  BookOpen,
  Puzzle,
  Play,
  Users,
  Info,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

const navLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/puzzles", label: "Puzzles", icon: Puzzle },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/live", label: "Live", icon: Play },
  { href: "/players", label: "Players", icon: Users },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="h-8 w-8 text-[#1B5E20]" fill="currentColor">
            <path d="M16 2C14.5 2 13 3 13 4.5V6H10V4.5C10 3 8.5 2 7 2S4 3 4 4.5V6L2 8V12H30V8L28 6V4.5C28 3 26.5 2 25 2S22 3 22 4.5V6H19V4.5C19 3 17.5 2 16 2ZM4 14V28C4 29.1 4.9 30 6 30H26C27.1 30 28 29.1 28 28V14H4ZM10 26H8V18H10V26ZM16 26H14V16H16V26ZM22 26H20V20H22V26Z" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-slate-900">Prochess</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 ${
                pathname.startsWith(href) ? "text-[#1B5E20]" : "text-slate-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth - Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-slate-100" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[#1B5E20] text-xs text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href="/dashboard" className="flex items-center gap-2" />}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/dashboard" className="flex items-center gap-2" />}>
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-md bg-[#1B5E20] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2E7D32]">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 ${
                    pathname.startsWith(href) ? "text-[#1B5E20]" : "text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-slate-200 pt-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => { await signOut(); setOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-slate-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setOpen(false)} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Sign in
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)} className="rounded-md bg-[#1B5E20] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#2E7D32]">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
