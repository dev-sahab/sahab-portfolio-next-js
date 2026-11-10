'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { quoteForm } from '@/content/v8/contact'
import { sectionIds, site } from '@/content/v8/site'
import {
  buildQuoteMailto,
  FOCUS_QUOTE_EVENT,
  submitQuote,
  validateField,
  validateQuote,
  type QuoteErrors,
  type QuoteField,
  type QuoteRequest,
} from '@/lib/v8/quote'
import { cx } from '@/lib/v8/cx'
import { Button } from '../../ui/Button'

const initial: QuoteRequest = {
  name: '',
  email: '',
  projectType: quoteForm.projectTypes[0],
  budget: '',
  timeline: '',
  message: '',
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Quote request form (Figma Interaction 09): fields validate inline on
 * blur, submit shows a loading state, then a success panel. Posts to the
 * existing `/api/quote` endpoint.
 *
 * Any "Get a free quote" link (`href="#contact"`) or the ⌘K quote command
 * scrolls here and focuses the first field.
 */
export default function QuoteForm() {
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState<QuoteRequest>(initial)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [touched, setTouched] = useState<Partial<Record<QuoteField, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')

  // "Get a free quote" anywhere → focus the first field once scrolled.
  useEffect(() => {
    const focusSoon = () => window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 650)
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.(`a[href="#${sectionIds.contact}"]`)
      if (link) focusSoon()
    }
    document.addEventListener('click', onClick)
    window.addEventListener(FOCUS_QUOTE_EVENT, focusSoon)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener(FOCUS_QUOTE_EVENT, focusSoon)
    }
  }, [])

  const set = (field: QuoteField) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value }
    setValues(next)
    // Once a field has been blurred, re-validate it live so the error clears as soon as it's fixed.
    if (touched[field]) setErrors((err) => ({ ...err, [field]: validateField(field, next) }))
  }

  const blur = (field: QuoteField) => () => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((err) => ({ ...err, [field]: validateField(field, values) }))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validateQuote(values)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })
    const firstInvalid = (Object.keys(found) as QuoteField[])[0]
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus()
      return
    }

    setStatus('submitting')
    setServerError('')
    try {
      await submitQuote(values)
      setStatus('success')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(initial)
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className="v8-form v8-form--success" role="status" aria-live="polite">
        <CheckCircle2 className="v8-form__success-icon" aria-hidden="true" />
        <h3>Thanks, you’ll hear back within 24 hours.</h3>
        <p>
          Your request is in. I’ll reply to <strong>{values.email}</strong> with next steps and a fixed quote.
        </p>
        <Button variant="secondary" onClick={reset}>
          Send another request
        </Button>
      </div>
    )
  }

  const fieldId = (f: QuoteField) => `${id}-${f}`
  const errorId = (f: QuoteField) => `${id}-${f}-error`
  const a11y = (f: QuoteField) => ({
    'aria-invalid': !!errors[f],
    'aria-describedby': errors[f] ? errorId(f) : undefined,
  })
  const busy = status === 'submitting'

  return (
    <form className="v8-form" onSubmit={onSubmit} noValidate aria-busy={busy}>
      <div className="v8-form__row">
        <div className={cx('v8-field', errors.name && 'has-error')}>
          <label htmlFor={fieldId('name')}>Your name</label>
          <input
            ref={nameRef}
            id={fieldId('name')}
            name="name"
            autoComplete="name"
            placeholder={quoteForm.placeholders.name}
            value={values.name}
            onChange={set('name')}
            onBlur={blur('name')}
            required
            {...a11y('name')}
          />
          {errors.name && (
            <p id={errorId('name')} className="v8-field__error">
              {errors.name}
            </p>
          )}
        </div>
        <div className={cx('v8-field', errors.email && 'has-error')}>
          <label htmlFor={fieldId('email')}>Email</label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={quoteForm.placeholders.email}
            value={values.email}
            onChange={set('email')}
            onBlur={blur('email')}
            required
            {...a11y('email')}
          />
          {errors.email && (
            <p id={errorId('email')} className="v8-field__error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset className="v8-field v8-field--choices">
        <legend>What do you need?</legend>
        <div className="v8-choices">
          {quoteForm.projectTypes.map((type) => (
            <label key={type} className={cx('v8-choice', values.projectType === type && 'is-selected')}>
              <input
                type="radio"
                name="projectType"
                value={type}
                checked={values.projectType === type}
                onChange={set('projectType')}
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="v8-form__row">
        {(
          [
            ['budget', 'Budget (optional)', quoteForm.budgets, quoteForm.placeholders.budget],
            ['timeline', 'Timeline (optional)', quoteForm.timelines, quoteForm.placeholders.timeline],
          ] as const
        ).map(([field, label, options, placeholder]) => (
          <div key={field} className="v8-field">
            <label htmlFor={fieldId(field)}>{label}</label>
            <div className="v8-select">
              <select
                id={fieldId(field)}
                name={field}
                value={values[field]}
                onChange={set(field)}
                className={cx(!values[field] && 'is-placeholder')}
              >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className={cx('v8-field', errors.message && 'has-error')}>
        <label htmlFor={fieldId('message')}>About the project</label>
        <textarea
          id={fieldId('message')}
          name="message"
          rows={4}
          placeholder={quoteForm.placeholders.message}
          value={values.message}
          onChange={set('message')}
          onBlur={blur('message')}
          required
          {...a11y('message')}
        />
        {errors.message && (
          <p id={errorId('message')} className="v8-field__error">
            {errors.message}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="v8-form__server-error" role="alert">
          {serverError}{' '}
          <a href={buildQuoteMailto(values)}>Send it by email instead</a> or write to {site.email}.
        </p>
      )}

      <div className="v8-form__footer">
        <p>{quoteForm.note}</p>
        <Button type="submit" arrow={!busy} disabled={busy} className={cx(busy && 'is-loading')}>
          {busy ? (
            <>
              <Loader2 className="v8-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            quoteForm.submit
          )}
        </Button>
      </div>
    </form>
  )
}
