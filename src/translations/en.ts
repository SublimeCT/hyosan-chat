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
  copy: 'Copy',
  copySuccessfully: 'Copy successfully!',
  rename: 'Rename',
  edit: 'Edit',
  delete: 'Delete',
  stopOutput: 'Stop output',
  retry: 'Retry',
  enableSearch: 'Enable search',
}

registerTranslation(translation)

export default translation
