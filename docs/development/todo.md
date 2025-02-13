# Project Todo List

## Phase 1

- [x] ~~_Handle new user setup via the server and not via the database & undo the migration_~~ [2025-02-09]
- [x] ~~_Add postal_code to the address schema._~~ [2025-02-09]

- [ ] Save chat messages in the database

We'll need to save the chats for each person. We could also save chats for "routes" or "flows" of the application such as group-chat, home-chat, etc... That could be overkill...? We should add infinite scroll and load after hitting a certain point.

If there is no history of messages, then we'll load a list of "suggested" actions to take, which will basically be "fill out the person's profile". The AI should "prompt" to fill out the profile and fill out as much as possible.
Question: "How can I "see" the progress of information that I'm filling out about the person... akin to the "profile completeness" score. Could be "overrriden" as well if the person doesn't like the score that's been set.

- [ ] Build the AI summary view of an individual person.

This will be based on the interactions that have been loaded up, messages, events, & notes. We'll show the "summary" of the person across many domains. The question is how much detail to show. And do we segment based on the type of person? Does the AI "suggest" the summary or the components of the summary?

- [ ] Need a CRON job handler for updating the "follow-up" indicator for folks

This will also be used to populate the home page with suggested actions that need to take place.
Hard part will be getting visibility into the queue and the jobs that are being processed.

- [ ] Need a background jobs / queue handler

This will handle updating async activities such as the AI summary. It will tie into the follow-up indicator and process jobs in a queue to determine the follow-up status of each person. Hard part will be getting visibility into the queue and the jobs that are being processed.

- [ ] Build the v1 of the "Home Page"

The home page will be the "actions" oriented page of things to do based on knowledge of the system internally. Events, previous notes, set reminders & follow-ups, email messages follow-up actions, etc...

- Special people that aren't in the 5,50,100: Recently met folks, folks that you have outstanding messages with, could be an introduction or have influence toward your goals (the system may be able to suggest this if we have their linkedin profile or enough information on their position / title).

### Suggestions

- [x] ~~_Need to add suggestion saving mechanism, fetch, and prompt building depending on previous suggestions_~~ [2025-02-11]

- [ ] Note: Before savings generated suggestions, just go ahead and filter out any that are duplicates or invalid.

- [ ] Need to add service tests to ensure responses are consistent and of high quality.
- [ ] Need to handle better error handling around AI suggestions & structured output response creation.
- [ ] Need to add a footnote that some links may be dead links, or repetitive.

- [ ] Update response from the AI to show messages generating prompt & generating response... in the UI.
- [ ] Show saved material in the suggestions tab for the person.

### Gift Suggestions

- [ ] Add a "gift" button that will prompt to get gift suggestions for the person.

We'll add a header

#### Suggestions: Nice to have

- [ ] Show link preview in the suggestion

#### Suggestions Cleanup:

- [ ] Fix the styling on the message suggestion card. Move the "copy" button to the right like the content-suggestion cards

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
- [ ] Move supabase from utils/supabase to lib/supabase

- [ ] Need to figure out a way to consistently handle the timezone of the user. For example displaying the date in the correct timezone coming from the server on the client side.

### UI Improvements

- [ ] Display the "last activity" on the table view of people.

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

- [x] ~~_Save content suggestions for later for other people_~~ [2025-02-11]

Basically this is just marking a suggestion with the bookmarked icon.

- [ ] Add a "save this content" for a particular person. This will be on the AI side of the chat.

This is allowing the user to input a link or file or piece of content and save it for later. This could trigger additional suggestions or just save it for later usage.

- [ ] Get the search bar to work and just be like a dropdown search action.

This will be a quick search for people in the header. The question should then be, does this "negate" the search for people in the chat? Is the search chat a "more sophisticated" search?

- [ ] Save Chat messages to the database.

The reason would be for further AI intelligence in the future. Could also re-load conversations if needed for the user. Can refresh the page and have the same conversation visible. Will "fetch" the messages from the database from previous conversations. Can "start" a new conversation with the same person. Can view previous conversations and load them into the history.

- [ ] Add a "search" method that the AI can call automatically if needed to perform a particular action.

Question: Does the returned ID need to be passed to the next request directly?
