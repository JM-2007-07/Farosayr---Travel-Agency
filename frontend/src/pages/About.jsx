import { useTranslation } from 'react-i18next';
import PagePending from '../components/common/PagePending';

export default function About() {
  const { t } = useTranslation();

  return <PagePending title={t('navigation.about')} />;
}
