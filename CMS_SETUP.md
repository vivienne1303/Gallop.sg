# Gallop SG Decap CMS Setup

The CMS is available at:

`https://vivienne1303.github.io/Gallop.sg/admin/`

## Local editing

1. Install and run the Decap proxy:

   ```powershell
   npx decap-server
   ```

2. Serve the website with a local HTTP server.
3. Open `/admin/`.

`local_backend: true` allows local editing through the proxy.

## GitHub login

GitHub Pages cannot securely store a GitHub OAuth client secret or exchange an authorization code for an access token. Decap therefore requires an external OAuth provider. Without `backend.base_url`, Decap falls back to Netlify authentication and may send login requests to `api.netlify.com`.

Decap's official documentation lists community-maintained external OAuth providers. A practical option is the Vercel-compatible Node provider:

`https://github.com/bericp1/netlify-cms-oauth-provider-node`

### 1. Deploy the OAuth provider

1. Fork or create a small Vercel project using the provider's `examples/vercel` implementation.
2. Deploy it to Vercel and note its HTTPS URL, for example:

   `https://gallop-sg-cms-oauth.vercel.app`

3. Configure the provider for:

   - Admin origin: `https://vivienne1303.github.io`
   - Admin panel URL: `https://vivienne1303.github.io/Gallop.sg/admin/`
   - Completion/callback URL: the provider's deployed callback endpoint
   - OAuth provider: GitHub

The exact environment-variable names depend on the selected provider implementation. For the Vercel provider, configure the equivalent of:

- OAuth client ID
- OAuth client secret
- Allowed admin origin
- Complete/callback URL
- Admin panel URL

Never put the client secret in this repository or in `admin/config.yml`.

### 2. Create the GitHub OAuth App

In GitHub, open **Settings > Developer settings > OAuth Apps > New OAuth App**.

Use:

- Application name: `Gallop SG Decap CMS`
- Homepage URL: `https://vivienne1303.github.io/Gallop.sg/`
- Authorization callback URL: the exact callback URL exposed by your deployed OAuth provider

GitHub permits only one callback URL per OAuth App. Copy the generated Client ID and Client Secret into the OAuth provider's server-side environment variables.

### 3. Update Decap

Replace the placeholder in `admin/config.yml`:

```yml
backend:
  name: github
  repo: vivienne1303/Gallop.sg
  branch: main
  base_url: https://gallop-sg-cms-oauth.vercel.app
  auth_endpoint: auth
```

`base_url` must be the OAuth provider's origin, not the GitHub Pages URL. `auth_endpoint` must match the provider's login endpoint. If the chosen provider exposes `/api/auth`, use `auth_endpoint: api/auth` instead.

### 4. Give staff repository access

Add each staff member as a collaborator on `vivienne1303/Gallop.sg`. Decap's GitHub backend requires every CMS user to have push access to the repository.

Decap will commit edits to `content/site.json` on the `main` branch. GitHub Pages then publishes the updated JSON with the rest of the site.

Official references:

- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/external-oauth-clients/
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
