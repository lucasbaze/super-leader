# Task Generation and Content Suggestion Data Flow

```mermaid
sequenceDiagram
    participant GT as generate-tasks.ts
    participant GFT as generate-follow-up-tasks.ts
    participant GCS as get-content-suggestions.ts
    participant CSP as create-content-suggestion-prompt.ts
    participant CCS as create-content-suggestions.ts
    participant DB as Database

    GT->>GFT: generateFollowUpTasks(db, userId)
    GFT->>DB: rpc('get_people_needing_follow_up')
    DB-->>GFT: people[]

    loop For each person
        GFT->>GCS: getContentSuggestionsForPerson({<br/>db,<br/>personId,<br/>type: 'content',<br/>quantity: 2<br/>})

        GCS->>DB: getPerson(personId, withInteractions: true)
        DB-->>GCS: person + interactions

        GCS->>DB: get previous suggestions
        DB-->>GCS: suggestions[]

        GCS->>CSP: createContentSuggestionPrompt({<br/>personResult,<br/>suggestions,<br/>type,<br/>quantity<br/>})
        CSP-->>GCS: { topics, prompt }

        GCS->>CCS: createContentSuggestions({<br/>userContent: prompt,<br/>suggestions,<br/>type<br/>})
        CCS-->>GCS: contentVariants[]

        GCS->>DB: save suggestions
        DB-->>GCS: savedSuggestions[]

        GCS-->>GFT: {<br/>suggestions: savedSuggestions,<br/>topics: topics<br/>}

        GFT->>DB: createTask({<br/>task: {<br/>userId,<br/>personId,<br/>trigger: TASK_TRIGGERS.FOLLOW_UP,<br/>context: { context, callToAction },<br/>suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT,<br/>suggestedAction: savedSuggestions<br/>}<br/>})
    end

    GFT-->>GT: { data: tasksCreated, error: null }
    GT-->>Client: { data: { generatedTasks, errors }, error: null }
```

## Type Flow

```mermaid
flowchart TD
    A[generate-tasks.ts] -->|ServiceResponse GenerateTasksResult| B[generate-follow-up-tasks.ts]
    B -->|ServiceResponse number| A
    B -->|ServiceResponse GetContentSuggestionsForPersonResponse| C[get-content-suggestions.ts]
    C -->|ServiceResponse SuggestionPromptResponse| D[create-content-suggestion-prompt.ts]
    D -->|ServiceResponse Array of ContentVariant| E[create-content-suggestions.ts]
    E -->|ServiceResponse GetContentSuggestionsForPersonResponse| C
    C -->|ServiceResponse GetContentSuggestionsForPersonResponse| B
```

## Type Definitions

### generate-tasks.ts

```typescript
interface GenerateTasksResult {
  generatedTasks: number;
  errors: string[];
}
```

### generate-follow-up-tasks.ts

```typescript
interface GetContentSuggestionsForPersonResponse {
  suggestions: ContentSuggestionWithId[];
  topics: string[];
}
```

### get-content-suggestions.ts

```typescript
interface ContentSuggestionWithId {
  id: string;
  contentUrl: string;
  title: string;
  reason: string;
}
```

### create-content-suggestion-prompt.ts

```typescript
interface SuggestionPromptResponse {
  topics: string[];
  prompt: string;
}
```

### create-content-suggestions.ts

```typescript
interface ContentVariant {
  title: string;
  contentUrl: string;
  reason: string;
}
```
