import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/presentation/pages/HomePage";
import { AboutPage } from "@/presentation/pages/AboutPage";
import React from "react";

export const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
    </Routes>
);