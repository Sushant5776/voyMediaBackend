import express, { Request } from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { connect } from 'mongoose'
import { RequestBodyLogin } from './types/Login/interfaces'
import { RequestBodyRegister } from './types/Register/interfaces'
import { validInputRegister } from './utils/validInputRegister'
import { getErrorMessage } from './utils/error'
import UserModel from './models/User'
import { validInputLogin } from './utils/validInputLogin'
import AuthTokenModel from './models/AuthToken'
import { IUserTokenDetails } from './types/utils/token/interfaces'
import { createToken, verifyToken } from './utils/token'
import { RequestBodyLogout } from './types/Logout/interfaces'
import { validInputLogout } from './utils/validInputLogout'

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
			const userPreExists = await UserModel.findOne({
				email: userDetails.email,
			})

			if (userPreExists)
				return res.status(400).json({ message: 'User already exists!' })

			const salt = await bcrypt.genSalt()
			const hashedPassword = await bcrypt.hash(userDetails.password, salt)
			userDetails.password = hashedPassword

			const userCreated = await UserModel.create({
				username: userDetails.username,
				email: userDetails.email,
				password: userDetails.password,
			})

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
	async (req: Request<{}, {}, RequestBodyLogin | undefined>, res) => {
		if (!validInputLogin(req.body))
			return res.status(400).json({ message: 'User details are not valid!' })

		try {
			const { email, password } = req.body!
			const userInDB = await UserModel.findOne({ email: email })
			const tokenInDB = await AuthTokenModel.findOne({ email: email })

			if (!userInDB)
				return res.status(400).json({ message: 'Wrong credentials provided!' })

			const userTokenDetails: IUserTokenDetails = {
				email: userInDB.email,
				username: userInDB.username,
			}

			const passwordMatch = await bcrypt.compare(
				password!.trim(),
				userInDB.password
			)

			if (!passwordMatch)
				return res.status(400).json({ message: 'Wrong credentials provided!' })

			if (tokenInDB) {
				const refreshTokenValid = verifyToken(tokenInDB.refreshToken, 'refresh')
				const accessTokenValid = verifyToken(tokenInDB.accessToken, 'access')

				if (!refreshTokenValid) {
					const newRefreshToken = createToken(userTokenDetails, 'refresh')
					const newAccessToken = createToken(userTokenDetails, 'access')

					if (!newRefreshToken || !newAccessToken)
						return res.status(500).json({ message: 'Failed to log you in!' })

					await tokenInDB.updateOne(
						{ accessToken: newAccessToken, refreshToken: newRefreshToken },
						{ new: true }
					)

					return res.status(200).json({
						user: userTokenDetails,
						tokens: { accessToken: newAccessToken },
					})
				} else if (!accessTokenValid) {
					const newAccessToken = createToken(userTokenDetails, 'access')

					await tokenInDB.updateOne(
						{ accessToken: newAccessToken },
						{ new: true }
					)

					return res.status(200).json({
						user: userTokenDetails,
						tokens: { accessToken: newAccessToken },
					})
				} else
					return res.status(200).json({
						user: { email: userInDB.email, username: userInDB.username },
						tokens: { accessToken: tokenInDB.accessToken },
					})
			} else {
				if (
					!(process.env.REFRESH_TOKEN_SECRET && process.env.ACCESS_TOKEN_SECRET)
				)
					return res.status(500).json({ message: 'Failed to log you in.' })

				const refreshToken = createToken(userTokenDetails, 'refresh') // valid for 6 months
				const accessToken = createToken(userTokenDetails, 'access') // valid for a day

				await AuthTokenModel.create({
					email: userTokenDetails.email,
					refreshToken,
					accessToken,
				})

				return res.status(200).json({
					user: userTokenDetails,
					tokens: {
						accessToken,
					},
				})
			}
		} catch (error) {
			return res.status(500).json({ message: getErrorMessage(error) })
		}
	}
)

app.post(
	'/logout',
	async (req: Request<{}, {}, RequestBodyLogout | undefined>, res) => {
		try {
			if (!validInputLogout(req.body))
				return res.status(400).json({ message: 'Invalid details!' })
			const tokenFromDB = await AuthTokenModel.findOne({
				email: req.body!.email as string,
			})

			if (!tokenFromDB)
				return res.status(400).json({ message: 'You are already logged out!' })

			const logoutRes = await tokenFromDB.delete()

			if (!logoutRes)
				return res.status(500).json({ message: 'Failed to log you out!' })
			return res.status(200).redirect('/')
		} catch (error) {
			return res.status(500).json({ message: getErrorMessage(error) })
		}
	}
)

app.get('/', (_req, res) => {
	res.status(200).json({ message: 'Welcome to Voy Media' })
})

if (!process.env.DB_URL)
	throw new Error('No Database Connection String (DB_URL) Found in .env!')

connect(process.env.DB_URL)
	.then(() => {
		app.listen(port, () => {
			console.log('⚡ Database Connected.')
			console.log(`📡 [server]: Server is running at https://localhost:${port}`)
		})
	})
	.catch((error) => console.log(getErrorMessage(error)))
