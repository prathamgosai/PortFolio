"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where the
 * navbar/footer and even globals.css may not have rendered. It therefore has to
 * ship its own <html>/<body> and cannot rely on any design token or Tailwind
 * class existing — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090f",
          color: "#f5f7fa",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#ffd37a",
            }}
          >
            Error
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "2rem", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            The site failed to load.
          </h1>
          <p style={{ margin: "1rem 0 0", color: "#9aa7b8", lineHeight: 1.7 }}>
            Something went wrong before the page could render. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              cursor: "pointer",
              border: 0,
              borderRadius: "1rem",
              background: "#f5f7fa",
              color: "#07090f",
              padding: "0.875rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Reload
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#9aa7b8" }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
