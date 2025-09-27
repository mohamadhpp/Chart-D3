import { User } from "../entities/User";
import { UserRepository } from "../services/UserRepository";

export const getUserProfile = async (
    repo: UserRepository,
    id: string
): Promise<User> =>
{
    return await repo.getUserById(id);
};
