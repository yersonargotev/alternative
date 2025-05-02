import { SparkyDevsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-border/40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkyDevsIcon className="size-10" />
            <span className="font-semibold">FactuStorm</span>
          </div>
          <nav
            className={cn(
              "z-50 flex w-full flex-col items-center gap-2 pb-8 md:flex md:h-20 md:w-auto md:flex-row md:p-0"
            )}
          >
            <Link href="/dashboard">
              <Button variant="default">Dashboard</Button>
            </Link>
            <Link href="/plans">
              <Button variant="ghost">Planes</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex h-full flex-1 items-center justify-center overflow-auto">
        <div className="container mx-auto my-auto flex h-full max-w-2xl flex-col items-center justify-center">
          {/* App Title */}
          <div className="mb-8 flex items-center justify-center gap-4 px-4 text-center">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-base text-muted-foreground uppercase">
                FactuStorm
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="relative z-10 border-border/40 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-8 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <a
              href="https://github.com/sparkydevs/factustorm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/SparkyDevs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Twitter
            </a>
            <div className="animate-pulse rounded-full bg-[#5865F2] p-1">
              <a
                href="https://discord.gg/SparkyDevs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Discord
              </a>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            Built by{" "}
            <a
              href="https://github.com/SparkyDevs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              SparkyDevs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}