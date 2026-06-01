import crypto from "crypto"
import config from "../config/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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

class Guards {
  static createAccessToken = (user: TokenPayload): string => {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.secret_key,
      { expiresIn: "15m" }
    );
    return token;
  };

  static createRefreshToken = (): RefreshTokenResult => {
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    return { refreshToken, hashedToken };
  };

  static hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
  };

  static comparePassword = async (
    password: string,
    hashPassword: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
  };
  static verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.secret_key) as JwtPayload;
};
}

export default Guards;