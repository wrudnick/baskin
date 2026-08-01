# Setting up the admin (Sveltia CMS)

The site is static and hosted free on GitHub Pages. Robby edits content through a
web form at **`/admin`**; when he saves, Sveltia commits the change to the GitHub
repo and the live site updates automatically. There is **no server to pay for**.

There are three ways to sign in. Pick one.

---

## Option A — Edit locally on your Mac (zero setup, works right now)

Good for you (William) to fill in content before launch. Nothing to configure.

1. Serve the folder: `python3 -m http.server 8765` from the repo root.
2. Open <http://localhost:8765/admin/> in Chrome or Edge.
3. Click **"Work with Local Repository"** and pick the `baskin` folder.
4. Edit. Saves write straight to the local files (then you `git push` to publish).

> Uses the browser's File System Access API (Chrome/Edge/Arc). No GitHub needed.

---

## Option B — Robby signs in with a GitHub token (no extra infrastructure)

Simplest way to give **Robby** web editing without deploying anything extra.

1. Robby (or you) creates a **fine-grained personal access token** at
   <https://github.com/settings/tokens?type=beta>:
   - Repository access: only the `baskin` repo.
   - Permissions: **Contents → Read and write**.
2. In `admin/config.yml`, set `repo:` to `your-github-username/baskin`.
   (You can leave `base_url` as-is; it's only used for Option C.)
3. Robby opens `https://YOURSITE/admin/`, clicks **"Sign In Using Access Token"**,
   and pastes the token. The browser remembers it.

> Downside: fine-grained tokens expire (max 1 year), so it must be regenerated
> occasionally. No Cloudflare, no OAuth app.

---

## Option C — One-click "Sign in with GitHub" (nicest for Robby, one-time setup)

This is the smoothest experience: Robby just clicks a button. It needs a tiny,
free OAuth relay because GitHub's OAuth can't run from a static page alone.

1. **Create a GitHub OAuth App** at
   <https://github.com/settings/developers> → *New OAuth App*:
   - Homepage URL: your site URL.
   - Authorization callback URL: `https://<your-worker>.workers.dev/callback`
     (you'll get this URL in the next step; come back and fill it in).
   - Note the **Client ID** and generate a **Client Secret**.
2. **Deploy the free auth worker** (Sveltia's official one) to Cloudflare:
   - Repo + instructions: <https://github.com/sveltia/sveltia-cms-auth>
   - It's a one-file Cloudflare Worker. Set the `GITHUB_CLIENT_ID` and
     `GITHUB_CLIENT_SECRET` environment variables to the values from step 1.
   - Cloudflare's free tier is plenty; there is no cost.
3. In `admin/config.yml` set:
   - `repo: your-github-username/baskin`
   - `base_url: https://<your-worker>.workers.dev`
4. Robby opens `https://YOURSITE/admin/` → **"Sign In with GitHub"** → done.

> For Robby to edit, he must be a collaborator on the repo
> (repo → Settings → Collaborators), or the repo can be under an org he's in.

---

## Recommendation

- Use **Option A** now to load Robby's real content yourself.
- For Robby's ongoing self-service, set up **Option C** (best UX). If you'd
  rather not touch Cloudflare, **Option B** works with just a token.
