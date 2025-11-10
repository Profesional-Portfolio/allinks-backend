import { AuthRepository } from '../../repositories';
import { LoginUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';

interface LoginUserResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  tokens: TokenPair;
}

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider
  ) {}

  async execute(dto: LoginUserDto): Promise<LoginUserResponse> {
    const user = await this.authRepository.login(dto);

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
