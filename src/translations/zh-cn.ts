import { registerTranslation, type Translation } from '@/translations/translation';

const translation: Translation = {
  $code: 'zh-cn',
  $name: '简体中文',
  $dir: 'ltr',

  test: '测试',
};

registerTranslation(translation);

export default translation;