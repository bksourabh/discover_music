# Deploying to GitHub Pages

This guide explains how to deploy the web version of Discover Music to GitHub Pages.

## Automatic Deployment (Recommended)

The app is automatically deployed to GitHub Pages whenever you push to the `main` or `master` branch.

### Setup Steps

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Push to main/master branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor the deployment:**
   - Go to the **Actions** tab in your GitHub repository
   - You'll see a workflow run called "Deploy to GitHub Pages"
   - Wait for it to complete (usually 2-3 minutes)
   - Once complete, your site will be available at:
     `https://[your-username].github.io/[repository-name]/`

## Manual Deployment

If you want to deploy manually:

1. **Build the web app:**
   ```bash
   npm run web:build
   ```

2. **The built files will be in the `web-build/` directory**

3. **Deploy using gh-pages (optional):**
   ```bash
   npx gh-pages -d web-build
   ```

## Important Notes

- The webpack config automatically detects the repository name and sets the correct base path
- A `.nojekyll` file is automatically created to prevent Jekyll processing
- The deployment uses GitHub Actions, so no manual steps are needed after the initial setup
- The app will be available at: `https://[username].github.io/[repository-name]/`

## Troubleshooting

### Build fails
- Make sure all dependencies are installed: `npm install`
- Check that Node.js version is 16 or higher

### Assets not loading
- Verify the `publicPath` in `webpack.config.js` matches your repository name
- Check the browser console for 404 errors

### Page shows 404
- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow completed successfully in the Actions tab
- Wait a few minutes for DNS propagation

