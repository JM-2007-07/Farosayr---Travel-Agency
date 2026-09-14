import './Loading.css';

export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-label="Загрузка">
      <span className="route-loading-spinner" />
    </div>
  );
}
