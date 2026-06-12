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

GitHub Pages serves static files and cannot safely store the GitHub OAuth client secret. A small external OAuth provider is therefore required for staff login.

1. Deploy a Decap-compatible GitHub OAuth provider, such as the official example provider on Cloudflare Workers, Vercel, Netlify Functions, or another serverless host.
2. Create a GitHub OAuth App under **GitHub Settings > Developer settings > OAuth Apps**.
3. Set its homepage URL to:

   `https://vivienne1303.github.io/Gallop.sg/`

4. Set the callback URL to the callback URL required by the chosen OAuth provider.
5. Store the GitHub OAuth Client ID and Client Secret in the provider's environment variables. Never commit the secret to this repository.
6. Uncomment and update these lines in `admin/config.yml`:

   ```yml
   base_url: https://your-oauth-provider.example.com
   auth_endpoint: auth
   ```

7. Add staff as collaborators on `vivienne1303/Gallop.sg`. Their GitHub account needs permission to commit to the repository.

Decap will commit edits to `content/site.json` on the `main` branch. GitHub Pages then publishes the updated JSON with the rest of the site.

Official references:

- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/external-oauth-clients/
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
