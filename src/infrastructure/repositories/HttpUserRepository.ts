import { User } from "@/domain/entities/User";
import { UserRepository } from "@/domain/services/UserRepository";
import { api } from "../api/client";

export class HttpUserRepository implements UserRepository
{
    async getUserById(id: string): Promise<User>
    {
        const res = await api.get(`/users/${id}`);
        return res.data;
    }
}
