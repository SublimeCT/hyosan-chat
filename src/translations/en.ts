import { registerTranslation, type Translation } from '@/translations/translation';

const translation: Translation = {
  $code: 'en',
  $name: 'English',
  $dir: 'ltr',

  test: 'test',
};

registerTranslation(translation);

export default translation;