export class Exception extends Error {
  statusCode = 500;
  constructor(message = 'Internal server error', statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
