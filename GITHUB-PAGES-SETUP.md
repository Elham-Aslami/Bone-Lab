# Publish Bone Lab on GitHub Pages

This package contains the complete website, including dark mode, the 3D skeleton, study cards, reference documents, and all runtime dependencies. You do not need npm, a build command, or an API key.

## 1. Extract the ZIP

On Windows, right-click `Bone-Lab-GitHub.zip` and choose **Extract All**. Open the extracted `Bone-Lab-GitHub` folder.

Upload the contents of that folder into your repository. Do not upload the outer folder itself or the ZIP file as the website.

The repository's first page should contain these items:

| Item | Purpose |
| --- | --- |
| `.github/workflows/deploy-pages.yml` | Publishes the app through GitHub Actions. Keep this exact path. |
| `dist/` | Complete website: `index.html`, scripts, styles, model, data, documents, licenses, and an app download. |
| `README.md` | App overview, controls, sources, and known 3D coverage limits. |
| `GITHUB-PAGES-SETUP.md` | These instructions. |
| `.gitignore` | Excludes temporary local files from Git. |
| `Start-Bone-Lab.bat` | Optional Windows launcher for studying locally with Python 3. |
| `verify.mjs` | Optional content and model-reference checks. |
| `package-github.py` | Optional script to rebuild the downloadable ZIPs after future edits. |

## 2. Create a repository and upload

1. On GitHub, use **New repository**. You can name it `bone-lab`.
2. For GitHub Free, choose **Public** to use GitHub Pages. Some paid plans also support Pages from private repositories; a private repository does not automatically make its published Pages website private.
3. Create the repository. The package already contains a README and `.gitignore`, so you can leave those initialization options unchecked.
4. On the empty repository page, select **uploading an existing file**. If the repository already contains a file, choose **Add file → Upload files**.
5. Open the extracted `Bone-Lab-GitHub` folder on your computer. Drag all of its contents into the upload area, including `.github` and `dist`.
6. Enter a commit message such as `Add Bone Lab with dark mode`, then choose **Commit changes** to the `main` branch.
7. Confirm that `dist/index.html` and `.github/workflows/deploy-pages.yml` exist at those exact paths. There should be no extra `Bone-Lab-GitHub/` folder above them in the repository.

The upload includes your supplied lab PDF, practical guide, and bone-list document. A public repository and public Pages deployment make these downloadable too. Those course materials retain their original ownership; keep the included attribution and third-party license files with the app.

## 3. Enable Pages

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the repository's **Actions** tab.
4. Select **Publish Bone Lab** in the workflow list.
5. Select **Run workflow**, keep branch `main`, and select the green **Run workflow** button.
6. Wait for the run to show a green check. Open the website URL shown in that run or under **Settings → Pages → Visit site**.

The included workflow publishes the contents of `dist/`. Keep that folder name. You do not need to move `index.html` to the repository root or choose a Jekyll template.

A run triggered by your first upload may fail before Pages is enabled. After selecting **GitHub Actions** as the Pages source, run **Publish Bone Lab** again as described above.

## 4. Open and use the app

- The app starts in dark mode unless a light-mode preference was saved in that browser. The top-right button switches themes.
- Explore, Practice, Compare, and My progress use the bundled study data. The 3D viewer needs a browser with WebGL enabled.
- Export progress from your old Bone Lab site before switching, then use **My progress → Import progress** on the GitHub Pages version. Progress does not move automatically between different website addresses.
- All 104 study cards are included. The existing model coverage remains 88 3D targets and 16 reference-only items, as documented in the README.

## Future updates

Edit or upload the changed files and commit to `main`. The workflow publishes the update automatically. If you want the in-app **Download app files** ZIP to contain those edits too, run `python package-github.py` locally first and upload the refreshed `dist/Bone-Lab-Source.zip` along with your changes.

## If something does not appear

- **No Publish Bone Lab workflow:** check the exact `.github/workflows/deploy-pages.yml` path. If it was missed during upload, choose **Add file → Create new file**, enter that complete filename, paste the contents of the supplied local YAML file, and commit to `main`.
- **Only the README appears as the website:** check that Pages uses **GitHub Actions**, then run the included workflow. It must upload `dist`, not the repository root.
- **Workflow says Pages is not configured:** select **Settings → Pages → Source → GitHub Actions**, then rerun it.
- **Changes do not appear:** confirm the latest Actions run succeeded, then reload the website with Ctrl+Shift+R.
- **Your default branch is not main:** change `branches: [main]` in the workflow to your actual default branch, and run the workflow on that branch.
- **3D viewer cannot start:** use a WebGL-capable browser. Study cards and text recall remain available if WebGL cannot start.

## Official GitHub instructions

- [Adding files to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
