import jwt from 'jsonwebtoken'
import {
	IUserTokenDetails,
	TokenType,
} from '../../types/utils/token/interfaces'

export function createToken(
	userTokenDetails: IUserTokenDetails,
	tokenType: TokenType
) {
	if (tokenType === 'refresh' && process.env.REFRESH_TOKEN_SECRET) {
		return jwt.sign(userTokenDetails, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: '15552000s',
		})
	} else if (tokenType === 'access' && process.env.ACCESS_TOKEN_SECRET) {
		return jwt.sign(userTokenDetails, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '86400s',
		})
	} else return ''
}

export function verifyToken(token: string, tokenType: TokenType) {
	if (tokenType === 'refresh' && process.env.REFRESH_TOKEN_SECRET) {
		return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
	} else if (tokenType === 'access' && process.env.ACCESS_TOKEN_SECRET) {
		return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
	} else return false
}
