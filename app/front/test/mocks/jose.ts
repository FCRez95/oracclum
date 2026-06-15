type JwtPayload = Record<string, unknown>;

export const jwtVerify = jest.fn(async () => ({
  payload: {},
}));

export class SignJWT {
  private readonly payload: JwtPayload;

  constructor(payload: JwtPayload) {
    this.payload = payload;
  }

  setProtectedHeader() {
    return this;
  }

  setIssuedAt() {
    return this;
  }

  setExpirationTime() {
    return this;
  }

  async sign() {
    return `mock-jwt.${Buffer.from(JSON.stringify(this.payload)).toString("base64url")}`;
  }
}
