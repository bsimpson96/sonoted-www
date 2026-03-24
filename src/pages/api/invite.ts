export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';

const InviteRequestSchema = z.object({
  email: z.string().email(),
  website: z.string().max(0), // honeypot
});

type InviteResponse = { success: true } | { success: false; error: string };

class InviteError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'InviteError';
  }
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SoNoted <hello@sonoted.ai>',
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new InviteError('RESEND_ERROR', `Resend responded with status ${res.status}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const json: unknown = await request.json().catch(() => null);

  // Honeypot check before schema parse
  if (
    typeof json === 'object' &&
    json !== null &&
    'website' in json &&
    typeof (json as Record<string, unknown>).website === 'string' &&
    (json as Record<string, unknown>).website !== ''
  ) {
    const body: InviteResponse = { success: true };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = InviteRequestSchema.safeParse(json);

  if (!parsed.success) {
    const body: InviteResponse = { success: false, error: 'Invalid email' };
    return new Response(JSON.stringify(body), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email } = parsed.data;

  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  const notifyEmail = import.meta.env.INVITE_NOTIFY_EMAIL as string | undefined;

  if (!apiKey) {
    console.error('[invite] RESEND_API_KEY is not configured');
    const body: InviteResponse = { success: false, error: 'Service unavailable' };
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Confirmation to submitter
    await sendEmail(
      apiKey,
      email,
      "You're on the SoNoted early access list.",
      `<p>Thanks for your interest in SoNoted.</p>
       <p>You're on the early access list. We'll reach out when it's your turn.</p>
       <p>— The SoNoted team</p>`,
    );

    // Notification to ops -- no PII in logs, only in email body
    if (notifyEmail) {
      await sendEmail(
        apiKey,
        notifyEmail,
        'New SoNoted invite signup',
        `<p>New invite signup received.</p><p>Email: ${email}</p>`,
      );
    }
  } catch (err) {
    if (err instanceof InviteError) {
      console.error(`[invite] email send failed: ${err.code}`);
    } else {
      console.error('[invite] unexpected error during email send');
    }
    const body: InviteResponse = { success: false, error: 'Service unavailable' };
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body: InviteResponse = { success: true };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
