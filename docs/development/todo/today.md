### Feb 22nd

- [x] ~~_Built out summary mechanism for an individual person._~~ [2025-02-22]
- [ ] Add a mechanism to allow the user to navigate away and get "notified" that it completed. Internally poll the status of the summary.
      null = never started, in-progress, completed, error ( i.e. timeout? )
      Should fall back to completed if it's not in progress. Client should "timeout" after ~ 10 minutes of polling every 5 seconds... probably?
- [ ] Try to use the "o1-mini" model to see if it's any better at summarizing.
- [ ] Update the prompt to get "good enough" for now.
- [ ] Somehow display the "completeness" metric to the user.
- [ ] Summarize in the "network" view.
- [ ] Add tests to the summary service.
- [ ] Can I build a CRON job that runs every 24 hours and updates all the summaries (or just the ones that haven't been updated in a while)?
- [ ] Should start by testing if there are any timeout issues on production as is... Should make sure the current model and implementation will work in prod.
      (Need to make new migration)

### Feb 21st

- [ ] Clear chat messages for mental "clarity"
- [ ] Add "stop" method to the input to stop chat messages
- [ ] Add an 'update' person option. Particularly for adding Birthdays.

### Feb 20th

- [x] ~~_Attempt to create "agentic" behavior for the AI to respond to the user. Adding more functionality to the AI. Let's expect this to take a week to really get the ball rolling and feel good with it._~~ [2025-02-25]

Plan: Review multiple tool calls, add "search" functionality, so if I can get it to display pending results in the chat...

### Feb 19th

- [x] ~~_Add default chat messages to each of the chats if there aren't any historical messages._~~ [2025-02-19]
- [x] ~~_Get the simple search to work to quickly navigate to a person. (maybe make this a command palette instead of a search bar?)_~~ [2025-02-19]

### Feb 18th

### Feb 17th

### Feb 16th

- [x] ~~_Fix re-load of the group when people are added to it._~~ [2025-02-16]
- [x] ~~_Add a header to the Home, People, and Groups pages._~~ [2025-02-19]
- [x] ~~_Remove the notifications view_~~ [2025-02-19]
- [x] ~~_Attempt the first stab at the home page for suggested "actions" for the day._~~ [2025-02-19]

There are MANY thing to consider on the home page that I need to consider / think through... First attempt was good to get a basic structure in place..

### Feb 15th

- [x] ~~_Create local types for the chat messages_~~ [2025-02-15]
- [x] ~~_Fix any issues with tests, i.e. groups that I've changed._~~ [2025-02-15]
- [x] ~~_Get production up with my current people_~~ [2025-02-20]
      This will require a re-look at the import structure.

### Feb 14th

- [x] ~~_Fix the issue with chat messages loading & saving_~~ [2025-02-15]
- [x] ~~_Fix the issue with chat messages "scrolling"_~~ [2025-02-15] This is fixed, but still lacking in the full expression of the experience.
- [x] ~~_Fix issue with infinite scroll fetching too many times in the beginning_~~ [2025-02-15]
- [x] ~~_Fix issue with navigating to a new chat from 1 to another and loading messages_~~ [2025-02-15]

## From Production Usage

- [ ] Breadcrumbs need to properly navigate back to the previous page.
- [ ] Show loading indicators on save of the address information about a person.
- [ ] There's a "comma" issue in the copy / pasting of the phones numbers.
- [ ] Successfully adding a person to the system doesn't link to the right profile.
- [ ] Really want this message to coordinate and "work" ("Add Anthony D as a new person the the Strategic 100 group. Make a note that we met through Johnny Ives. We texted a few weeks ago, and he's a huge NBA fan and actually runs the nba.com home page)
- Need to be able to update the name of people / profile's
- [ ] Need to save the gravatar color scheme for the user, so that it doesn't re-render all of the time.

This single action needs to do several things:

- Check to see if Anthony D already exists
- Create the person with a note
- Create an association between the two folks so we know how they're related (colleagues)
- Display to the user "What's happening" in the thread of actions, because sometimes it may take a few moments to process the request.
- Find the strategic 100 group and add the person to it.

This also needs to

- Allow the user to edit the contents from the auto-generated messages / actions

Another situation

- Create a new group for BCS and one for Realtors, then add Wendy Flynn to both of them.
