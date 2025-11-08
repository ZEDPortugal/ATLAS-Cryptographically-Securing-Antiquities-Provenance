"use client";
import Image from "next/image";
import MainRouter from "./components/mainRouter";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <MainRouter />
    </ProtectedRoute>
  );
}
