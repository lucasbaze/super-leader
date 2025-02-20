# Agent Building

## Devleper Thoughts

As I'm writing out these prompts, I'm realizing that the API may need to be much for flexible.

Thoughts as I write prompts:

- Allow the search to accept an ID as an input, in case the system wants to get more "context" about the person. Wait... getPerson can do this, so maybe I don't need this?

Tasks

- search for a person... and display that the tool call is pending...
  Okay... do I make 2 tool calls? Or is this handled in 1 tool call?

- Create a person and add them to a group

1a. Check if the person already exists
1b. Create a new person

2a. Check if the group already exists
2b. Create a new group

3. Add the person to the group

v0 and the other app did a stream of an object with a the message about what it was going to do, then did it, then streamed the results and allow for a stream partial display of the results.

What I'm expecting is:

1. Write the message
2. AI displays the message about what it's going to do
3. AI does it and shows a "loading" state as the toolCall is happening... additional tool calls cannot be processed until the previous tool call is complete. (requirement)
4. AI takes the actions and displays the results as they happen / come in?

Approach #1:

## Technical Issues

- I need to be able to pass the userID around, but need to also make sure that my API calls aren't being exposed in a way that is vulnerable to attacks. I'm thinking I'll need to check for the authResult OR a valid JWT token coming from the server to server communication.
- Could just simple re-call the service method in the tool handler? Or should I handle these differently?
