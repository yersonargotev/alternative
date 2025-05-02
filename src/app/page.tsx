
export default function Home() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="absolute top-0 right-0 left-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-2xl">FactuStorm</h1>
            <div className="flex items-center gap-2">
              <button type="button" className="text-sm">
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex h-full flex-1 items-center justify-center overflow-auto">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-2xl">FactuStorm</h2>
            <div className="flex items-center gap-2">
              <button type="button" className="text-sm">
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="relative z-10 border-border/40 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-2xl">FactuStorm</h2>
            <div className="flex items-center gap-2">
              <button type="button" className="text-sm">
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>

  );
}
