# Today API Documentation

API reference for AI agents and programmatic access to the Today productivity app.

## Authentication

All API requests require a Personal Access Token (PAT) passed via the `Authorization` header.

```
Authorization: Bearer pat_your_token_here
```

Tokens are created in the web UI at `/api_tokens`. Each token has a scope:
- `read` - Can only read data (GET requests)
- `write` - Can only modify data (POST, PATCH, DELETE)
- `read_write` - Full access

Requests with insufficient scope return `403 Forbidden`.

## Base URL

```
https://today.travserve.net/api/v1
```

## Rate Limiting

- **Limit**: 100 requests per minute per token
- **Response when exceeded**: `429 Too Many Requests`

## Response Format

All responses are JSON.

**Success:**
```json
{"projects": [...]}
```

**Error:**
```json
{"error": "Error message"}
```

**Validation Error:**
```json
{"errors": ["Name can't be blank", "..."]}
```

---

## Endpoints

### Projects

Projects are containers for milestones, thoughts, resources, and journal entries.

#### List Projects

```
GET /api/v1/projects
```

Returns all active (non-archived) projects.

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "section": "this_month",
      "thoughts_count": 5,
      "resources_count": 3,
      "journal_entries_count": 10,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T12:00:00Z"
    }
  ]
}
```

**Section values:** `this_month`, `next_month`, `this_year`, `next_year`

#### Get Project

```
GET /api/v1/projects/:id
```

Returns project details including milestones.

**Response:**
```json
{
  "project": {
    "id": 1,
    "name": "My Project",
    "description": "Project description",
    "section": "this_month",
    "thoughts_count": 5,
    "resources_count": 3,
    "journal_entries_count": 10,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T12:00:00Z",
    "milestones": [
      {
        "id": 1,
        "name": "Phase 1",
        "description": "Initial phase",
        "position": 1,
        "completed_at": null
      }
    ]
  }
}
```

#### Create Project

```
POST /api/v1/projects
Content-Type: application/json

{
  "project": {
    "name": "New Project",
    "description": "Optional description",
    "section": "this_month"
  }
}
```

**Required fields:** `name`

**Response:** `201 Created` with project object

#### Update Project

```
PATCH /api/v1/projects/:id
Content-Type: application/json

{
  "project": {
    "name": "Updated Name",
    "section": "next_month"
  }
}
```

**Response:** `200 OK` with updated project object

#### Delete Project

```
DELETE /api/v1/projects/:id
```

Archives the project (soft delete).

**Response:** `204 No Content`

---

### Todos

Todos are tasks organized by priority window.

#### List Todos

```
GET /api/v1/todos
```

Returns all active (incomplete) todos.

**Response:**
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete task",
      "priority_window": "today",
      "position": 1,
      "completed": false,
      "completed_at": null,
      "milestone_id": 1,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

**Priority window values:** `today`, `tomorrow`, `this_week`, `next_week`

#### Get Todo

```
GET /api/v1/todos/:id
```

#### Create Todo

```
POST /api/v1/todos
Content-Type: application/json

{
  "todo": {
    "title": "New task",
    "priority_window": "today",
    "milestone_id": 1
  }
}
```

**Required fields:** `title`, `priority_window`

**Optional fields:** `milestone_id` (links todo to a project milestone)

**Response:** `201 Created` with todo object

#### Update Todo

```
PATCH /api/v1/todos/:id
Content-Type: application/json

{
  "todo": {
    "title": "Updated title",
    "priority_window": "tomorrow"
  }
}
```

#### Delete Todo

```
DELETE /api/v1/todos/:id
```

**Response:** `204 No Content`

#### Complete/Uncomplete Todo

```
PATCH /api/v1/todos/:id/complete
```

Toggles completion status. If incomplete, marks as complete. If complete, marks as incomplete.

**Response:**
```json
{
  "todo": {
    "id": 1,
    "completed": true,
    "completed_at": "2026-01-11T15:00:00Z",
    ...
  }
}
```

#### Move Todo

```
PATCH /api/v1/todos/:id/move
Content-Type: application/json

{
  "todo": {
    "priority_window": "tomorrow",
    "position": 1
  }
}
```

Moves a todo to a different priority window and/or position.

#### Week Review

```
GET /api/v1/todos/week_review
```

Returns a summary of todos completed during the current week (Monday to Sunday), along with the milestones and projects they were linked to.

**Response:**
```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete task",
      "completed_at": "2026-01-15T14:30:00Z",
      "milestone": {
        "id": 1,
        "name": "Phase 1"
      },
      "project": {
        "id": 1,
        "name": "My Project"
      }
    },
    {
      "id": 2,
      "title": "Unlinked task",
      "completed_at": "2026-01-14T10:00:00Z",
      "milestone": null,
      "project": null
    }
  ],
  "milestones": [
    {
      "id": 1,
      "name": "Phase 1"
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "My Project"
    }
  ],
  "summary": {
    "week_start": "2026-01-13T00:00:00Z",
    "week_end": "2026-01-19T23:59:59Z",
    "total_completed": 2
  },
  "generated_at": "2026-01-15T15:00:00Z"
}
```

**Notes:**
- Todos are ordered by `completed_at` descending (most recent first)
- `milestones` and `projects` arrays contain unique entries referenced by completed todos
- Todos not linked to a milestone will have `null` for both `milestone` and `project`

---

### Activity

Query comprehensive activity data across all models for any time period. Designed for AI agents to summarize productivity.

#### Get Activity

```
GET /api/v1/activity
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `this_week` | Named period (see values below) |
| `start_date` | date | - | Custom range start (ISO 8601: `2025-01-01`) |
| `end_date` | date | - | Custom range end (ISO 8601: `2025-01-31`) |
| `include` | string | all | Comma-separated filter (see values below) |

**Period values:** `this_week`, `last_week`, `this_month`, `last_month`, `this_quarter`, `last_quarter`, `this_year`, `last_year`

**Include values:** `todos`, `projects`, `milestones`, `events`, `thoughts`, `resources`, `journal_entries`

**Rules:**
- If `period` is provided, `start_date` and `end_date` are ignored
- Custom date range cannot exceed 366 days
- Requires `read` scope

**Response:**
```json
{
  "period": {
    "name": "this_week",
    "start_date": "2026-01-26T00:00:00Z",
    "end_date": "2026-02-01T23:59:59Z"
  },
  "summary": {
    "todos_created": 15,
    "todos_completed": 12,
    "projects_created": 2,
    "projects_completed": 1,
    "milestones_created": 3,
    "milestones_completed": 2,
    "events_occurred": 8,
    "thoughts_created": 5,
    "resources_created": 3,
    "journal_entries_created": 4
  },
  "todos": {
    "created": [
      {
        "id": 1,
        "title": "Implement feature X",
        "priority_window": "today",
        "completed": false,
        "created_at": "2026-01-27T10:00:00Z",
        "completed_at": null,
        "milestone": { "id": 1, "name": "Phase 1" },
        "project": { "id": 1, "name": "Project Alpha" }
      }
    ],
    "completed": [
      {
        "id": 2,
        "title": "Review PR",
        "priority_window": "today",
        "completed": true,
        "created_at": "2026-01-25T09:00:00Z",
        "completed_at": "2026-01-27T14:30:00Z",
        "milestone": { "id": 1, "name": "Phase 1" },
        "project": { "id": 1, "name": "Project Alpha" }
      }
    ]
  },
  "projects": {
    "created": [
      {
        "id": 1,
        "name": "Project Alpha",
        "description": "New initiative",
        "section": "this_month",
        "created_at": "2026-01-27T08:00:00Z",
        "completed_at": null
      }
    ],
    "completed": []
  },
  "milestones": {
    "created": [
      {
        "id": 1,
        "name": "Phase 1",
        "description": "Initial phase",
        "position": 1,
        "created_at": "2026-01-27T09:00:00Z",
        "completed_at": null,
        "project": { "id": 1, "name": "Project Alpha" }
      }
    ],
    "completed": []
  },
  "events": {
    "occurred": [
      {
        "id": 1,
        "title": "Team Standup",
        "description": null,
        "starts_at": "2026-01-27T09:00:00Z",
        "ends_at": "2026-01-27T09:30:00Z",
        "all_day": false,
        "event_type": "personal",
        "project": null
      }
    ]
  },
  "thoughts": [
    {
      "id": 1,
      "content": "Consider using Redis for caching",
      "created_at": "2026-01-27T11:00:00Z",
      "project": { "id": 1, "name": "Project Alpha" }
    }
  ],
  "resources": [
    {
      "id": 1,
      "url": "https://example.com/docs",
      "content": "API documentation",
      "created_at": "2026-01-27T12:00:00Z",
      "project": { "id": 1, "name": "Project Alpha" }
    }
  ],
  "journal_entries": [
    {
      "id": 1,
      "content": "Made good progress on the API today...",
      "created_at": "2026-01-27T17:00:00Z",
      "project": { "id": 1, "name": "Project Alpha" }
    }
  ],
  "generated_at": "2026-01-31T10:00:00Z"
}
```

**Examples:**

```bash
# Get this week's activity (default)
curl -H "Authorization: Bearer $TOKEN" \
  https://today.travserve.net/api/v1/activity

# Get last month's activity
curl -H "Authorization: Bearer $TOKEN" \
  "https://today.travserve.net/api/v1/activity?period=last_month"

# Get Q4 2025 activity with custom date range
curl -H "Authorization: Bearer $TOKEN" \
  "https://today.travserve.net/api/v1/activity?start_date=2025-10-01&end_date=2025-12-31"

# Get only todos and projects for this quarter
curl -H "Authorization: Bearer $TOKEN" \
  "https://today.travserve.net/api/v1/activity?period=this_quarter&include=todos,projects"
```

**Notes:**
- Items include cross-references (`milestone` and `project` info) for full context
- `summary` provides quick counts without needing to iterate through arrays
- Use `include` to reduce response size when only specific data types are needed

---

### Milestones

Milestones belong to projects and can have todos linked to them.

#### List Milestones

```
GET /api/v1/projects/:project_id/milestones
```

**Response:**
```json
{
  "milestones": [
    {
      "id": 1,
      "name": "Phase 1",
      "description": "Initial phase",
      "position": 1,
      "completed_at": null,
      "project_id": 1,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

#### Get Milestone

```
GET /api/v1/projects/:project_id/milestones/:id
```

Returns milestone with linked todos.

**Response:**
```json
{
  "milestone": {
    "id": 1,
    "name": "Phase 1",
    "description": "Initial phase",
    "position": 1,
    "completed_at": null,
    "project_id": 1,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z",
    "todos": [
      {
        "id": 1,
        "title": "Task 1",
        "priority_window": "today",
        "completed": false
      }
    ]
  }
}
```

#### Create Milestone

```
POST /api/v1/projects/:project_id/milestones
Content-Type: application/json

{
  "milestone": {
    "name": "New Milestone",
    "description": "Optional description",
    "position": 1
  }
}
```

**Required fields:** `name`

#### Update Milestone

```
PATCH /api/v1/projects/:project_id/milestones/:id
Content-Type: application/json

{
  "milestone": {
    "name": "Updated name",
    "description": "Updated description"
  }
}
```

#### Delete Milestone

```
DELETE /api/v1/projects/:project_id/milestones/:id
```

**Response:** `204 No Content`

#### Toggle Milestone Complete

```
PATCH /api/v1/projects/:project_id/milestones/:id/toggle_complete
```

Toggles completion status.

---

### Thoughts

Quick ideas or notes attached to a project.

#### List Thoughts

```
GET /api/v1/projects/:project_id/thoughts
```

**Response:**
```json
{
  "thoughts": [
    {
      "id": 1,
      "content": "An idea for the project",
      "project_id": 1,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

#### Get Thought

```
GET /api/v1/projects/:project_id/thoughts/:id
```

#### Create Thought

```
POST /api/v1/projects/:project_id/thoughts
Content-Type: application/json

{
  "thought": {
    "content": "New idea for the project"
  }
}
```

#### Delete Thought

```
DELETE /api/v1/projects/:project_id/thoughts/:id
```

---

### Resources

Links and reference materials for a project.

#### List Resources

```
GET /api/v1/projects/:project_id/resources
```

**Response:**
```json
{
  "resources": [
    {
      "id": 1,
      "url": "https://example.com/doc",
      "content": "Description of the resource",
      "project_id": 1,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

#### Get Resource

```
GET /api/v1/projects/:project_id/resources/:id
```

#### Create Resource

```
POST /api/v1/projects/:project_id/resources
Content-Type: application/json

{
  "resource": {
    "url": "https://example.com/reference",
    "content": "Helpful documentation"
  }
}
```

#### Delete Resource

```
DELETE /api/v1/projects/:project_id/resources/:id
```

---

### Journal Entries

Longer-form notes and updates for a project.

#### List Journal Entries

```
GET /api/v1/projects/:project_id/journal_entries
```

**Response:**
```json
{
  "journal_entries": [
    {
      "id": 1,
      "content": "Today I made progress on...",
      "project_id": 1,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ]
}
```

#### Get Journal Entry

```
GET /api/v1/projects/:project_id/journal_entries/:id
```

#### Create Journal Entry

```
POST /api/v1/projects/:project_id/journal_entries
Content-Type: application/json

{
  "journal_entry": {
    "content": "Progress update for today..."
  }
}
```

#### Delete Journal Entry

```
DELETE /api/v1/projects/:project_id/journal_entries/:id
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient scope |
| 404 | Not Found - Resource doesn't exist or doesn't belong to user |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |

---

## Example: AI Agent Workflow

### 1. Get user's current todos

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://today.travserve.net/api/v1/todos
```

### 2. Create a todo for the user

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"todo":{"title":"Review PR #123","priority_window":"today"}}' \
  https://today.travserve.net/api/v1/todos
```

### 3. Get projects overview

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://today.travserve.net/api/v1/projects
```

### 4. Add a thought to a project

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"thought":{"content":"Consider using Redis for caching"}}' \
  https://today.travserve.net/api/v1/projects/1/thoughts
```

### 5. Mark a todo complete

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  https://today.travserve.net/api/v1/todos/1/complete
```

### 6. Summarize last week's activity

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://today.travserve.net/api/v1/activity?period=last_week"
```

### 7. Get monthly summary for AI analysis

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://today.travserve.net/api/v1/activity?period=last_month"
```

---

## Data Model Summary

```
User
├── Projects (section: this_month|next_month|this_year|next_year)
│   ├── Milestones (ordered, completable)
│   ├── Thoughts (quick notes)
│   ├── Resources (links + descriptions)
│   └── Journal Entries (longer updates)
│
└── Todos (priority_window: today|tomorrow|this_week|next_week)
    └── optionally linked to a Milestone
```

Todos are user-level but can be linked to a project's milestone via `milestone_id`.

---

## Concepts

### Archived vs Completed Projects

Projects have two separate states that are often confused:

**Completed** (`completed_at`)
- Project is finished but remains visible in the app
- Appears in activity summaries and reports
- Can be toggled via `PATCH /api/v1/projects/:id/toggle_complete`
- Use this when work on a project is done but you want to keep it visible

**Archived** (`archived_at`)
- Project is soft-deleted and hidden from all views
- Does NOT appear in activity summaries
- Related items (milestones, thoughts, resources, journal entries) are also excluded from activity
- Set via `DELETE /api/v1/projects/:id`
- Use this when you want to remove a project from sight entirely

In short: **completed = done but visible**, **archived = hidden/deleted**.
