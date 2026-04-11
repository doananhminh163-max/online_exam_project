# Gemini CLI Project Instructions

These are the foundational mandates and project-specific instructions for the Gemini CLI agent working on this codebase.

## Project Context
- **Name:** Online Exam Project
- **Backend:** Node.js, Express, Prisma ORM, SQLite
- **Frontend:** React, Vite, TypeScript

## Documentation
- **Architecture Overview:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Refer here for system architecture, diagrams, and frontend/backend details.
- **API Specification:** [docs/API_SPEC.md](docs/API_SPEC.md) - Refer here for API endpoints and data formats.

## General Guidelines
- **TypeScript:** Use TypeScript strictly for all new files and features.
- **Architecture:** Follow the established architecture as described in `docs/ARCHITECTURE.md`. Use MVC-like patterns in the backend (`src/routes`, `src/controllers`, `src/services`).
- **API Consistency:** Ensure all new or modified API endpoints strictly follow the patterns defined in `docs/API_SPEC.md`.
- **Security:** Ensure sensitive data (like passwords and sessions) are handled securely. Do not expose secrets.
- **Testing:** Add tests for new features and bug fixes where applicable.
