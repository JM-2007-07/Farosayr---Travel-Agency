import { useTranslation } from 'react-i18next';

/**
 * Minimal placeholder for a routed page that exists in the target route
 * tree but has no real implementation yet. Mirrors SectionPending's visual
 * treatment (dashed box, muted uppercase label) so no new design language
 * is introduced. Replaced with a real page component when that page's
 * migration phase is implemented.
 */
export default function PagePending({ title }) {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ padding: '160px 0 80px' }}>
      <div
        style={{
          padding: '60px 28px',
          textAlign: 'center',
          color: 'var(--text-mid)',
          border: '1px dashed #E3E9F0',
        }}
      >
        <p style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {t('pagePending.message', { title })}
        </p>
      </div>
    </div>
  );
}
