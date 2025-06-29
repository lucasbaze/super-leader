1. 🧩 Input Plugin System (InputAdapter)
   Let’s define inputs as modular fragments. Each InputAdapter injects a set of ContextFragments that the AI can later use.

```ts
export interface ContextFragment {
  id: string;
  source: string; // e.g. 'calendar', 'email', 'goals'
  value: any;
  relevance?: number; // 0–1 (optional)
  confidence?: number; // 0–1 (optional)
  metadata?: Record<string, any>;
}
```

```ts
export interface InputAdapter {
  id: string;
  description: string;
  getContextFragments(userId: string): Promise<ContextFragment[]>;
}
```

Example Input Adapter: Goals

```ts
export const goalsAdapter: InputAdapter = {
  id: 'goals',
  description: 'Personal, family, and work goals provided by user',
  async getContextFragments(userId) {
    const goals = await db.getUserGoals(userId); // however you're storing this
    return goals.map((goal) => ({
      id: `goal-${goal.id}`,
      source: 'goals',
      value: goal.description,
      relevance: goal.importance || 0.8,
      metadata: { category: goal.category } // 'personal', 'work', etc
    }));
  }
};
```

All adapters are registered in a central registry:

```ts
export const inputAdapters: InputAdapter[] = [
  goalsAdapter,
  calendarAdapter,
  birthdayAdapter,
  emailAdapter
  // ...etc
];
```

2. 📦 Context Assembly (ContextBuilder)
   Once all adapters run, they produce a list of fragments:

```ts
const fragments: ContextFragment[] = await Promise.all(
  inputAdapters.flatMap((adapter) => adapter.getContextFragments(userId))
);
```

Use these to build a prompt input for the AI:

```ts
function buildPromptInput(fragments: ContextFragment[]): string {
  return fragments
    .map(frag => `Source: ${frag.source} — ${JSON.stringify(frag.value)}`)
    .join('\n');
}
You can pass this as the context for your first routing LLM call.
```
