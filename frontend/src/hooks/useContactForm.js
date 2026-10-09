import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CONTACT_ERROR_FIELDS,
  submitContactRequest,
  validateContactRequest,
} from '../services/contactService';
import { getPublicErrorMessage } from '../utils/getPublicErrorMessage';
import { useSubmitLock } from './useSubmitLock';

export const CONTACT_STATUS = { IDLE: 'idle', SUBMITTING: 'submitting', SUBMITTED: 'submitted' };

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' };

/**
 * State and behaviour shared by the two "request a call back" forms
 * (homepage ContactSection and the /contact page): field values,
 * client-side validation, one-at-a-time submit, translated errors.
 *
 * - `fieldIdPrefix`: prefix of the inputs' ids ('' → #name, 'contact-' →
 *   #contact-name), so a validation error can focus its field.
 * - `errorId`: id of the element showing the message; the invalid field is
 *   aria-invalid and described by it. The message is then read together
 *   with the focused field, so forms shouldn't also make it an alert
 *   (check `invalidField` for that).
 *
 * What happens after success (fade-out note, success card) stays in the
 * form component; `reset()` returns to the empty form.
 */
export function useContactForm({ fieldIdPrefix = '', errorId }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(CONTACT_STATUS.IDLE);
  const [error, setError] = useState('');
  const [invalidField, setInvalidField] = useState(null);
  const runOnce = useSubmitLock();
  const reset = useCallback(() => setStatus(CONTACT_STATUS.IDLE), []);

  const fieldA11y = (field) =>
    invalidField === field ? { 'aria-invalid': true, 'aria-describedby': errorId } : {};

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === invalidField) {
      setInvalidField(null);
      setError('');
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const problem = validateContactRequest(form);
    if (problem) {
      const field = CONTACT_ERROR_FIELDS[problem];
      setInvalidField(field);
      setError(t(problem));
      document.getElementById(`${fieldIdPrefix}${field}`)?.focus();
      return;
    }

    await runOnce(async () => {
      setStatus(CONTACT_STATUS.SUBMITTING);
      setError('');
      setInvalidField(null);

      try {
        await submitContactRequest(form);
        setStatus(CONTACT_STATUS.SUBMITTED);
        setForm(EMPTY_FORM);
      } catch (err) {
        setStatus(CONTACT_STATUS.IDLE);
        setError(getPublicErrorMessage(err, t, 'contact.submitError'));
      }
    });
  }

  return {
    form,
    status,
    error,
    invalidField,
    fieldA11y,
    handleChange,
    handleSubmit,
    reset,
  };
}
