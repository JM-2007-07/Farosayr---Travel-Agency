import CloseIcon from '@mui/icons-material/Close';
import './Lightbox.css';

/**
 * Reusable lightbox — ports the original single #lightbox div/close-button/
 * click-outside-to-close/Escape behavior (Escape + body-scroll-lock live in
 * useLightbox, since those are non-visual side effects, not markup).
 */
export default function Lightbox({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      className="lightbox open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Закрыть">
        <CloseIcon fontSize="small" />
      </button>
      <img src={item.full} alt={item.alt} />
    </div>
  );
}
