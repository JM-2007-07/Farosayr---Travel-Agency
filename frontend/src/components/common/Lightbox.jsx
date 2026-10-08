import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import './Lightbox.css';

/**
 * Reusable photo lightbox on a native modal <dialog>: the browser moves
 * focus to the close button, keeps Tab inside, makes the page behind inert
 * and closes on Escape. Focus goes back to the photo that opened it.
 * Clicking the dark area around the photo closes it, as before. Body
 * scroll lock lives in useLightbox.
 */
export default function Lightbox({ item, onClose }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) {
      returnFocusRef.current = document.activeElement;
      dialog.showModal();
    }
    if (!item && dialog.open) dialog.close();
    if (!item && returnFocusRef.current) {
      returnFocusRef.current.focus?.();
      returnFocusRef.current = null;
    }
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={item?.alt}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label={t('common.close')}>
        <CloseIcon fontSize="small" />
      </button>
      {item && <img src={item.full} alt={item.alt} />}
    </dialog>
  );
}
