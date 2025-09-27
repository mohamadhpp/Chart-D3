import React from "react";
import { AppRoutes } from "./router/AppRoutes";

export const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <AppRoutes />
        </div>
    );
};