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
}

registerTranslation(translation)

export default translation
