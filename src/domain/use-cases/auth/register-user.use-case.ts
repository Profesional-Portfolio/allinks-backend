import { AuthRepository } from '../../repositories';
import { RegisterUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';

interface RegisterUserResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  tokens: TokenPair;
}

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResponse> {
    const user = await this.authRepository.register(dto);

    const tokens = await this.tokenProvider.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    };
  }
}
