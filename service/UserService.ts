import {User, Confirmation} from '../models/models.js';
import ApiError from "../error/ApiError.js";
import TokenService from './TokenService.js';
import GreenSMS from "greensms";
import RegistrationDto from '../dto/RegistrationDto.js';

interface IPatchUserData {
    id: number,
    email: string,
    name: string,
    surname: string,
    dateOfBirth: Date,
    street: string,
    house: number,
    floor: number,
    entrance: number,
    room: number
}

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

    async auth(tel: string) {
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
            where: {tel}
        })

        if (!user) {
            user = await User.create({
                tel: tel
            });
        }

        // @ts-ignore
        const client = new GreenSMS({user: process.env.SMS_SERVICE_LOGIN, pass: process.env.SMS_SERVOCE_PASSWORD});

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
                userId: user.id || 0,
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

    async confirm(code: string, requestId: string) {
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

        if (foundConfirmation.used) {
            throw ApiError.badRequest('Данные более недействительны, попробуйте позднее', [
                {
                    name: 'confirm',
                    description: 'Ошибка подтверждения'
                }
            ])
        }

        foundConfirmation.used = true;
        foundConfirmation.save();

        if (Date.now() > foundConfirmation.expiresIn.getTime()) {
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

        if (foundUser && !foundUser.isActivated) {
            foundUser.isActivated = true;
            foundUser.save();
        }

        const registrationDto = new RegistrationDto(foundUser);

        const tokens = TokenService.generateTokens({...registrationDto});
        await TokenService.saveToken(registrationDto.id || 0, tokens.refreshToken);
        return {
            ...tokens,
            user: registrationDto
        }
    }

    // async activate(activationLink, next) {
    //   const user = await User.findOne({ where: { activationLink } });
    //   if (!user) {
    //     return next(ApiError.badRequest('Неккоректная ссылка активации.'));
    //   }
    //   await User.update({ isActivated: true, activationLink: null }, { where: { activationLink } });
    // }

    // async login({ email, password }, next) {
    //   const user = await User.findOne({where: {email}});
    //
    //   if (!user) {
    //     return next(ApiError.badRequest('Пользователь с таким email не найден.'))
    //   }
    //
    //   const comparePassword = bcrypt.compareSync(password, user.password);
    //
    //   if (!comparePassword) {
    //     return next(ApiError.badRequest('Указан неверный пароль.'))
    //   }
    //
    //   const checkActivated = user.isActivated;
    //
    //   if (!checkActivated) {
    //     return next(ApiError.badRequest('Аккаунт не активирован, проверьте почту.'))
    //   }
    //
    //   const userDto = new UserDto(user);
    //   const tokens = TokenService.generateTokens({...userDto});
    //
    //   await TokenService.saveToken(userDto.id, tokens.refreshToken);
    //   return {
    //     ...tokens,
    //     user: userDto
    //   }
    // }

    async logout(refreshToken: string) {
        return await TokenService.removeToken(refreshToken);
    }

    async refreshToken(refreshToken: string) {
        if (!refreshToken) {
            throw ApiError.unauthorized();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.unauthorized();
        }

        const user = await User.findOne({where: {id: userData.id}});
        const userDto = new RegistrationDto(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id || 0, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async getUserData(token: string) {
        const {userId} = await TokenService.findToken(token);
        const user = await User.findOne({where: {id: userId}});
        if (user) {
            user.dateOfBirth = !!user.dateOfBirth ? user.dateOfBirth : undefined;
            user.surname = !!user.surname ? user.surname : undefined;
            user.street = !!user.street ? user.street : undefined;
            user.house = !!user.house ? user.house : undefined;
            user.floor = !!user.floor ? user.floor : undefined;
            user.entrance = !!user.entrance ? user.entrance : undefined;
            user.room = !!user.room ? user.room : undefined;
        }
        return user;
    }

    async patchUserData({id, email, name, surname, dateOfBirth, street, house, floor, entrance, room}: IPatchUserData) {
        const user = await User.findOne({where: {id}});

        if (!user) {
            throw ApiError.badRequest('Пользователь не найден', [
                {
                    name: 'patchUserData',
                    description: 'Ошибка изменения данных'
                }
            ])
        }

        const userData = {
            id: user.id || 0,
            email: email || undefined,
            name: name || undefined,
            surname: surname || undefined,
            dateOfBirth: (!!dateOfBirth && new Date(dateOfBirth)) || undefined,
            street: street || undefined,
            house: house || undefined,
            floor: floor || undefined,
            entrance: entrance || undefined,
            room: room || undefined
        };

        await User.update(userData, {where: {id}})
        return userData;
    }

    // async changeUsersEmail( {email, id}, next ) {
    //   const candidateEmail = await User.findOne( { where: { email } } );
    //   const user = await User.findOne({ where: { id } })
    //
    //   if (candidateEmail) {
    //     return next(ApiError.badRequest('Пользователь с таким email уже существует.'))
    //   }
    //
    //   const activationLink = await uuid.v4();
    //
    //   const userData = {
    //     email,
    //     activationLink,
    //     isActivated: false
    //   }
    //
    //   await User.update(userData, { where: { id } });
    //
    //   await MailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);
    //
    // }
}

export default new UserService();