import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAPTERS, getChapterById } from "@/app/config/chapters";
import { api } from "@/app/api/client";
import type { ChapterMeta } from "@/app/api/types";

export function LandingPage() {
  const [chaptersFromApi, setChaptersFromApi] = useState<ChapterMeta[] | null>(null);

  useEffect(() => {
    api.getChapters().then((r) => setChaptersFromApi(r.chapters)).catch(() => setChaptersFromApi(null));
  }, []);

  const list = chaptersFromApi?.length ? chaptersFromApi : CHAPTERS;

  return (
    <div className="space-y-10">
      <section className="space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Linear Algebra Playground</h2>
        <p className="text-muted-foreground mx-auto max-w-xl">
          Interactive tools for learning linear algebra. Pick a chapter to get started.
        </p>
        <Link to={`/chapter/${CHAPTERS[0].id}`}>
          <Button>Start learning</Button>
        </Link>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Chapters</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list
            .slice()
            .sort((a, b) => (a.order ?? getChapterById(a.id)?.order ?? 0) - (b.order ?? getChapterById(b.id)?.order ?? 0))
            .map((ch) => (
              <Link key={ch.id} to={`/chapter/${ch.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {ch.order ?? getChapterById(ch.id)?.order}. {ch.title}
                    </CardTitle>
                    <CardDescription>
                      {ch.shortDescription ?? getChapterById(ch.id)?.shortDescription ?? "—"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
