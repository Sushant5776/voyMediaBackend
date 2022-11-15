import { RequestBodyLogout } from '../../types/Logout/interfaces'

export function validInputLogout(userDetails: RequestBodyLogout | undefined) {
	if (!userDetails) return false
	if (!(userDetails.accessToken?.trim() && userDetails.email?.trim()))
		return false
	return true
}
