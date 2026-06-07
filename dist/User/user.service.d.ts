import { Role } from "../../generated/prisma";
interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: Role;
}
interface LoginData {
    email: string;
    password: string;
}
interface RegisterResponse {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
        emailVerifiedAt: Date | null;
    };
    message: string;
}
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
        emailVerifiedAt: Date | null;
    };
}
interface ProfileResponse {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
        emailVerifiedAt: Date | null;
        createdAt: Date;
    };
}
declare class UserService {
    static register: (userData: UserData) => Promise<RegisterResponse>;
    static verifyEmail: (token: string) => Promise<{
        message: string;
    }>;
    static login: (userData: LoginData) => Promise<LoginResponse>;
    static profile: (userId: string) => Promise<ProfileResponse>;
}
export default UserService;
