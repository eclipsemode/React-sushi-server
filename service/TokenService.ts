import jwt from 'jsonwebtoken';
import { Token } from '../models/models.js';
import RegistrationDto from '../dto/RegistrationDto.js'

class TokenService {
    generateTokens(payload: RegistrationDto) {
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY_ACCESS || '', { expiresIn: '30m' });
      const refreshToken = jwt.sign(payload, process.env.SECRET_KEY_REFFRESH || '', { expiresIn: '30d' });
      return {
        accessToken,
        refreshToken
      }
    }

    validateAccessToken(token: string) {
      try {
        const userData = jwt.verify(token, process.env.SECRET_KEY_ACCESS || '');
        return userData as any;
      } catch (e) {
        return null;
      }
    }

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, process.env.SECRET_KEY_REFFRESH || '');
      return userData as RegistrationDto;
    } catch (e) {
      return null;
    }
  }

    async saveToken(userId: number, refreshToken: string) {
      const tokenData = await Token.findOne({ where: {userId} });

      if (tokenData) {
        return await Token.update({ refreshToken }, { where: { userId } })
      }
      return await Token.create({ userId, refreshToken });
    }

    async removeToken(refreshToken: string) {
      return await Token.destroy({
        where: { refreshToken }
      });
    }

    async findToken(refreshToken: string) {
      const tokenData = await Token.findOne({ where: { refreshToken } });
      return tokenData as Token;
    }
}

export default new TokenService();