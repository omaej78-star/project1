<<<<<<< HEAD
# Project1
first project on git hub
=======
# John Omae portfolio

A responsive, local-first single-page portfolio. Open `index.html` through a static web server (rather than double-clicking it) so browser security features and module imports behave consistently.

## Security implementation

- The add-project form uses Zod schema validation. Text fields have strict length limits; category values are an allowlist; URLs must parse and use only `http:` or `https:`.
- Project content is never inserted with `innerHTML`. Cards are built with DOM nodes and user text uses `textContent`, which prevents stored XSS even if local storage is manually tampered with.
- Local storage is treated as untrusted when loading: all records are parsed again against the schema before being rendered.
- Outbound project links use `noopener`, `noreferrer`, and a no-referrer policy. Optional remote image previews use the same referrer policy.
- `_headers` provides CSP, frame, MIME-sniffing, permissions, referrer, opener, and HSTS headers for hosts that support Netlify-style headers. Serve production traffic over HTTPS.
- `.env.example` documents server-only variables. No secret, credential, or API key is embedded in this frontend.

This static demo intentionally has no API routes and keeps projects in the current browser as required. OAuth sessions, JWT signature verification, CSRF protections, encrypted database storage, and RBAC must be enforced by a server or a managed provider (Clerk/Supabase Auth) before adding a shared API. Never use a client-side role check as authorization; each protected API endpoint must verify the issuer, signature, audience, expiry, and role claims from the JWT on the server.

## Quick start

Run a local static server in this folder, then visit the URL it prints:

```powershell
python -m http.server 8080
```

For deployment, configure the host to apply the headers in `_headers`, set the production site to HTTPS, and populate secrets from the host's secret manager rather than committing an `.env` file.
>>>>>>> 12c629d (update p..)
