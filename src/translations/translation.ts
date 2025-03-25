import type { Translation as DefaultTranslation } from '@shoelace-style/localize'

// Export functions from the localize lib so we have one central place to import them from
export { registerTranslation } from '@shoelace-style/localize'

export interface Translation extends DefaultTranslation {
  $code: string // e.g. en, en-GB
  $name: string // e.g. English, Español
  $dir: 'ltr' | 'rtl'

  test: string
  startANewChat: string
  sendTips: string
  copy: string
  copySuccessfully: string
  rename: string
  edit: string
  delete: string
  stopOutput: string
  retry: string
  enableSearch: string
  ariaSendInput: string
  ariaConversationsList: string
  settings: string
  baseUrl: string
  modelName: string
  apiKey: string
  systemPrompts: string
  save: string
  reset: string
  close: string
  theme: string
  lightTheme: string
  darkTheme: string
  followSystemTheme: string
  language: string
  en: string
  zhCn: string
  readAloud: string
}
