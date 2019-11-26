const config = require('config');

const i18n = {
  ru: {
    "required": "Обязательно",
    "shouldBeNumber": "Тип должен быть Number",
    "positive": "Должен быть больше 0",
    "tooLargeNumber": "Слишком большое число",
    "notFound": "Не найдено",
    "invalidValue": "Неправильное значение",
    "shouldBeHash": "Должен быть хэш",
    "shouldBeString": "Должно быть строкой",
    "greaterThanZero": "Должно быть больше 0",
    "stringLength42": "Количество символов в строке должно быть 42",
    "stringLength66": "Количество символов в строке должно быть 66"
  },
  en: {
    "required": "Required",
    "shouldBeNumber": "Should be Number",
    "positive": "Should be positive",
    "tooLargeNumber": "Too large number",
    "notFound": "Not found",
    "invalidValue": "Invalid value",
    "shouldBeHash": "Should be hash",
    "shouldBeString": "Should be String",
    "greaterThanZero": "Should be greater than zero",
    "stringLength42": "String length should be 42",
    "stringLength66": "String length should be 66"
  },
};

module.exports = (req, errorsMapped) => {
    let language;

    if (req.user && req.user.customer && req.user.customer.language) language = req.user.customer.language;
    else if (req.headers && req.headers.language && config.languages[req.headers.language]) language = req.headers.language;
    else language = config.defaultLanguage;

    if (!i18n[language]) language = config.defaultLanguage;

    for (const errorKey in errorsMapped) {
        let { msg } = errorsMapped[errorKey];

        if (typeof msg === 'string') {
        if (i18n[language][msg]) errorsMapped[errorKey].msg = i18n[language][msg];
        else if (i18n[config.defaultLanguage][msg]) errorsMapped[errorKey].msg = i18n[config.defaultLanguage][msg];
        } else if (Array.isArray(msg)) {
        errorsMapped[errorKey].msg.forEach(obj => {
            msg = obj.error;
            if (i18n[language][msg]) obj.error = i18n[language][msg];
            else if (i18n[config.defaultLanguage][msg]) obj.error = i18n[config.defaultLanguage][msg];
        });
        }
    }

    return errorsMapped;
};
