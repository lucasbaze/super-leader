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

## Displaying tool calls

- If a tool is called and it's in a pending state, I want to display these "background" tool calls in the UI.
- They need to be displayed in line of the messages...

- Could I splice them in?
- I could take the message with the tool call and display "above it" the tool pending / loading...
- Once the message "completes" then the

- Displaying all the tool calls back to back could be done between the user messages...

- I need a way to handle failures & retries...

- I need to add a "stop" function...

### Tool Calling Structure

/\*

- Things the a single tool needs to handle / know / do:
  Possible "class" to handle these things:

* Have a name & a display name
* Handle errors
* Handle confirmation ( such as API / method calls )
* Handle cancellation
* Handle retries
* Handle stop
* Know what parameters are included
* Know what methods to call ( i.e. the schema of the inputs ) ( Maybe this comes from the service? Probably needs to come from the service... )
* Define the types of the arguments and return values

* Needs to define the message structure to display: i.e. suggestions vs. messages vs. action

- \*/

- I think when the tool is called, we register the onSuccess callback and then onFinish, we trigger the end result, if it was successful, otherwise we trigger the failures.

- Idea: I could probably do the onSuccess call to the client, buy having references to the messsages, and the tool calls, and then fiure out if the tool call was successful or not from the messages, and then trigger the onSuccess or onFailure.

## Research

- Agentic AI: https://github.com/transitive-bullshit/agentic Lots of cool possible features in here.

## Mar 17th

Thoughts on a new approach in order to enable injecting intitial messages, that also are streamed to the client, and also saved to the database:

- Let's first attempt tool Streaming.
- I want to create a new tool that will getInitialMessage as a tool
- It will then make an AI call to generate a message and stream that result... let's see what happens.

Another idea:

- Use the savedMessages tool to determine if the user has any message.
- If not, then handleSubmit on the client and force the client to create a message. We can "submit a system message"?
