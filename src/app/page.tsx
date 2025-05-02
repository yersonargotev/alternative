import Image from "next/image";

export default async function LandingPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="absolute top-0 right-0 left-0 z-50">
        Anuncio
      </div>
      {/* Background Image */}
      <Image
        src="/vercel.svg"
        alt="Light ray background"
        width={2048}
        height={2048}
        className="-top-20 pointer-events-none absolute right-0 left-0 z-0 mx-auto hidden h-full w-full select-none md:block"
        priority
      />

      {/* Main Content */}
      <main className="relative z-10 flex h-full flex-1 items-center justify-center overflow-auto">
        <div className="container mx-auto my-auto flex h-full max-w-2xl flex-col items-center justify-center">
          {/* YouTube Video Link */}
          <div className="relative mb-6">
            <div
              className="absolute inset-[-8px] animate-[pulse_3s_ease-in-out_infinite] rounded-full bg-red-500/30 blur-lg"
              style={{ transform: "scale(1.2)" }}
            />
            <a
              href="https://www.youtube.com/@SparkyDevs"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block transition-transform hover:scale-105"
              aria-label="Watch us win at Cursor Hackathon"
            >
              YouTube
            </a>
          </div>

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
            </a>{" "}
            &{" "}
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