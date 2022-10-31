import { Schema, model } from 'mongoose'
import { IAuthTokenModel } from '../../types/models/AuthTokenModel/interfaces'

const authTokenSchema = new Schema<IAuthTokenModel>({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	refreshToken: {
		type: String,
		required: true,
		unique: true,
	},
	accessToken: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

export default model('AuthToken', authTokenSchema)
