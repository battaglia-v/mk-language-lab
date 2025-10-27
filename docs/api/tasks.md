# `/api/tasks`

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

Provides CRUD-lite access to learner kanban boards backed by Prisma. Unauthenticated users rely on client-side localStorage; authenticated users persist to the shared database.

## Endpoints

### `GET /api/tasks`

Retrieves the latest boards for a given user.

| Query Param | Type | Required | Description |
| --- | --- | --- | --- |
| `userId` | `string` | No | When provided, fetch boards belonging to the user. If omitted, returns an empty array (indicating localStorage usage). |

**Response**

```json
{
  "boards": [
    {
      "id": "cku...",
      "userId": "auth0|123",
      "name": "Learning Plan",
      "columns": "{...}",
      "createdAt": "2025-10-22T17:03:00.000Z",
      "updatedAt": "2025-10-26T09:11:22.000Z"
    }
  ]
}
```

### `POST /api/tasks`

Creates or updates the single board record associated with a user.

**Request Body**

```json
{
  "userId": "auth0|123",
  "name": "My Tasks",
  "columns": {
    "todo": [{ "id": "item-1", "title": "Review vocabulary" }],
    "done": []
  }
}
```

- When `userId` is missing, the API short-circuits and returns `{ localStorage: true }` so the client can persist locally.
- When a board already exists for `userId`, it is updated; otherwise a new record is created.

**Response**

```json
{
  "board": {
    "id": "cku...",
    "userId": "auth0|123",
    "name": "My Tasks",
    "columns": "{...}"
  }
}
```

## Error Responses

- `500` — Database connectivity or serialization failure.

## Dependencies

- **Internal**: Prisma client (`lib/prisma.ts`) targeting the `Board` model.
- **Environment**: Database connection URL and credentials as configured for Prisma.

## Operational Notes

- Ensure migrations keep the `Board` model aligned with client expectations (currently stores `columns` as JSON string).
- Consider rate limiting and payload validation before exposing to third-party clients.
