import { useQuery } from "@tanstack/react-query";
import { HttpUserRepository } from "@/infrastructure/repositories/HttpUserRepository";
import { getUserProfile } from "@/domain/usecases/getUserProfile";
import React from "react";

const repo = new HttpUserRepository();

export const HomePage = () =>
{
    const { data, isLoading } = useQuery({
        queryKey: ["user", "1"],
        queryFn: () => getUserProfile(repo, "1"),
    });

    if (isLoading)
        return <p>Loading...</p>;

    return (
        <div className="p-6 bg-red-600">
            Home Page
        </div>
    );
};
