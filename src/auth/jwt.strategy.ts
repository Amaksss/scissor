import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Hardcoded JWT secret
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '345TRFGY777888865R', // Hardcoded JWT secret
    });
  }

  async validate(payload: any) {
    // Extract userId and email from the JWT payload
    return { userId: payload.sub, email: payload.email };
  }
}