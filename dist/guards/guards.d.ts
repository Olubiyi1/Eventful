interface TokenPayload {
    id: string;
    email: string;
    role: string;
}
interface RefreshTokenResult {
    refreshToken: string;
    hashedToken: string;
}
export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
declare class Guards {
    static createAccessToken: (user: TokenPayload) => string;
    static createRefreshToken: () => RefreshTokenResult;
    static hashPassword: (password: string) => string;
    static comparePassword: (password: string, hashPassword: string) => Promise<boolean>;
    static verifyAccessToken: (token: string) => JwtPayload;
}
export default Guards;
