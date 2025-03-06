import {
	type Translation,
	registerTranslation,
} from '@/translations/translation'

const translation: Translation = {
	$code: 'en',
	$name: 'English',
	$dir: 'ltr',

	test: 'test',
	startANewChat: 'Start a new chat',
	sendTips: 'Press Enter to send, press Shift + Enter to wrap the line',
}

registerTranslation(translation)

export default translation
