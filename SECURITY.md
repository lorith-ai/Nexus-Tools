# Security Policy

## Supported Versions

We are committed to ensuring the security of Nexus Tools. Currently, we support the latest stable version and the main development branch.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please maintain **responsible disclosure** guidelines:

1.  **Do NOT open a public issue.** This allows us to patch the vulnerability before it can be exploited.
2.  **Report the issue** securely via email to **security@lorith.ai** (or your preferred contact).
3.  Include details about the vulnerability, steps to reproduce, and potential impact.

## Security Architecture

Nexus Tools is built with a security-first approach:
- **No Client-Side Secrets**: All sensitive API keys (e.g., Google Gemini) are managed via server-side proxies (Firebase Cloud Functions).
- **Least Privilege**: Firestore rules enforce strict owner-only access.
- **Automated Scanning**: Builds are scanned for leaked secrets before deployment.

We aim to acknowledge reports within 48 hours and provide patches as quickly as possible.
