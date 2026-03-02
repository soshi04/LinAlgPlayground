import { useParams, Navigate } from "react-router-dom";
import { getChapterById } from "@/app/config/chapters";
import { Chapter1Home } from "@/chapters/ch1/ui/Chapter1Home";
import { Chapter2Home } from "@/chapters/ch2/ui/Chapter2Home";
import { Chapter3Home } from "@/chapters/ch3/ui/Chapter3Home";
import { Chapter4Home } from "@/chapters/ch4/ui/Chapter4Home";
import { Chapter5Home } from "@/chapters/ch5/ui/Chapter5Home";
import { Chapter6Home } from "@/chapters/ch6/ui/Chapter6Home";
import { Chapter7Home } from "@/chapters/ch7/ui/Chapter7Home";
import { Chapter8Home } from "@/chapters/ch8/ui/Chapter8Home";
import { Chapter9Home } from "@/chapters/ch9/ui/Chapter9Home";

const CHAPTER_HOMES: Record<string, React.ComponentType<{ chapterId: string; title: string; description: string }>> = {
  ch1: Chapter1Home,
  ch2: Chapter2Home,
  ch3: Chapter3Home,
  ch4: Chapter4Home,
  ch5: Chapter5Home,
  ch6: Chapter6Home,
  ch7: Chapter7Home,
  ch8: Chapter8Home,
  ch9: Chapter9Home,
};

export function ChapterPage() {
  const { id } = useParams<{ id: string }>();
  const chapter = id ? getChapterById(id) : undefined;

  if (!chapter || !CHAPTER_HOMES[chapter.id]) {
    return <Navigate to="/" replace />;
  }

  const Home = CHAPTER_HOMES[chapter.id];
  return (
    <Home
      chapterId={chapter.id}
      title={chapter.title}
      description={chapter.shortDescription}
    />
  );
}
