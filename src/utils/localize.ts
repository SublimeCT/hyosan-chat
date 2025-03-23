import en from '@/translations/en' // Register English as the default/fallback language
import type { Translation } from '@/translations/translation'
import zhCn from '@/translations/zh-cn' // Register English as the default/fallback language
import {
	LocalizeController as DefaultLocalizationController,
	registerTranslation,
} from '@shoelace-style/localize'

export enum HyosanChatLanguage {
	en = 'en',
	zhCn = 'zhCn',
}

export interface HyosanChatLanguageItem {
	i18nKey: keyof Translation
	translation: Translation
}

export const HyosanChatLanguages: Record<HyosanChatLanguage, HyosanChatLanguageItem> = {
	[HyosanChatLanguage.en]: { i18nKey: HyosanChatLanguage.en, translation: en },
	[HyosanChatLanguage.zhCn]: { i18nKey: HyosanChatLanguage.zhCn, translation: zhCn },
}

/**
 * Extend the controller and apply our own translation interface for better typings
 * @see https://github.com/shoelace-style/shoelace/blob/next/src/utilities/localize.ts
 */
export class LocalizeController extends DefaultLocalizationController<Translation> {
	// Technicallly '../translations/en.js' is supposed to work via side-effects. However, by some mystery sometimes the
	// translations don't get bundled as expected resulting in `no translation found` errors.
	// This is basically some extra assurance that our translations get registered prior to our localizer connecting in a component
	// and we don't rely on implicit import ordering.
	static {
		Object.values(HyosanChatLanguages).forEach(lang => registerTranslation(lang.translation))
	}
}
