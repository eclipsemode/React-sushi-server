const { User, Token, Confirmation} = require('../models/models');
const MailService = require('./MailService');
const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const TokenService = require('./TokenService');
const UserDto = require('../dto/UserDto');
const uuid = require('uuid');
const GreenSMS = require("greensms");
const jwt = require("jsonwebtoken");
const RegistrationDto = require('../dto/RegistrationDto');

class UserService {
  // async registration({ email, password, role, name, surname, dateOfBirth, tel, street, house, floor, entrance, room }, next) {
  //
  //   if (!email || !password) {
  //     return next(ApiError.badRequest('Некорректный email или пароль.'))
  //   }
  //
  //   if (!name) {
  //     return next(ApiError.badRequest('Введите имя.'))
  //   }
  //
  //   if (!tel) {
  //     return next(ApiError.badRequest('Введите телефон.'))
  //   }
  //
  //   const candidateEmail = await User.findOne( { where: { email } } );
  //   const candidateTel = await User.findOne({ where: { tel } });
  //
  //   if (candidateEmail) {
  //     return next(ApiError.badRequest('Пользователь с таким email уже существует.'))
  //   }
  //
  //   if (candidateTel) {
  //     return next(ApiError.badRequest('Пользователь с таким номером телефона уже существует.'))
  //   }
  //
  //   const hashPassword = await bcrypt.hash(password, 5);
  //   const activationLink = await uuid.v4();
  //   const user = await User.create({email, password: hashPassword, role, name, surname, dateOfBirth, tel, street, house, floor, entrance, room, activationLink});
  //   await MailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);
  //   const userDto = new UserDto(user);
  //   const tokens = TokenService.generateTokens({ ...userDto });
  //   await TokenService.saveToken(userDto.id, tokens.refreshToken);
  //   return {
  //     ...tokens,
  //     user: userDto
  //   }
  // }

  async auth(tel) {
    if (!tel) {
      throw ApiError.badRequest('Введите номер телефона', [
        {
          name: 'registration',
          description: 'Ошибка авторизации'
        }
      ])
    }

    const parsedTel = tel.replace(/\D/g, '');

    if (parsedTel.length !== 11) {
      throw ApiError.badRequest('Ошибка в номере телефона', [
        {
          name: 'registration',
          description: 'Ошибка авторизации'
        }
      ])
    }

    let user;
    user = await User.findOne({
      where: { tel }
    })

    if (!user) {
      user = await User.create({
        tel: tel
      });
    }

    const client = new GreenSMS({ user: process.env.SMS_SERVICE_LOGIN, pass: process.env.SMS_SERVOCE_PASSWORD });

    const callVerificationParams = {
      to: parsedTel,
      language: 'ru',
      tag: 'aaeb96d6-cb0e-46f2-8d09-2cd5c9ea421c',
    };

    const response = await client.call.send(callVerificationParams);

    let confirmation;
    confirmation = await Confirmation.findOne({
      where: {
        userId: user.id
      }
    })
    if (!confirmation) {
      confirmation = await Confirmation.create({
        requestId: response.request_id,
        code: response.code,
        expiresIn: new Date(Date.now() + 60000),
        userId: user.id,
      })
    } else {
      confirmation = await Confirmation.update({
        requestId: response.request_id,
        code: response.code,
        expiresIn: new Date(Date.now() + 60000),
        used: false
      }, {
        where: {
          userId: user.id
        }
      })
    }

    return response.request_id;
  }

  async confirm(code, requestId) {
    if (!code) {
      throw ApiError.badRequest('Отсутствует код', [
        {
          name: 'confirm',
          description: 'Ошибка подтверждения'
        }
      ])
    }
    if (!requestId) {
      throw ApiError.badRequest('Ошибка "id" запроса', [
        {
          name: 'confirm',
          description: 'Ошибка подтверждения'
        }
      ])
    }

    const foundConfirmation = await Confirmation.findOne({
      where: {
        code,
        requestId
      }
    })

    if (!foundConfirmation) {
      throw ApiError.badRequest('Код не найден', [
        {
          name: 'confirm',
          description: 'Ошибка подтверждения'
        }
      ])
    }

    foundConfirmation.used = true;
    foundConfirmation.save();

    if (Date.now() - foundConfirmation.expiresIn.getTime() > 60000) {
      throw ApiError.badRequest('Время ввода кода истекло', [
        {
          name: 'confirm',
          description: 'Ошибка подтверждения'
        }
      ])
    }

    const foundUser = await User.findOne({
      where: {
        id: foundConfirmation.userId
      }
    })

    if (!foundUser.isActivated) {
      foundUser.isActivated = true;
      foundUser.save();
    }

    const registrationDto = new RegistrationDto(foundUser);

    const tokens = TokenService.generateTokens({ ...registrationDto });
    await TokenService.saveToken(registrationDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: registrationDto
    }
  }

  async activate(activationLink, next) {
    const user = await User.findOne({ where: { activationLink } });
    if (!user) {
      return next(ApiError.badRequest('Неккоректная ссылка активации.'));
    }
    await User.update({ isActivated: true, activationLink: null }, { where: { activationLink } });
  }

  async login({ email, password }, next) {
    const user = await User.findOne({where: {email}});

    if (!user) {
      return next(ApiError.badRequest('Пользователь с таким email не найден.'))
    }

    const comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
      return next(ApiError.badRequest('Указан неверный пароль.'))
    }

    const checkActivated = user.isActivated;

    if (!checkActivated) {
      return next(ApiError.badRequest('Аккаунт не активирован, проверьте почту.'))
    }

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({...userDto});

    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto
    }
  }

  async logout(refreshToken) {
    return await TokenService.removeToken(refreshToken);
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await TokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.unauthorized();
    }

    const user = await User.findOne({ where: { id: userData.id } });
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({...userDto});

    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto
    }
  }

  async getUserData(token) {
    const { userId } = await TokenService.findToken(token);
    const user = await User.findOne({ where: { id: userId } });
    user.dateOfBirth = !!user.dateOfBirth ? user.dateOfBirth : null;
    user.surname = !!user.surname ? user.surname : null;
    user.street = !!user.street ? user.street : null;
    user.house = !!user.house ? user.house : null;
    user.floor = !!user.floor ? user.floor : null;
    user.entrance = !!user.entrance ? user.entrance : null;
    user.room = !!user.room ? user.room : null;
    return user;
  }

  async patchUserData({ id, email, name, surname, dateOfBirth, tel, street, house, floor, entrance, room }, next) {
      const user = await User.findOne({ where: { id } });

      const userData = {
        id: user.id,
        password: user.password,
        email: email,
        name: name,
        surname: surname,
        dateOfBirth: dateOfBirth,
        tel: tel,
        street: street,
        house: house,
        floor: floor,
        entrance: entrance,
        room: room
      };

      await User.update(userData, { where: { id } })

      return userData;
  }

  async changeUsersEmail( {email, id}, next ) {
    const candidateEmail = await User.findOne( { where: { email } } );
    const user = await User.findOne({ where: { id } })

    if (candidateEmail) {
      return next(ApiError.badRequest('Пользователь с таким email уже существует.'))
    }

    const activationLink = await uuid.v4();

    const userData = {
      email,
      activationLink,
      isActivated: false
    }

    await User.update(userData, { where: { id } });

    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);

  }
}

module.exports = new UserService();