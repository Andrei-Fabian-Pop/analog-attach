# Development Guidelines

## Project Structure
- `packages/extension`: VS Code extension 
- `packages/hds-components`: HDS Components, Lit-based components
- `packages/hds-react`: HDS React Components
- `packages/pnp-webview`: Plug and Play Webview

## Getting Started

### Install dependencies
`yarn` is the package manager of choice for this project.

- Install Yarn package manager globally. `npm install -g yarn`
- Install tools for building .vsix extension files. `npm install -g @vscode/vsce`
- `yarn install`

### Building

#### Building dependencies