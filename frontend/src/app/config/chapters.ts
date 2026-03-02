export interface ChapterMeta {
  id: string;
  order: number;
  title: string;
  slug: string;
  shortDescription: string;
}

export const CHAPTERS: ChapterMeta[] = [
  { id: "ch1", order: 1, title: "Linear Equations", slug: "linear-equations", shortDescription: "Systems of linear equations, row reduction, matrix form." },
  { id: "ch2", order: 2, title: "Linear Transformations", slug: "linear-transformations", shortDescription: "Matrix transformations, kernel and image." },
  { id: "ch3", order: 3, title: "Subspaces of Rⁿ and Their Dimensions", slug: "subspaces-of-rn-and-their-dimensions", shortDescription: "Basis, dimension, rank." },
  { id: "ch4", order: 4, title: "Linear Spaces", slug: "linear-spaces", shortDescription: "Abstract vector spaces, linear independence." },
  { id: "ch5", order: 5, title: "Orthogonality and Least Squares", slug: "orthogonality-and-least-squares", shortDescription: "Inner products, projections, least squares." },
  { id: "ch6", order: 6, title: "Determinants", slug: "determinants", shortDescription: "Properties and computation of determinants." },
  { id: "ch7", order: 7, title: "Eigenvalues and Eigenvectors", slug: "eigenvalues-and-eigenvectors", shortDescription: "Characteristic polynomial, diagonalization." },
  { id: "ch8", order: 8, title: "Symmetric Matrices and Quadratic Forms", slug: "symmetric-matrices-and-quadratic-forms", shortDescription: "Spectral theorem, quadratic forms." },
  { id: "ch9", order: 9, title: "Linear Differential Equations", slug: "linear-differential-equations", shortDescription: "Systems of linear ODEs, stability." },
];

export function getChapterById(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getChapterBySlug(slug: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}
