"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const validInputRegister_1 = require("./utils/validInputRegister");
const error_1 = require("./utils/error");
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
let userDB = [];
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json());
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!(0, validInputRegister_1.validInputRegister)(req.body))
        return res.status(400).json({ message: 'User details are not valid!' });
    const userDetails = {
        email: (_a = req.body.email) === null || _a === void 0 ? void 0 : _a.trim(),
        username: (_b = req.body.username) === null || _b === void 0 ? void 0 : _b.trim(),
        password: (_c = req.body.password) === null || _c === void 0 ? void 0 : _c.trim(),
    };
    try {
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(userDetails.password, salt);
        userDetails.password = hashedPassword;
        const userCreated = yield User_1.default.create(userDetails);
        if (!userCreated)
            throw new Error('Failed to Create User.');
        return res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: (0, error_1.getErrorMessage)(error) });
    }
}));
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
    res.end();
});
app.get('/', (_req, res) => {
    res.send('Welcome to Voy Media');
});
if (!process.env.DB_URL)
    throw new Error('No Database Connection String Found in .env!');
(0, mongoose_1.connect)(process.env.DB_URL)
    .then(() => {
    app.listen(port, () => {
        console.log('⚡ Database Connected.');
        console.log(`📡 [server]: Server is running at https://localhost:${port}`);
    });
})
    .catch((error) => console.log((0, error_1.getErrorMessage)(error)));
