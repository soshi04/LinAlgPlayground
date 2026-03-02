export interface ChapterMeta {
  id: string;
  order: number;
  title: string;
  slug: string;
  shortDescription?: string;
}

export interface ChaptersResponse {
  chapters: ChapterMeta[];
}

export interface ChapterPlaceholderResponse {
  chapterId: string;
  status: "placeholder";
}
