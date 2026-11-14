import { authRepository, authService } from "../auth.container.js";
import { GoogleOAuthService } from "./oauth.service.js";

export const googleOAuthService = new GoogleOAuthService(authRepository, authService);
