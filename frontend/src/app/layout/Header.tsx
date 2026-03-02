export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-6">
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-lg font-semibold tracking-tight">Linear Algebra Playground</h1>
        <span className="text-muted-foreground text-sm hidden sm:inline">
          Interactive tools for learning linear algebra
        </span>
      </div>
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        GitHub
      </a>
    </header>
  );
}
