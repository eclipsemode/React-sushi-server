import { User, Confirmation } from '../models/models.js';
import ApiError from "../error/ApiError.js";
import TokenService from './TokenService.js';
import GreenSMS from "greensms";
import RegistrationDto from '../dto/RegistrationDto.js';
class UserService {
    async auth(tel) {
        if (!tel) {
            throw ApiError.badRequest('Введите номер телефона', [
                {
                    name: 'registration',
                    description: 'Ошибка авторизации'
                }
            ]);
        }
        const parsedTel = tel.replace(/\D/g, '');
        if (parsedTel.length !== 11) {
            throw ApiError.badRequest('Ошибка в номере телефона', [
                {
                    name: 'registration',
                    description: 'Ошибка авторизации'
                }
            ]);
        }
        let user;
        user = await User.findOne({
            where: { tel }
        });
        if (!user) {
            user = await User.create({
                tel: tel
            });
        }
        // @ts-ignore
        const client = new GreenSMS({ user: process.env.SMS_SERVICE_LOGIN, pass: process.env.SMS_SERVICE_PASSWORD });
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
        });
        if (!confirmation) {
            confirmation = await Confirmation.create({
                requestId: response.request_id,
                code: response.code,
                expiresIn: new Date(Date.now() + 60000),
                userId: user.id || 0,
            });
        }
        else {
            confirmation = await Confirmation.update({
                requestId: response.request_id,
                code: response.code,
                expiresIn: new Date(Date.now() + 60000),
                used: false
            }, {
                where: {
                    userId: user.id
                }
            });
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
            ]);
        }
        if (!requestId) {
            throw ApiError.badRequest('Ошибка "id" запроса', [
                {
                    name: 'confirm',
                    description: 'Ошибка подтверждения'
                }
            ]);
        }
        const foundConfirmation = await Confirmation.findOne({
            where: {
                code,
                requestId
            }
        });
        if (!foundConfirmation) {
            throw ApiError.badRequest('Код не найден', [
                {
                    name: 'confirm',
                    description: 'Ошибка подтверждения'
                }
            ]);
        }
        if (foundConfirmation.used) {
            throw ApiError.badRequest('Данные более недействительны, попробуйте позднее', [
                {
                    name: 'confirm',
                    description: 'Ошибка подтверждения'
                }
            ]);
        }
        foundConfirmation.used = true;
        foundConfirmation.save();
        if (Date.now() > foundConfirmation.expiresIn.getTime()) {
            throw ApiError.badRequest('Время ввода кода истекло', [
                {
                    name: 'confirm',
                    description: 'Ошибка подтверждения'
                }
            ]);
        }
        const foundUser = await User.findOne({
            where: {
                id: foundConfirmation.userId || 0
            }
        });
        if (foundUser && !foundUser.isActivated) {
            foundUser.isActivated = true;
            foundUser.save();
        }
        const registrationDto = new RegistrationDto(foundUser);
        const tokens = TokenService.generateTokens({ ...registrationDto });
        await TokenService.saveToken(registrationDto.id || 0, tokens.refreshToken);
        return {
            ...tokens,
            user: registrationDto
        };
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
        const userDto = new RegistrationDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });
        await TokenService.saveToken(userDto.id || 0, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        };
    }
    async getUserData(token) {
        const { userId } = await TokenService.findToken(token);
        const user = await User.findOne({ where: { id: userId } });
        if (user) {
            user.dateOfBirth = !!user.dateOfBirth ? user.dateOfBirth : null;
            user.surname = !!user.surname ? user.surname : null;
            user.street = !!user.street ? user.street : null;
            user.house = !!user.house ? user.house : null;
            user.floor = !!user.floor ? user.floor : null;
            user.entrance = !!user.entrance ? user.entrance : null;
            user.room = !!user.room ? user.room : null;
        }
        return user;
    }
    async patchUserData({ id, email, name, surname, dateOfBirth, street, house, floor, entrance, room }) {
        const user = await User.findOne({ where: { id } });
        if (!user) {
            throw ApiError.badRequest('Пользователь не найден', [
                {
                    name: 'patchUserData',
                    description: 'Ошибка изменения данных'
                }
            ]);
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
        await User.update(userData, { where: { id } });
        return userData;
    }
}
export default new UserService();
//# sourceMappingURL=UserService.js.map