import { useTranslation } from 'react-i18next';
import { getStats } from '../../services/statsService';
import { useReveal } from '../../hooks/useReveal';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { useAsyncData } from '../../hooks/useAsyncData';
import AsyncState from '../common/AsyncState';
import './Statistics.css';

function StatItem({ stat, start }) {
  const { t } = useTranslation();
  // threshold 0.6 matches the original counterObserver's IntersectionObserver
  // options exactly (reveal's own default is 0.15, tuned for section entry).
  const [ref, isInView] = useReveal({ threshold: 0.6, rootMargin: '0px' });
  const value = useAnimatedCounter(stat.target, start && isInView);

  return (
    <div className={`stat-item reveal ${isInView ? 'in-view' : ''}`} ref={ref}>
      <span className="stat-number">
        {value}
        {stat.suffix}
      </span>
      {/* Stats are static config served by the backend with stable ids;
          labels are translated by id, falling back to the API value. */}
      <span className="stat-label">{t(`home.stats.${stat.id}`, { defaultValue: stat.label })}</span>
    </div>
  );
}

export default function Statistics() {
  const { status, data: stats, isLoading, isError } = useAsyncData(getStats, []);

  return (
    <section className="section stats">
      <div className="stats-route" aria-hidden="true" />
      <div className="container">
        <AsyncState
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && stats.length === 0}
        />
        {status === 'success' && stats.length > 0 && (
          <div className="stats-grid">
            {stats.map((stat) => (
              <StatItem key={stat.id} stat={stat} start />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
