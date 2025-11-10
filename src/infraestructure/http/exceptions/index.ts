import { HttpStatus } from '../http-status/index';
import { Exception } from './exception';

export class BadRequestException extends Exception {
  constructor(message = 'Bad request', statusCode = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class UnauthorizedException extends Exception {
  constructor(message = 'Unauthorized', statusCode = HttpStatus.UNAUTHORIZED) {
    super(message, statusCode);
  }
}

export class ForbiddenException extends Exception {
  constructor(message = 'Forbidden', statusCode = HttpStatus.FORBIDDEN) {
    super(message, statusCode);
  }
}

export class ConflictException extends Exception {
  constructor(message = 'Conflict', statusCode = HttpStatus.CONFLICT) {
    super(message, statusCode);
  }
}

export class InternalServerErrorException extends Exception {
  constructor(
    message = 'Internal server error',
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

export class NotFoundException extends Exception {
  constructor(message = 'Not found', statusCode = HttpStatus.NOT_FOUND) {
    super(message, statusCode);
  }
}
