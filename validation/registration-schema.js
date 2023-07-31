const { check } = require("express-validator");
const registrationSchema = [
    check('tel')
        .matches(/\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/)
        .withMessage('Неправильный номер телефона'),
]

module.exports = registrationSchema;