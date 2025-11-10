import { Request, Response } from 'express';
import { registerUserDto, AuthRepository } from '@/domain/index';
import { HttpStatus } from '@/infraestructure/http';
import { validate } from '../middlewares';

export class AuthController {
  constructor(private readonly authRepository: AuthRepository) {}

  registerUser = async (req: Request, res: Response) => {
    const data = validate(registerUserDto, req.body);

    const user = await this.authRepository.register(data);
    return res.status(HttpStatus.CREATED).json({ data: user });
  };

  loginUser = (req: Request, res: Response) => {
    res.json({ message: 'User logged in successfully' });
  };
}
