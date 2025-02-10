# Project Todo List

## Phase 1

- [x] ~~_Handle new user setup via the server and not via the database & undo the migration_~~ [2025-02-09]
- [x] ~~_Add postal_code to the address schema._~~ [2025-02-09]

### Suggestions

- [ ] Need to add suggestion saving mechanism, fetch, and prompt building depending on previous suggestions
- [ ] Need to add service tests to ensure responses are consistent and of high quality.
- [ ] Need to handle better error handling around AI suggestions & structured output response creation.
- [ ] Need to add a footnote that some links may be dead links, or repetitive.

### Metrics

- [ ] Summarization of each person
- [ ] Summarization of the "network" for individual quality

### Clean up

- [ ] Automatically update the test database on push with new migrations
- [ ] Type the API and useHooks so that the json response is typed.
- [ ] Clean up test data properly after running tests. The rollback mechanism is not working as expected.
- [ ] Need to add a fallback page for 404 such as when I navigate to /app/inner-5 which doesn't exist
- [ ] Central links on the client side, so that we don't have `/app/person` just laying around.
- [ ] Clean up the types that have been created. They're laying in different places. Particularly true in the test files.
- [ ] Standardize the name of tables to singular or plural. Currently it's a mix with groups & group.
- [ ] ISSUE: Currently set the RLS policy to allow anyone to access people records so that the API can access people for createSuggestions & createMessageSuggestions. This is a security risk, but not sure if it's a big deal.
- [ ] Update names of Activity & Interactions to be more consistent.
- [ ] Remove database functions to handle update person details that are no longer being used.

### Bugs

- [ ] The Bio doesn't update properly in the bio sidebar section
- [ ] Flash on changing theme from light to dark
- [ ] Flash on layout from SSR if the resize panels have been moved.

# New Features

- [x] ~~_Create import service & tests_~~ [2025-02-10]
- [x] ~~_Create import people & notes scripts_~~ [2025-02-10]
- [x] ~~_Test import with my contacts from Attio_~~ [2025-02-10]

This will be done as a script that I run locally. Just need to figure out the best way to do this.

- [ ] Export data from the database

This may be client side, could be a script that I run from admin, could be server side as an endpoint. This could take a while to run so I may need to also run it as a background job possibly. Also, as I add additional database tables, I'll want this method to automatically handle these new tables so that I don't have to manually add them to the export every time I add a new table.

- [ ] Remove people from groups

I'm gonna need a much better table component in order to select people & display and view the people in the list view.

- [ ] Mobile accessibility

How is the app going to look on mobile?

- [ ] Audio transcription to text to create notes on the fly

// https://github.com/chengsokdara/use-whisper

- [ ] Save content suggestions for later for other people
