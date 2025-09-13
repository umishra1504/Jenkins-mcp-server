# Security Policy

## Threat Model Overview

This project exposes Jenkins operations via the Model Context Protocol (MCP) for AI assistants. The primary attack surface is tool invocation with parameters that may cause:

-   Unauthorized file disclosure (uploading sensitive local files as build parameters)
-   Abusive triggering / stopping of builds
-   Enumeration of Jenkins jobs or artifacts beyond intended scope

## File Parameter Safeguards

`triggerBuild` and `scheduleBuild` support file parameters by detecting parameter values that are existing files. To reduce accidental or malicious exfiltration:

-   Absolute file paths are **blocked by default**.
-   Only files within the current working directory (or its subdirectories) are allowed.
-   To explicitly allow absolute paths, the operator must opt in: `ALLOW_ABSOLUTE_FILE_PARAMS=1`.
-   If an absolute path is provided without opt‑in, the tool returns a failure message and does NOT proceed.

### Rationale

AI-driven or automated prompts may guess or inject host file paths (`/etc/passwd`, `.env`, `C:\Users\<user>\secrets.txt`). Blocking absolute paths by default prevents silent exfiltration.

## Environment Variables

Required sensitive values:

-   `JENKINS_URL`
-   `JENKINS_USERNAME` / `JENKINS_USER`
-   `JENKINS_API_TOKEN`

These are validated at startup. The process exits early if any are missing to avoid partial insecure states.

Optional hardening variables:

-   `JENKINS_MCP_RETRIES` – Controls retry attempts (avoid overly large values to prevent unintended traffic amplification)
-   `ALLOW_ABSOLUTE_FILE_PARAMS` – Set to `1` only when you fully trust the invoking context.

## CSRF Protection

The client automatically retrieves and caches Jenkins crumbs (5 minute TTL). If Jenkins has CSRF protection disabled, it proceeds without crumbs. This behavior is logged only when `DEBUG` includes `jenkins-mcp` to avoid leaking internal details.

## Rate Limiting / Abuse

This library itself does not implement rate limiting. Deploy behind:

-   A Jenkins reverse proxy with request throttling
-   An API gateway with authentication / quotas (if exposing beyond local workstation)

## Recommended Runtime Practices

1. Use a **least-privilege Jenkins API token** scoped to only the jobs needed.
2. Run the MCP server in a **dedicated, low-privilege user workspace**.
3. Avoid mounting sensitive directories into the working directory for sessions involving AI agents.
4. Log and monitor unusual build trigger patterns.
5. Rotate API tokens regularly.

## Reporting Vulnerabilities

If you discover a security issue:

1. Do NOT open a public issue with sensitive details.
2. Email the maintainer listed in `package.json` with a clear description and reproduction steps.
3. Acknowledge CVE coordination if appropriate.

## Roadmap (Planned Security Enhancements)

-   Optional allowlist of permissible job name prefixes
-   Configurable maximum concurrent build triggers per time window
-   Signed artifact verification helper
-   Structured audit log output option

---

Stay safe and automate responsibly.
