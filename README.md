# InstaDL

Production-oriented Instagram public-media resolver UI for Netlify.

Stack: static frontend, Netlify Functions, server-side validation, normalization, short-lived cache, and Instagram Graph API adapter.

Local: npm install && npm run dev

Environment: set INSTAGRAM_ACCESS_TOKEN in Netlify. The app intentionally does not bypass private accounts, login walls, rate limits, or access controls.

Deployment target: Netlify project instadl-cyv3.