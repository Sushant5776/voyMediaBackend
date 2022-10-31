import { Schema, model } from 'mongoose'
import { IUser } from '../../types/models/UserModel/interfaces'

const userSchema = new Schema<IUser>({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

export default model<IUser>('User', userSchema)
