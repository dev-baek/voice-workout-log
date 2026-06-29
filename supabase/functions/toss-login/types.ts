export type TossLoginReferrer = 'DEFAULT' | 'SANDBOX';

export interface TossLoginRequest {
  authorizationCode: string;
  referrer: TossLoginReferrer;
}

export interface TossToken {
  accessToken: string;
  scope: string;
  expiresIn: number | null;
}

export interface TossLoginMe {
  userKey: number;
  scope: string;
  agreedTerms: string[];
}
