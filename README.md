# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Step6

## Deployment Instructions

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Local Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run JSON server and development server together
pnpm dev:all

# Build for production
pnpm build
```

### Deploying to Netlify

This project is configured for deployment on Netlify using pnpm. The configuration is in the `netlify.toml` file.

1. Connect your repository to Netlify
2. Netlify will automatically detect pnpm from the configuration
3. Set the following environment variables in Netlify dashboard:
   - `USE_PNPM`: `true`
   - `NETLIFY_USE_PNPM`: `true`

### Deploying to Vercel

This project is configured for deployment on Vercel using pnpm. The configuration is in the `vercel.json` file.

1. Connect your repository to Vercel
2. Vercel will automatically detect pnpm from the `pnpm-lock.yaml` file
3. Set the following environment variable in Vercel dashboard if needed:
   - `PNPM_VERSION`: `8.x`