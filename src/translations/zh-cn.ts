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
	sendTips: '按 Enter 键发送, 按 Shift + Enter 键换行',
	copy: '复制',
	copySuccessfully: '复制成功!',
}

registerTranslation(translation)

export default translation
