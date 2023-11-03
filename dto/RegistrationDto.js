export default class UserDto {
    id;
    role;
    tel;
    constructor(model) {
        this.id = model?.id;
        this.role = model?.role || 'USER';
        this.tel = model?.tel;
    }
}
//# sourceMappingURL=RegistrationDto.js.map