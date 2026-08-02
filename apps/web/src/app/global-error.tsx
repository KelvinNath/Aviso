"use client";

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
          fontFamily: "system-ui, sans-serif",
          background: "#111111",
          color: "#fafafa",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, textTransform: "uppercase" }}>
            Total meltdown
          </h1>
          <p style={{ marginTop: "1rem", opacity: 0.8 }}>
            Even worse than NTA changing exam dates. Refresh and hope for the best.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              background: "#C7FF3D",
              color: "#111111",
              border: "2px solid #111111",
              borderRadius: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again →
          </button>
          {error.digest && (
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", opacity: 0.5 }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
