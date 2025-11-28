import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="w-full border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-bold">Res-Q AI</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="transition-colors hover:bg-accent hover:text-accent-foreground" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" asChild>
              <Link to="/incident/create">Create Incident</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}