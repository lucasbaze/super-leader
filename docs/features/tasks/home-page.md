Possible options:

- Add a "completed" tasks tab
- Add pagination to the "all tasks" tab

- Update the "today" tab to only show tasks that are due today

- Update the "Today" tab to actually be "this week" and add a "this month" tab

- Update the "Today" tab to show tasks grouped by the day for the current week

- For "This month" the tasks should be grouped by week

- Do we have an "inbox zero" feature / state?

- What do we show if there are no tasks for the current week?

- Is there a "streak" feature for getting to "inbox zero"?

- Do we keep track of how many tasks we've completed today?

#Notes

- If I've completed or skipped a task, I might want to see what the contents of the task actually was.

# Bugs

- Completing a task that is in the future, does not show in the "today" tab, but does show in the acitivty header as a completed task for today. The task-group is grouping the tasks by the day, so the future tasks, even though completed are not included. This would need to get filtered on the server side.
