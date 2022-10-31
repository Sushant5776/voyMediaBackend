"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validInputRegister = void 0;
function validInputRegister(user) {
    if (!user)
        return false;
    if (!(user.email && user.username && user.password))
        return false;
    try {
        user.email = user.email.trim();
        user.username = user.username.trim();
        user.password = user.password.trim();
    }
    catch (error) {
        return false;
    }
    if (!(user.email.length > 5 &&
        user.username.length > 5 &&
        user.password.length > 7))
        return false;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!(emailRegex.test(user.email) && passwordRegex.test(user.password)))
        return false;
    return true;
}
exports.validInputRegister = validInputRegister;
