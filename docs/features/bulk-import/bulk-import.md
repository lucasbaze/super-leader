## Bulk Import Thoughts

- From Attio, should I just define my own groups to begin with?
- Should I build the "custom field" functionality? Then groups -> map to a custom field & we save as a label on the record
- If I don't, what do I do with the group? I could flatten as a string and add to the bio? Or as a separate note?
- This could force me to think about the "opinionated" fields about the person.
  - i.e. "role" (Mentor, Friend, Banker), "Context" (Business, Personal, Golf, Church) "sphere", "value prop", "closeness" ( See Judy ), See page 96.
- What do I do if I want to use this again?
  - Do I need to save this file to the database as an "import" record? Probably... would need to learn more about the data saving functionality.

### Dependency

- [ ] We'll need to create a background job to handle updating the summary of each person that is added...

Do we create a summary for each person when they're added? After they're added to a group? If we need to kick off a background job, we'll ideally want an event based system to trigger the job.
