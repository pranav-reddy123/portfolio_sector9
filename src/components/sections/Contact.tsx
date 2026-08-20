import { useRef, useState, type FormEvent } from 'react'
import { Panel } from '../ui/Panel'
import { useStore } from '../../hooks/useStore'
import { CONTACT, CONTACT_ENDPOINT } from '../../data/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Errors = Partial<Record<'name' | 'email' | 'message', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = 'Add your name so I know who is transmitting.'
  if (!values.email.trim()) errors.email = 'Add an email address so I can reply.'
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'That address is missing an @ or a domain. Check it and try again.'
  if (values.message.trim().length < 12)
    errors.message = 'Tell me a little more — at least a sentence.'
  return errors
}

const LINKS = [
  { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: 'GitHub', value: CONTACT.githubHandle, href: CONTACT.github },
  { label: 'LinkedIn', value: CONTACT.linkedinHandle, href: CONTACT.linkedin },
]

export function Contact() {
  const active = useStore((s) => s.section) === 'contact'
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const values = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    }

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus('idle')
      const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }

    setStatus('sending')
    try {
      if (CONTACT_ENDPOINT) {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(values),
        })
        if (!response.ok) throw new Error(String(response.status))
      } else {
        // No backend by design: hand the message to the visitor's mail client with
        // everything already filled in.
        const subject = encodeURIComponent(`Transmission from ${values.name}`)
        const body = encodeURIComponent(`${values.message}\n\n— ${values.name}\n${values.email}`)
        window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`
      }
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const fieldClass = (invalid: boolean) =>
    [
      'w-full min-h-[44px] border bg-black/30 px-3 py-2 text-[13px] text-vapor',
      'placeholder:text-mute/60 transition-colors duration-200',
      'focus:border-ice focus:outline-none focus:ring-1 focus:ring-ice',
      invalid ? 'border-signal' : 'border-mute/30',
    ].join(' ')

  return (
    <Panel id="contact" code="Tower 04 · Relay" title="Let's build something" active={active} side="left">
      <dl className="mb-5 space-y-2">
        {LINKS.map((link) => (
          <div key={link.label} className="grid grid-cols-[5rem_1fr] items-baseline gap-3">
            <dt className="meta meta-sm">{link.label}</dt>
            <dd className="min-w-0">
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="inline-block truncate border-b border-transparent text-[13px] text-vapor transition-colors duration-200 hover:border-ice hover:text-ice"
              >
                {link.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <div className="rule mb-5" />

      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="meta meta-sm mb-1.5 block">
            Name <span className="text-signal">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={fieldClass(!!errors.name)}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-1.5 text-[12px] text-signal">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="meta meta-sm mb-1.5 block">
            Email <span className="text-signal">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={fieldClass(!!errors.email)}
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="mt-1.5 text-[12px] text-signal">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-message" className="meta meta-sm mb-1.5 block">
            Message <span className="text-signal">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'}
            className={fieldClass(!!errors.message)}
          />
          {errors.message ? (
            <p id="contact-message-error" role="alert" className="mt-1.5 text-[12px] text-signal">
              {errors.message}
            </p>
          ) : (
            <p id="contact-message-hint" className="meta meta-sm mt-1.5">
              Opens a draft in your mail app, already filled in.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-3 border border-ice/40 px-6 font-mono text-[11px] uppercase tracking-meta text-ice transition-all duration-300 hover:border-ice hover:bg-ice/10 disabled:cursor-wait disabled:border-mute/30 disabled:text-mute cursor-pointer"
        >
          {status === 'sending' ? 'Transmitting…' : 'Send transmission'}
        </button>

        <p aria-live="polite" className="min-h-[1.25rem] text-[12px]">
          {status === 'sent' && (
            <span className="text-ice">
              Draft ready in your mail app. Send it and it reaches me directly.
            </span>
          )}
          {status === 'error' && (
            <span className="text-signal">
              The uplink failed. Email {CONTACT.email} directly and it will get to me.
            </span>
          )}
        </p>
      </form>
    </Panel>
  )
}
