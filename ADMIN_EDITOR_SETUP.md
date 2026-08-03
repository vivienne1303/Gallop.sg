# Gallop SG website editor setup

Staff edit the website at `https://www.gallop.sg/admin/`.

The editor changes `content/site.json`, uploads pictures to `images/uploads`,
and publishes through the existing Railway backend. GitHub Pages then rebuilds
the public website. Staff do not need GitHub or VS Code access.

## One-time Railway configuration

Open the existing `gallopsg-production` Railway service and add these variables:

- `ADMIN_PASSWORD`: the shared staff password. Use a unique password of at
  least 16 characters.
- `ADMIN_SESSION_SECRET`: a long random secret of at least 32 characters.
- `GITHUB_TOKEN`: a fine-grained GitHub personal access token with **Contents:
  Read and write** access to only the `vivienne1303/Gallop.sg` repository.
- `GITHUB_REPO`: `vivienne1303/Gallop.sg` (optional; this is the default).
- `GITHUB_BRANCH`: `main` (optional; this is the default).

Redeploy the Railway service after adding the variables.

## Create the GitHub token

1. In GitHub, open **Settings > Developer settings > Personal access tokens >
   Fine-grained tokens**.
2. Create a token owned by the account that manages the website.
3. Limit repository access to **Gallop.sg** only.
4. Set the repository **Contents** permission to **Read and write**. Leave every
   unrelated permission disabled.
5. Copy the token into Railway as `GITHUB_TOKEN`. Never put it in this
   repository or in browser code.

## Staff workflow

1. Open `/admin/` and enter the staff password.
2. Choose a section in the green sidebar.
3. Edit text, upload pictures, or drag gallery pictures into order.
4. Press **Publish website** and add a short update note.
5. Wait a few minutes, then open and refresh the live page.

## Security notes

- The editor uses a server-verified password and expiring session.
- Sign-in attempts are rate-limited.
- The GitHub token stays only in Railway environment variables.
- Uploaded files are restricted to the website upload folder and 5 MB each.
- Change `ADMIN_PASSWORD` whenever staff access should be revoked.
