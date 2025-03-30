# Changelog

All notable changes to the Cursor MCP Installer will be documented in this file.

## [0.1.3] - 2024-06-10

### Added
- New path handling utilities to improve file path resolution:
  - `normalizeServerPath` - Normalizes and validates file paths
  - `findSchemaFile` - Intelligently finds schema files in arguments
  - `findServerEntryPoint` - Detects common server entry points in directories

### Improved
- Enhanced path handling for all MCP server installations
- Better schema file detection for OpenAPI schema servers (now checks all arguments)
- Improved directory scanning for server entry points
- Automatic normalization of file paths in server arguments
- More robust error handling during path resolution
- Added support for detecting Python server files in local installations

### Fixed
- Fixed issues with relative vs. absolute paths in server configurations
- Resolved problems with path handling for files with spaces
- Improved error reporting for invalid file paths

### Thanks
- Special thanks to [@ItzAmirreza](https://github.com/ItzAmirreza) for submitting the issue regarding path handling problems for intital installation

## [0.1.2] - 2024-05-21

### Added
- Fixed installation instructions to include required `index.mjs` argument in command args
- Enhanced error handling for installation failures
- Support for more MCP server types including Python-based servers

### Changed
- Updated repository URLs
- Cleaned up repository structure
- Improved documentation and examples

### Fixed
- Resolved issues with npm package naming
- Fixed configuration file path generation
- Improved error messages for failed installations

Initial public release.

- Base functionality for installing MCP servers
- Support for npm and uvx installations
- Basic support for OpenAPI schema servers
- Support for installing from local directories 