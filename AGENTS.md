# FlowTask Frontend

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

## Architecture

- Feature-based organization
- API calls must go through the API layer
- Server state uses TanStack Query
- Forms use React Hook Form + Zod
- Do not duplicate API logic inside components

## Backend API

- Laravel REST API
- Authentication: Sanctum
- API resources expose public UUID as `id`
- Internal database BIGINT IDs must never be exposed

## Rules

- Reuse existing components before creating new ones
- Do not introduce a new library without asking
- Keep components small and composable
- Follow existing naming conventions
- Do not modify unrelated features
- Run lint/typecheck after implementation
