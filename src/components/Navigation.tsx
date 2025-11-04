import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Image, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);

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

  return (
    <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 elegant-transition hover:scale-105">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Yam & Gy
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant={isActive("/") ? "default" : "ghost"}
              className="elegant-transition"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/memorias") ? "default" : "ghost"}
              className="elegant-transition"
            >
              <Link to="/memorias">
                <Image className="h-4 w-4 mr-2" />
                Nossas Memórias
              </Link>
            </Button>

            {user ? (
              <Button
                asChild
                variant={isActive("/admin") ? "default" : "ghost"}
                className="elegant-transition"
              >
                <Link to="/admin">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant={isActive("/login") ? "default" : "ghost"}
                className="elegant-transition"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
