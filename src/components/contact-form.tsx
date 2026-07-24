"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { identity, web3formsKey } from "@/data/portfolio";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-fg placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35";

function Field({
  label,
  name,
  type = "text",
  textarea = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const id = `contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label}
      </label>
      {textarea ? (
        <textarea id={id} name={name} required rows={5} className={`${inputClass} resize-y`} />
      ) : (
        <input id={id} name={name} type={type} required autoComplete={autoComplete} className={inputClass} />
      )}
    </div>
  );
}

/**
 * Contact form. If a Web3Forms key is configured it submits async (no page
 * reload); otherwise it composes an email via mailto so it works with zero
 * setup. Accessible: real labels, a honeypot, aria-live status, focus rings.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bots fill hidden fields; humans never see it.
    if (data.get("company")) return;

    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    // No key configured → open the visitor's mail client (always works).
    if (!web3formsKey) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${identity.email}?subject=${subject}&body=${body}`;
      setStatus("success");
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
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setError(json.message || "Something went wrong. Please email me directly.");
      }
    } catch {
      setStatus("error");
      setError("Network error — please email me directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="glass flex flex-col items-center rounded-3xl p-8 text-center sm:p-10">
        <div className="relative z-[1] flex flex-col items-center">
          <CheckCircle2 className="h-10 w-10 text-accent-ink" />
          <h3 className="t-card-title mt-4 text-fg">Message on its way.</h3>
          <p className="t-small mt-2 max-w-sm text-muted">
            {web3formsKey
              ? "Thanks — I've got it and will reply soon."
              : "Your email client should have opened with the message ready to send."}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm font-semibold text-accent-ink hover:opacity-80"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={onSubmit} className="glass rounded-3xl p-6 sm:p-8" noValidate={false}>
      <div className="relative z-[1] flex flex-col gap-4">
        {/* Honeypot (visually hidden, off the a11y tree) */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <Field label="Name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Message" name="message" textarea />

        {status === "error" ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
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
