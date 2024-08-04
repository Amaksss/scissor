import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ _id: 'someId', email: 'test@example.com', password: 'hashedPassword' }),
    login: jest.fn().mockResolvedValue({ access_token: 'accessToken' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register and return the user', async () => {
      const result = await controller.register({ email: 'test@example.com', password: 'password' });
      expect(result).toEqual({ _id: 'someId', email: 'test@example.com', password: 'hashedPassword' });
      expect(service.register).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return an access token', async () => {
      const result = await controller.login({ email: 'test@example.com', password: 'password' });
      expect(result).toEqual({ accessToken: { access_token: 'accessToken' } });
      expect(service.login).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'login').mockRejectedValueOnce(new UnauthorizedException('Invalid credentials'));
      await expect(controller.login({ email: 'test@example.com', password: 'wrongPassword' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
