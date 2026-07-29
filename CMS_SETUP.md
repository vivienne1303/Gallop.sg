# Gallop SG Decap CMS Setup

The CMS is hosted at:

`https://gallopsg.netlify.app/admin/`

The public addresses below redirect to the hosted CMS:

- `https://www.gallop.sg/admin/`
- `https://vivienne1303.github.io/Gallop.sg/admin/`

## What staff can edit

After signing in, open **Website Content → Gallop SG Website**. Staff can:

- edit About Us text, FAQs, contact information and locations;
- add, edit or delete riding lesson price rows;
- edit page hero headings, introductions and hero pictures;
- add, reorder or delete pictures in the website's managed galleries.

Uploaded pictures are stored in `images/uploads`. Gallery pictures are
automatically cropped inside the website's existing fixed-size gallery cards,
so portrait and landscape uploads cannot change the gallery layout.

To manage a gallery for the first time:

1. Open **Picture Galleries** and choose **Add Gallery**.
2. Select the website page.
3. Leave **Gallery Number** as `1` unless the page has more than one gallery.
4. Add pictures and write a short description for each picture.
5. Press **Publish**. GitHub Pages updates after the CMS commit is deployed.

Deleting every picture from a managed gallery hides that gallery. Deleting the
gallery record itself restores the pictures originally written in the page.

## Give a staff member access

The production admin uses Netlify Identity with Git Gateway:

1. Open the Netlify site for `gallopsg.netlify.app`.
2. Go to **Integrations → Identity → Users**.
3. Choose **Invite users** and enter the staff member's email address.
4. The staff member accepts the invitation, creates a password and signs in at
   the admin URL above.

Keep Identity registration set to **Invite only** so the public cannot create
admin accounts.

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
