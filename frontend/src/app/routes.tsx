import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./layout/RootLayout";
import { LandingPage } from "@/pages/LandingPage";
import { ChapterPage } from "@/pages/ChapterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "chapter/:id", element: <ChapterPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
