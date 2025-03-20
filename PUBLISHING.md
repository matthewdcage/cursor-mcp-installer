# Publishing Guide for cursor-mcp-installer-free

This document provides step-by-step instructions for publishing the MCP Installer package to npm.

## Prerequisites

1. An npm account with publish access
2. npm CLI installed on your machine
3. Node.js (v16 or higher)

## Preparation Steps

1. Ensure all changes are committed to the repository
2. Update version in `package.json` if needed (using semantic versioning)
3. Make sure all tests pass and the build works

## Publishing Process

### 1. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted. If you have 2FA enabled, you'll need to provide the authentication code as well.

### 2. Build the Package

```bash
npm run build
```

This will compile the TypeScript code to JavaScript in the `lib` directory.

### 3. Publish the Package

There are two ways to publish:

#### Option A: Using the npm publish Command

```bash
npm publish --access public
```

#### Option B: Using the Script in package.json

```bash
npm run publish-public
```

This will execute the `publish-public` script defined in `package.json`, which runs `npm publish --access public`.

### 4. Verify the Publication

Visit the package page on npm to ensure it was published successfully:
https://www.npmjs.com/package/cursor-mcp-installer-free

## Updating the Package

When making updates to the package:

1. Update the version in `package.json` following semantic versioning:
   - **Patch** (1.0.x): Bug fixes and minor changes
   - **Minor** (1.x.0): New features, backwards compatible
   - **Major** (x.0.0): Breaking changes

2. Commit and push the changes to the repository

3. Follow the publishing process above

## Troubleshooting

### Common Issues

#### Authentication Errors

If you encounter authentication errors, ensure you have the proper permissions.

```
npm ERR! code E403
npm ERR! 403 403 Forbidden - PUT https://registry.npmjs.org/cursor-mcp-installer-free
npm ERR! 403 In most cases, you or one of your dependencies are requesting
npm ERR! 403 a package version that is forbidden by your security policy.
```

Solution: Make sure you're logged in with the correct npm account.

#### Package Name Already Exists

If the package name is already taken:

```
npm ERR! code E403
npm ERR! 403 403 Forbidden - PUT https://registry.npmjs.org/cursor-mcp-installer-free - You do not have permission to publish "cursor-mcp-installer-free".
```

Solution: Choose a different package name or request access to the existing package.

## Notes

- Always test the package locally before publishing
- Consider using `npm pack` to create a tarball and inspect the contents before publishing
- Use `npm version` to automatically update the version number in package.json 