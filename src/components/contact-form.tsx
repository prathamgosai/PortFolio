"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Copy, Loader2, MailOpen, Send } from "lucide-react";
import { identity, web3formsKey } from "@/data/portfolio";

type Status = "idle" | "submitting" | "sent" | "composed" | "error";

/**
 * Field styling. The border and fill use the on-glass tokens rather than a
 * hardcoded `white/10` + `white/[0.04]` — at those values the inputs were
 * completely invisible on the light theme: three labels floating above nothing.
 */
const inputClass =
  "w-full rounded-2xl border border-hairline-strong bg-field px-4 py-3 text-fg " +
  "placeholder:text-muted/70 transition-colors " +
  "hover:border-accent/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35";

/**
 * Honeypot field name. Deliberately NOT something a password manager or browser
 * autofill recognises — a field called `company`, `organisation`, or `phone`
 * gets filled for real people constantly, and every one of those is a genuine
 * enquiry thrown away.
 */
const HONEYPOT = "hp_ref_code";

/** Anything submitted faster than this was not typed by a human. */
const MIN_FILL_MS = 2500;

function Field({
  label,
  name,
  type = "text",
  textarea = false,
  autoComplete,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
}) {
  const id = `contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          required
          rows={5}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

/** Shown on every terminal state, so there is always a way through. */
function DirectEmail() {
  const [copied, setCopied] = useState(false);
  if (!identity.email) return null;

  return (
    <p className="t-small mt-4 text-muted">
      Or reach me directly at{" "}
      <a href={`mailto:${identity.email}`} className="font-medium text-accent-ink hover:underline">
        {identity.email}
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(identity.email as string);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="ml-2 inline-flex items-center gap-1 align-middle text-xs text-muted hover:text-fg"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? "Copied" : "Copy"}
      </button>
    </p>
  );
}

/**
 * Contact form. If a Web3Forms key is configured it submits async (no page
 * reload); otherwise it composes an email via mailto so it works with zero
 * setup. Accessible: real labels, aria-live status, focus rings.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  /** When this form became interactive — used to reject instant bot submits.
   *  Stamped in an effect, not during render: `Date.now()` in a render body is
   *  impure and would differ between the server and client passes. */
  const readyAt = useRef(0);
  useEffect(() => {
    readyAt.current = Date.now();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Bot checks. Both resolve to the normal success screen rather than a silent
    // no-op: a bot gets no signal that it was caught, and a human who somehow
    // trips one still sees the direct email address on that screen instead of a
    // button that appears to do nothing.
    const trippedHoneypot = Boolean(data.get(HONEYPOT));
    const tooFast = readyAt.current > 0 && Date.now() - readyAt.current < MIN_FILL_MS;
    if (trippedHoneypot || tooFast) {
      setStatus("sent");
      return;
    }

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    // No key configured → hand off to the visitor's mail client. We cannot
    // detect whether that actually opened anything, so the copy must not claim
    // the message was sent.
    if (!web3formsKey) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${identity.email}?subject=${subject}&body=${body}`;
      setStatus("composed");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3formsKey,
          name,
          email,
          message,
          subject: `Portfolio enquiry from ${name}`,
          from_name: "prathamgosai.in",
        }),
      });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (json.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
        setError(json.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setError("Network error — the message didn't leave your browser.");
    }
  }

  function reset() {
    readyAt.current = Date.now();
    setStatus("idle");
    setError("");
  }

  if (status === "sent" || status === "composed") {
    const sent = status === "sent";
    return (
      <div className="glass flex flex-col items-center rounded-3xl p-8 text-center sm:p-10">
        <div className="relative z-[1] flex flex-col items-center">
          {sent ? (
            <CheckCircle2 className="h-10 w-10 text-accent-ink" />
          ) : (
            <MailOpen className="h-10 w-10 text-accent-ink" />
          )}
          <h3 className="t-card-title mt-4 text-fg">
            {sent ? "Message on its way." : "Check your email app."}
          </h3>
          <p className="t-small mt-2 max-w-sm text-muted">
            {sent
              ? "Thanks — I've got it and will reply soon."
              : "Your email client should have opened with the message ready to send. It still needs you to hit send."}
          </p>
          <DirectEmail />
          <button
            type="button"
            onClick={reset}
            className="mt-6 text-sm font-semibold text-accent-ink hover:opacity-80"
          >
            {sent ? "Send another" : "Back to the form"}
          </button>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    /**
     * `min-w-0` because this form is a grid item, and grid items default to
     * `min-width: auto` — they refuse to shrink below their content's
     * min-content width. The <textarea> inside contributes a cols-based
     * min-content of ~289px, so without this the single mobile grid track was
     * sized to 338px inside a 280px container and the whole page scrolled
     * sideways at 320px. Setting `min-width: 0` on the controls alone does not
     * fix it; the item that owns the track has to opt out too.
     */
    <form onSubmit={onSubmit} className="glass min-w-0 rounded-3xl p-6 sm:p-8">
      <div className="relative z-[1] flex flex-col gap-4">
        {/* Honeypot — visually hidden, off the a11y tree, and named so that no
            autofill heuristic will ever put a real value in it. */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={HONEYPOT}>Leave this field empty</label>
          <input id={HONEYPOT} type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
        </div>

        <Field label="Name" name="name" autoComplete="name" maxLength={120} placeholder="Your name" />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={200}
          placeholder="you@company.com"
        />
        <Field
          label="Message"
          name="message"
          textarea
          maxLength={5000}
          placeholder="What's the role or project?"
        />

        {/**
         * Themed danger tokens, not Tailwind's `red-300`/`red-400`.
         *
         * Those are dark-mode values: `red-300` on the light `--schematic`
         * canvas lands around 2:1, well under the 4.5:1 AA needs — and an error
         * message is the one string on the page a user cannot afford to miss.
         * `--danger-ink` is the AA-safe half of a themed pair, so the alert is
         * legible in both modes for the same reason every other colour here is.
         */}
        {status === "error" ? (
          <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-field px-4 py-3">
            <p className="text-sm font-medium text-danger-ink">{error}</p>
            <DirectEmail />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary magnetic inline-flex items-center justify-center gap-2 rounded-2xl bg-fg px-6 py-3.5 text-[1.0625rem] font-semibold text-bg transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              {web3formsKey ? "Send message" : "Compose email"}
              <Send className="h-4 w-4" />
            </>
          )}
        </button>

        <p aria-live="polite" className="sr-only">
          {submitting ? "Sending your message" : status === "error" ? error : ""}
        </p>
      </div>
    </form>
  );
}
