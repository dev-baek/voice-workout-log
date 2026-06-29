export class LoginError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly detail?: string,
  ) {
    super(message);
  }
}
