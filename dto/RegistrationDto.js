module.exports = class UserDto {
    id;
    role;
    tel;

    constructor(model) {
        this.id = model.id;
        this.role = model.role;
        this.tel = model.tel;
    }
}