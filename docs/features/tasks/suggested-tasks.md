We have 2 steps here:

1. Determine if we should create any tasks at all
2. If we should, determine which tasks / type of tasks and when to assign them.

Examples:

- Birthday tasks ( Should be generated like 30 days in advance )

- "time to follow up" tasks ( Should be generated 2 - 3 days in advance )

So at the moment we have at least

1. Actions that need to be taken today
2. People that are being met with today
3. People you need to respond to today ( emails, messages, etc... ) ( This is dependent on the priority / type of the relationship)

ACtivity Diagram:

1. Click the button: "Generate Tasks for today"
2. System fetches people in priority order

- 1. Birthday Today
- 2. People you are meeting with today.
- 3. People you need to respond to today.
- 4. People that you should follow up with. ( This will be a sub-system )

3.  After system fetches the people ( max say 5 people ( this will be dynamic ) )

- 1. System fetches the person's summary / interactions
- 2. System dynamically generates a task for each person based on the information available / reason for the task.

So when we dynamically create a task we need to know the the person & "why".

The "why" is passed to the AI in order to generate the task's suggested content / action / content etc...

Reason 1: General follow up

1. Determining if there was a past event that you should follow up on.

   - Recent event / meeting / phone call / email / that suggested a follow up or action.
   - The person went on a trip and you want to ask how it went.
   - The person recently got a new job, hobby, pet, etc... and you want to ask if they are liking it.
   - The person recently was ill and you want to ask how they are feeling.
   - Generally you're looking for conversation starters based on past interactions.
     Follow up examples:
   - For example if it was a new pet you could ask for a picture.

2. Generating a piece of content based on the past event or new job / hobby / pet etc...
   - For example if they're about to go on a trip you could find some recommendations or events
3. If there isn't something clear / specific to follow up with the person, then we can simply find a piece of content that could be shared

Edge cases:

- What about multiple tasks for the same person?
