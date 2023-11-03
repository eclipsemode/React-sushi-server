import { check } from "express-validator";
const registrationSchema = [
    check('tel')
        .matches(/\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/)
        .withMessage('Неправильный номер телефона'),
];
export default registrationSchema;
//# sourceMappingURL=registration-schema.js.map