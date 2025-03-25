Send Message Type

Task Triggers:

- birthday-reminder
- pre-set-reminder
- follow-up
- context-gather
- pre-meeting
- post-meeting
- life-event
- opportunity
- social-change
- external-news

Action Types:

- send-message
- share-content
- add-note
- buy-gift
- make-intro
- plan-event
- schedule-meeting
- attend-event
- mail-letter

```js
{
  id: <uuid>,
  person: {
    first_name: 'Alana',
    last_name: 'Smith',
    avatar: 'https://i.pravatar.cc/150?u=alana-smith',
  },
  task-trigger: birthday-reminder
  context: It’s Alana’s birthday today
  suggested-action: Send a message

  action-type: send-message
  actionBody: {
    messageVariants: [{
      tone: ‘Professional’,
      message: ‘Hello...’
    }, {
      tone: ‘Casual’,
      message: ‘Hey...’
    }, {
      tone: ‘Funny’,
      message: ‘Hey...’
    }]
  }
}
```

```js
{
  person: {
    first_name: Michael
    last_name: Bashour
    avatar: https://i.pravatar.cc/150?u=michael-bashour
  },
  task-trigger: hard-reminder
  context: You requested to be notified about Michael’s recent trip
  suggested-action: Share an interesting article about the Himalaya’s in reference to his upcoming trip.

  action-type: share-content
  actionBody: {
    contentVariants: [{
      suggestedContent: {
        title: 'The Himalayas',
        description: 'The Himalayas are a mountain range in Asia. They are the highest mountain range in the world.',
        url: 'https://en.wikipedia.org/wiki/Himalayas'
      },
      messageVariants: [{
        tone: ‘Professional’,
        message: ‘Hello...’
      }, {
        tone: ‘Casual’,
        message: ‘Hey...’
      }]
    }, {
      suggestedContent: {
        title: 'The Himalayas',
        description: 'The Himalayas are a mountain range in Asia. They are the highest mountain range in the world.',
        url: 'https://en.wikipedia.org/wiki/Himalayas'
      },
      messageVariants: [{
        tone: ‘Professional’,
        message: ‘Hello...’
      }, {
        tone: ‘Casual’,
        message: ‘Hey...’
      }]
    }]
}
```

```js
{
  person: {
    first_name: Michael
    last_name: Bashour
    avatar: https://i.pravatar.cc/150?u=michael-bashour
  },
  task-type: context-gather
  context: "You recently had a lunch meeting with Michael"
  suggested-action: "Add a note recapping the meeting with any important details"

  action-type: add-note
  actionBody: {
    questionVariants: [{
      type: 'personal',
      question: 'How did it go?'
    }, {
      type: 'professional',
      question: 'What did you discuss?'
    }, {
      type: 'goals',
      question: 'What are your goals for the project?'
    }]
  }
}
```

```js
{
  person: {
    first_name: Michael
    last_name: Bashour
    avatar: https://i.pravatar.cc/150?u=michael-bashour
  },
  task-trigger: context-gather
  context: "Michael is in your central 50 with a low completeness score"
  suggested-action: "Add more details about to Michael's personal profile"

  action-type: add-note
  actionBody: {
    questionVariants: [{
      type: 'personal',
      question: 'How did it go?'
    }, {
      type: 'professional',
      question: 'What did you discuss?'
    }, {
      type: 'goals',
      question: 'What are his goals for his current project?'
    }]
  }
}
```

```js
{
  person: {
    first_name: Rodrigo
    last_name: Silva
    avatar: https://i.pravatar.cc/150?u=rodrigo-silva
  },
  task-trigger: birthday-reminder
  context: " Rodrigo’s birthday is coming up in a few days"
  suggested-action: "I found a few gift ideas you could consider buying."

  action-type: buy-gift
  actionBody: {
    suggestedGifts: [{
       title,
       reason,
       url,
       type: “funny”, “nice”, “experience”
      },
  }]
  }
}
```
