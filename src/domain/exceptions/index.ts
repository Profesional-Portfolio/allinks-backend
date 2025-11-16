import { StatusCode } from '../enums';

export class Exception extends Error {
  statusCode = 500;
  constructor(message = 'Internal server error', statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BadRequestException extends Exception {
  constructor(message = 'Bad request', statusCode = StatusCode.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class UnauthorizedException extends Exception {
  constructor(message = 'Unauthorized', statusCode = StatusCode.UNAUTHORIZED) {
    super(message, statusCode);
  }
}

export class ForbiddenException extends Exception {
  constructor(message = 'Forbidden', statusCode = StatusCode.FORBIDDEN) {
    super(message, statusCode);
  }
}

export class ConflictException extends Exception {
  constructor(message = 'Conflict', statusCode = StatusCode.CONFLICT) {
    super(message, statusCode);
  }
}

export class InternalServerErrorException extends Exception {
  constructor(
    message = 'Internal server error',
    statusCode = StatusCode.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

export class NotFoundException extends Exception {
  constructor(message = 'Not found', statusCode = StatusCode.NOT_FOUND) {
    super(message, statusCode);
  }
}
