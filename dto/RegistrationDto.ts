import {User} from "../models/models.js";

export default class UserDto {
    id;
    role;
    tel;

    constructor(model: User | null) {
        this.id = model?.id;
        this.role = model?.role || 'USER';
        this.tel = model?.tel;
    }
}