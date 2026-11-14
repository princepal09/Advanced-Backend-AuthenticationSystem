import { CodeChallengeMethod } from "google-auth-library";
import { env } from "../../../config/env.config.js";
import { googleClient } from "../../../lib/google.js";
import { generateOAuthState } from "../../../utils/auth/oauth.helper.js";
import { AppError } from "../../../utils/common/error/AppError.js";
import type { IAuthRepository } from "../auth.interface.js";
import type { AuthService } from "../auth.service.js";

export class GoogleOAuthService {
  constructor(
    private authRepo: IAuthRepository,
    private authService: AuthService,
  ) {}

  async generateGoogleAuthUrl() {
    const state = generateOAuthState();
    const { codeVerifier, codeChallenge } =
      await googleClient.generateCodeVerifierAsync();
    const url = googleClient.generateAuthUrl({
      state,
      scope: ["openid", "email"],
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    });

    return { url, state, codeVerifier };
  }

  async handleGoogleCallback(
    code: string,
    codeVerifier: string,
    session: { userAgent: string; ipAddress: string },
  ) {
    const identity = await this.verifyGoogleIdentity(code, codeVerifier);
    if (!identity?.sub || !identity.email || identity.email_verified !== true) {
      throw new AppError("Google must provide a verified email address", 401);
    }

    const account = await this.authRepo.findAuthAccount("GOOGLE", identity.sub);
    const user =
      account?.user ??
      (await this.authRepo.createGoogleUser(
        identity.email.trim().toLowerCase(),
        identity.sub,
      ));

    return this.authService.createUserSession(user, session);
  }

  private async verifyGoogleIdentity(code: string, codeVerifier: string) {
    try {
      const { tokens } = await googleClient.getToken({ code, codeVerifier });
      if (!tokens.id_token) {
        throw new AppError("Google did not return an ID token", 502);
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // The client error can contain the authorization code and client secret.
      throw new AppError(
        "Google sign-in could not be verified. Please try again.",
        401,
      );
    }
  }
}
