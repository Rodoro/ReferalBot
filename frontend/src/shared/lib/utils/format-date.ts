export function formatDate(
	dateString: string | Date,
	includeTime: boolean = false
) {

	const date = new Date(dateString)

	const day = date.getDate()
	const monthIndex = date.getMonth()
	const year = date.getFullYear()

	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')

	const months = [
		"января",
		"февраля",
		"марта",
		"апреля",
		"мая",
		"июня",
		"июля",
		"августа",
		"сентября",
		"октября",
		"ноября",
		"декабря"
	]

	let formattedDate = `${day} ${months[monthIndex]} ${year}`

	if (includeTime) {
		formattedDate += `, ${hours}:${minutes}`
	}

	return formattedDate
}
