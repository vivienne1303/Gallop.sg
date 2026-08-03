# Gallop.sg

A static website for Gallop Stable Singapore.

Website staff can update managed content and pictures through the custom editor
at `/admin/`. Publishing is handled securely by the existing Railway backend
and GitHub; staff do not need VS Code.

## Project Structure

```text
Gallop.sg/
|-- index.html
|-- pages/
|   |-- gallopsg/
|   |   |-- contact.html
|   |   |-- join.html
|   |   |-- promotion.html
|   |   |-- faq.html
|   |   `-- gallop-ai.html
|   |-- stable/
|   |-- jackuda/
|   |-- care/
|   `-- other venture folders/
|-- css/
|-- js/
|-- images/
|-- content/site.json
`-- admin/
```

Open `index.html` in a browser to view the site locally.

See `ADMIN_EDITOR_SETUP.md` for the one-time editor deployment setup.
