# Task Suggestion System Feature Requirements

## 1. Feature Purpose

**Problem Statement:**
Users need a way to manage and be reminded of important tasks and follow-ups in their relationship management. The system should support both AI-generated suggestions and user-created tasks, with intelligent date handling and priority management.

**Feature Alignment:**
This feature aligns with the core goal of helping users maintain and strengthen their relationships by ensuring important actions and follow-ups don't fall through the cracks.

**Urgency & Impact of Non-Implementation:**
Without this feature, users would have to manually track all their follow-ups and important dates, likely leading to missed opportunities for relationship building and maintenance.

**Alternatives Considered:**

- Simple calendar reminders (lacks context and intelligence)
- Manual task list (misses AI-powered suggestions)
- Email reminders (lacks integration with relationship context)

---

## 2. User Impact

**Target User Segments:**

- Active users managing multiple relationships
- Users who want to stay on top of important dates and follow-ups
- Users who appreciate AI-assisted task management

**User Discovery Method:**

- Tasks will be prominently displayed on the homepage
- Tasks will be organized into "Today" and "All Tasks" tabs
- Tasks will be grouped by timeframe for easy scanning

**Pain Points Addressed:**

- Forgetting to follow up with contacts
- Missing important dates
- Difficulty in prioritizing relationship maintenance tasks
- Uncertainty about when to reach out

**Behavioral Changes Anticipated:**

- More consistent follow-ups with contacts
- Better preparation for important dates
- More proactive relationship management
- Increased engagement with the platform

---

## 3. Success Metrics

**Measurement Criteria:**

- Task completion rate
- Task snooze rate
- Task skip rate
- Bad suggestion rate
- Time to task completion
- User engagement with task system

**Key Performance Indicators (KPIs):**

- % of tasks completed vs skipped
- Average time to complete tasks
- User satisfaction with AI suggestions
- Reduction in missed follow-ups
- Increase in meaningful interactions

---

## 4. Technical Scope

**Core Requirements:**

Database Schema (From existing implementation):
\`\`\`typescript
task_suggestion: {
Row: {
completed_at: string | null
content: Json
created_at: string
end_at: string | null
id: string
person_id: string
skipped_at: string | null
snoozed_at: string | null
type: string
updated_at: string
user_id: string
}
}
\`\`\`

**System Dependencies:**

- Next.js Application
- Supabase Database
- AI Service for task creation and date interpretation
- Date handling utilities (@/lib/dates)

**Technical Limitations and Scalability:**

- Handle timezone differences appropriately

---

## 5. Implementation Details

**Phase 1 - Core Task Management:**

1. Task Actions:

   - Complete task
   - Snooze task (with AI-determined new date)
   - Skip task
   - Mark as bad suggestion
   - Create task via AI chat

2. AI Chat Integration:

   - New chat tool for task creation
   - Natural language date interpretation
   - Priority determination
   - Follow-up question capability

3. Homepage UI:
   - Two tabs: "Today" and "All Tasks"
   - Task grouping by timeframe:
     - Today
     - Tomorrow
     - Days of the week
     - Next week
     - Next month

**Phase 2 - Automated Task Creation (Future):**

- Cron job for birthday tasks
- AI analysis for suggested tasks
- Automated task generation from user notes

---

## 6. UX/UI

**UI Design Principles:**
Based on existing components:

Task Card Component (@task-suggestion-card.tsx):
\`\`\`typescript

- Display person's avatar
- Show task type and action
- Display due date
- Action buttons:
  - Complete
  - Skip
  - Snooze
  - Mark as bad suggestion
    \`\`\`

Tab Navigation (@context-tabs.tsx style):
\`\`\`typescript

- Today tab
- All Tasks tab
- Consistent styling with existing tabs
  \`\`\`

**User Flow:**

1. User views tasks on homepage
2. Tasks are grouped by timeframe
3. User can take action on any task
4. AI creates new tasks through chat
5. Tasks appear in appropriate timeframe groups

---

## 7. Integration Points

**Existing Components:**

- @task-suggestion-card.tsx
- @use-tasks.ts
- @route.ts
- @get-tasks.ts
- Homepage (@page.tsx)

**AI Integration:**

- Chat tool system (@chat-tools.ts)
- Natural language processing for dates
- Task priority determination
- Follow-up questions

---

## 8. Release Planning

**Phase 1 Rollout:**

1. Core task management functionality
2. AI chat integration
3. Homepage UI with tabs
4. Basic task grouping

**Phase 2 Rollout (Future):**

1. Cron job implementation
2. Birthday task automation
3. AI-suggested tasks
4. Advanced task analysis

---

## 9. Maintenance Considerations

**Monitoring and Updates:**

- Track AI suggestion quality
- Monitor task completion patterns
- Review bad suggestion feedback
- Update AI models based on feedback

**Support and Issue Management:**

- Handle timezone edge cases
- Manage AI service disruptions
- Address date interpretation issues
- Support task data migration

---

## Additional Notes:

**Date Handling:**

- AI should interpret relative dates intelligently
- Example: "next week" on Tuesday should target Monday
- Consider task importance for timing
- Use @/lib/dates for consistent handling

**AI Interaction:**

- AI should ask clarifying questions when needed
- Should understand priority and urgency
- Should suggest appropriate lead times
- Should learn from "bad suggestion" feedback

```All Context
Start with @feature-requirements.md as the entry point for our prompting:

We're just going to focus on building the feature requirement document for our task suggestion mechanism.

We already have some of this functionality that exists but is not fully wired up yet.

Here are the tests that this functionality feature set should pass:

- A user should be able to complete a task.
- A user should be able to snooze a task.
- A user should be able to skip a task.
- The user should be able to mark a task as a bad suggestion.

All of these cards can be viewed within @task-suggestion-card.tsx ( This should be included in the feature requirement doc )

We can see the current task suggestion table within @index.ts and @supabase.ts  ( These definitions should be included in the req documents as well )
- When the user snoozes a task, an AI will determine when to reset the time of when that task should be taken action of again.
- If the user skips a task, it will just simply be marked as skipped and our CRON job will not actually pick it back up again.
If the user clicks bad suggestion, it will be the same thing as skipping it in terms of it will be marked as skipped and it will not be viewed again. But it will also mark the flag as bad suggestion so that we can make the AI better in the future.
- If the user marks it as complete, then it will be done and we will proceed forward as if it was completed and it will not be pulled back into the list. The list can be viewed at @page.tsx and within the @use-tasks.ts and the @route.ts and the @get-tasks.ts service. ( This should also be included in the docs )

I know I'll need to create some type of cron job that can on a daily basis run through the system and determine what should be tasks or not.

We're going to start with this system being very simple where this cron job will then...will simply pull all the birthdays of the people that are in the system and create a task for those birthdays.

So from a conceptual perspective, really this task suggestion mechanism at a theoretical level should be that a cron job can create tasks or an AI can create tasks and those tasks will have a date on them as to when they should be when we should take action on that task. So for example, if it's a birthday, we should pull birthdays that are coming up in maybe the say the next two weeks and that gives us time to find a gift or be thoughtful about that upcoming birthday. And AI should also be able to create tasks through the course of using the system. So if I were to make a note that said remind me to follow up with John in two weeks, then the system should be able to automatically create a task that will then show up in the task list within two weeks later. Now, we're not going to focus on that just yet. We're just going to focus on the birthdays for right now, but you can see how a system should work like that.

On the home page I want to actually now have two different tabs for today and then all tasks. These tabs will be styled like the tabs that are in @context-tabs.tsx  ( This should be included in the docs )

On the homepage, the test should be grouped by timestamp. So today, tomorrow, and then the day of the week moving forward. So it should be today, tomorrow, and then maybe Friday, Saturday, Sunday, next week, next month, etc. This should be applied for both the today tabs and the all tasks tab.

I want to break this down a little bit further. So let's just start with the AI being able to create tasks. We can complete tasks. We can skip tasks. We can snooze tasks. We can create tasks. We can create tasks. And we can mark it as bad suggestion. We don't need to add the cron job just yet. I want to focus in on the creating of these tasks and the AI being able to create the tasks through the chat using a new tool like our @chat-tools.ts or a tool like @add-people-to-group.ts .

Then after the task gets created, that task will then be viewable on the homepage when it's time to do the task. The tricky part will be working with dates. The AI should be able to understand dates in a way that if I say remind me next week to do something that if it's today is Tuesday the 12th it should suggest a date in the future that is maybe 6, 7 or even 8 days. So maybe it suggests it on Monday the next week so I can start my day with that task. The same thing should hold for tasks that are, let's say, next year, or next month, or in two weeks. The AI should also be able to interpret to what extent this task should be, when I should be reminded about it. So if it's something that's very important, the AI should then maybe prioritize that task being done a little bit earlier or reminding me a little bit earlier than let's just say the due date, hypothetically. Lastly, the AI should also follow up with any additional questions if it's not completely clear as to what needs to be done or when it needs to be done.

We'll add the cron job stuff in a phase two. The purpose of the cron job will be for tasks that the user does not create but are just kind of laying around so to speak. So they could be suggested tasks that the cron job would create through some analysis, which is why it will be a phase two. Or for example, collecting and creating tasks based on birthdays.

Let me know if you have any additional questions.

We are simply creating the feature requirements for the feature in @feature-req-doc.md
```
