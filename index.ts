import express, { Request } from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { connect } from 'mongoose'
import { RequestBodyLogin } from './types/Login/interfaces'
import { RequestBodyRegister } from './types/Register/interfaces'
import { validInputRegister } from './utils/validInputRegister'
import { getErrorMessage } from './utils/error'
import UserModel from './models/User'

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())

app.post(
	'/register',
	async (req: Request<{}, {}, RequestBodyRegister | undefined>, res) => {
		if (!validInputRegister(req.body))
			return res.status(400).json({ message: 'User details are not valid!' })

		const userDetails = {
			email: req.body!.email!.trim(),
			username: req.body!.username!.trim(),
			password: req.body!.password!.trim(),
		}

		try {
			const salt = await bcrypt.genSalt()
			const hashedPassword = await bcrypt.hash(userDetails.password, salt)

			userDetails.password = hashedPassword

			const userCreated = await UserModel.create({
				username: userDetails.username,
				email: userDetails.email,
				password: userDetails.password,
			})

			if (!userCreated) throw new Error('Failed to Create User.')

			return res.status(201).json({
				user: { email: userCreated.email, username: userCreated.username },
			})
		} catch (error) {
			return res.status(500).json({ message: getErrorMessage(error) })
		}
	}
)

app.post(
	'/login',
	(req: Request<{}, {}, RequestBodyLogin | undefined>, res) => {
		// TODO: validate inputs and provide accesstoken along with refreshtoken saved in db
	}
)

app.get('/', (_req, res) => {
	res.send('Welcome to Voy Media')
})

if (!process.env.DB_URL)
	throw new Error('No Database Connection String Found in .env!')

connect(process.env.DB_URL)
	.then(() => {
		app.listen(port, () => {
			console.log('⚡ Database Connected.')
			console.log(`📡 [server]: Server is running at https://localhost:${port}`)
		})
	})
	.catch((error) => console.log(getErrorMessage(error)))
