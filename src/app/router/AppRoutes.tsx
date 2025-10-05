import {Navigate, Route, Routes} from "react-router-dom";
import { ChartPage } from "@/presentation/pages/chart-page";
import React from "react";

export const AppRoutes = () =>
(
    <Routes>
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/" element={<Navigate to="/chart" replace />} />
    </Routes>
);