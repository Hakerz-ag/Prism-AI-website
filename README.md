# Prism — Local Business Tech (Demo)

This is a minimal, modern, light-themed static demo site showcasing a 3D hero and a rounded contact modal.

How to run

1. Open the folder in your file browser or VS Code.
2. Open `index.html` in a browser (double-click or serve with a static server).

Optional (recommended): serve with a local static server for best results:

```
# Python 3
python -m http.server 8000

# then open http://localhost:8000
```

Next steps you might want:
- Replace the simple Three.js object with a Spline export or a glTF model for richer 3D.
- Hook the contact form to an email or serverless endpoint (Netlify functions, Formspree, etc.).
 - Hook the contact form to an email or serverless endpoint (Netlify functions, Formspree, etc.).
 - A minimal Node + Express backend is included at `server.js` to receive contact submissions and send email via SMTP.
	 - Configure environment variables in a `.env` file at the project root:
		 - `SMTP_HOST` - mail host
		 - `SMTP_PORT` - mail port (587 or 465)
		 - `SMTP_USER` - SMTP username (also used as `from`)
		 - `SMTP_PASS` - SMTP password
		 - `SMTP_SECURE` - set to `true` for port 465 (optional)
	 - Example `.env`:

```
SMTP_HOST=smtp.mailprovider.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
SMTP_SECURE=false
```

Run locally:

```bash
npm install
npm run start
```

Then open http://localhost:3000 and use the contact form. The server will POST to `/contact` and deliver an email to `pranoymaz@gmail.com`.
- Add portfolio detail pages and a CMS for easy updates.
