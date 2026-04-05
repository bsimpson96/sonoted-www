import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function InviteSection() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement).value;

    setFormState('submitting');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: honeypot }),
      });

      const data: unknown = await res.json();

      if (
        res.ok &&
        typeof data === 'object' &&
        data !== null &&
        'success' in data &&
        (data as { success: boolean }).success
      ) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  return (
    <div
      id="invite"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      className="mx-auto max-w-2xl rounded-2xl border px-8 py-16 text-center"
    >
      {formState === 'success' ? (
        <p
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          className="text-2xl font-bold"
        >
          You&apos;re on the list.
        </p>
      ) : (
        <>
          <h2
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            className="mb-3 text-4xl font-extrabold tracking-tight"
          >
            Get in early.
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-8 text-lg">
            We&apos;re onboarding early users in small batches. Drop your email and we&apos;ll reach out when your spot opens.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col items-center gap-3">
            {/* Honeypot field -- hidden from real users */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />

            <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-label="Email address"
                style={{
                  backgroundColor: 'var(--color-base)',
                  borderColor: emailError ? '#ef4444' : 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                className="flex-1 rounded-lg border px-4 py-3 text-sm transition-colors outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                disabled={formState === 'submitting'}
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
                className="rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {formState === 'submitting' ? 'Requesting...' : 'Request early access'}
              </button>
            </div>

            {emailError && (
              <p className="text-sm" style={{ color: '#ef4444' }}>
                {emailError}
              </p>
            )}

            {formState === 'error' && (
              <p className="text-sm" style={{ color: '#ef4444' }}>
                Something went wrong. Try again.
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
