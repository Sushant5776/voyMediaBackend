import { RequestBodyLogin } from '../../types/Login/interfaces'

export function validInputLogin(user: RequestBodyLogin | undefined) {
	if (!user) return false

	if (!(user.email && user.password)) return false

	try {
		user.email = user.email.trim()
		user.password = user.password.trim()
	} catch (error) {
		return false
	}

	if (!(user.email.length > 5 && user.password.length > 7)) return false

	const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
	const passwordRegex =
		/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})/

	if (!(emailRegex.test(user.email) && passwordRegex.test(user.password)))
		return false

	return true
}
