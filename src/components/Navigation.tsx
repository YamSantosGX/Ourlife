import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/memorias", label: "Nossas Memórias" },
  ];

  const authLink = user
    ? { path: "/admin", label: "Admin" }
    : { path: "/login", label: "Login" };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 elegant-transition hover:scale-105">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Love
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                asChild
                variant={isActive(link.path) ? "default" : "ghost"}
                className="elegant-transition"
                size="sm"
              >
                <Link to={link.path}>{link.label}</Link>
              </Button>
            ))}
            <Button
              asChild
              variant={isActive(authLink.path) ? "default" : "ghost"}
              className="elegant-transition"
              size="sm"
            >
              <Link to={authLink.path}>{authLink.label}</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background border-border">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Button
                      key={link.path}
                      asChild
                      variant={isActive(link.path) ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={handleLinkClick}
                    >
                      <Link to={link.path}>{link.label}</Link>
                    </Button>
                  ))}
                  <Button
                    asChild
                    variant={isActive(authLink.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={handleLinkClick}
                  >
                    <Link to={authLink.path}>{authLink.label}</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
