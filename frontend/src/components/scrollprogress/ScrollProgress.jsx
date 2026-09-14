import { useScrollState } from '../../hooks/useScrollState';
import './ScrollProgress.css';

export default function ScrollProgress() {
  const { progress } = useScrollState();
  return <div className="progress-bar" style={{ width: `${progress}%` }} />;
}
