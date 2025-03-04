import {
	type Translation,
	registerTranslation,
} from '@/translations/translation'

const translation: Translation = {
	$code: 'zh-cn',
	$name: '简体中文',
	$dir: 'ltr',

	test: '测试',
	startANewChat: '开始新聊天',
}

registerTranslation(translation)

export default translation
