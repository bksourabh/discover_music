# GitHub Pages Setup Guide

If you're getting the error: "Get Pages site failed. Please verify that the repository has Pages enabled..."

Follow these steps to enable GitHub Pages:

## Step-by-Step Instructions

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub (e.g., `https://github.com/your-username/discover_music`)
2. Click on **Settings** (top menu bar)
3. Scroll down to **Pages** in the left sidebar (under "Code and automation")
4. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")
5. Click **Save**

### 2. Verify Repository Permissions

Make sure your repository allows GitHub Actions:
- Go to **Settings** → **Actions** → **General**
- Under "Workflow permissions", select:
  - ✅ **Read and write permissions**
  - ✅ **Allow GitHub Actions to create and approve pull requests**
- Click **Save**

### 3. Push Your Code

After enabling GitHub Pages, push your code:

```bash
git add .
git commit -m "Enable GitHub Pages deployment"
git push origin main
```

### 4. Monitor the Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the progress
4. Wait for it to complete (usually 2-3 minutes)

### 5. Access Your Site

Once the deployment completes successfully, your site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

For example, if your username is `johndoe` and repository is `discover_music`:
```
https://johndoe.github.io/discover_music/
```

## Troubleshooting

### Error: "Get Pages site failed"

**Solution:** Make sure you've completed Step 1 above - GitHub Pages must be enabled in Settings → Pages with "GitHub Actions" selected as the source.

### Error: "Workflow permissions"

**Solution:** Complete Step 2 above - ensure Actions have read/write permissions.

### Error: "No such file or directory: web-build"

**Solution:** The build step failed. Check the Actions log to see why the build failed. Common issues:
- Missing dependencies: Make sure `package.json` is committed
- Build errors: Check the build logs for TypeScript or webpack errors

### Site shows 404 after deployment

**Solutions:**
1. Wait a few minutes - DNS propagation can take time
2. Check the Actions tab - make sure the deployment completed successfully
3. Verify the URL - make sure you're using the correct repository name
4. Clear browser cache or try incognito mode

### First deployment takes longer

The first deployment may take 5-10 minutes as GitHub sets up the Pages infrastructure. Subsequent deployments are usually faster (2-3 minutes).

## Need Help?

If you're still having issues:
1. Check the Actions tab for detailed error messages
2. Verify all steps above are completed
3. Make sure your repository is public (or you have GitHub Pro/Team for private repos with Pages)

