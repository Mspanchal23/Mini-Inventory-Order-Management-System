import { useCallback, useState } from 'react';

/**
 * Minimal form state helper: values, field errors and a change handler that clears
 * the error of the field being edited.
 */
export default function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const handleChange = useCallback(
    (event) => setField(event.target.name, event.target.value),
    [setField],
  );

  const reset = useCallback((nextValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  return { values, errors, setValues, setErrors, setField, handleChange, reset };
}
