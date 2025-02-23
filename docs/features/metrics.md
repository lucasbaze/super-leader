# Metrics

## Profile Completeness

- This metric is measuring the completeness of a single person's "profile".

### Inputs

- The birthday, contact-methods, addressses, etc...
- The "completness" of the the following dimensions / key questions below
- The previous ai_summary
- The most recent 10-20 interactions? ( add an "enhanced" interaction summary)

### Outputs

- A single score between 0 and 100.
- A summary of the person's profile across each category.

- Looking at the image, the data structure probably looks something like:

```
isProcessing
data: {
"completeness": number,
"highlights": markdown string
"sections": [
    {
      title: the name of the section ( keep it concise )
      icon: emoji or character that expresses the section
      content: markdown string,
      forYou: markdown of "insights" that could be useful to you as the user about the person. i.e. what you are trying to accomplish combined with what the system knows about them. Shoot.. even how you feel toward them. (friendly, wary etc... could be insightful to the system. )
    }
  ]
},
"suggestions": [
  {
    content: markdown string,
    reason: markdown string
  }
]
```

I want to hanve the "info" returned as markdown, so that I can more easily parse it?
Give the AI more leeway interms of the structure of the information. (Also, gives me more incentize for further personalization of the output format. )

### Updates

- On adding a new interaction, should we automatically update the profile completeness?
  ( I could do a small model first that determines if there should be an update, then it's triggered, otherwise the user needs to request it. I mean frankly, the AI could do this in the useChat right now probably... "Is the information worthy of being updated?" This might be tricky for a small model to get right on the fly... especially if doing it for every message? )

- Could refresh 1x per day?

- For updating, could simply grab every person with an interaction that happened that day, and the AI summary, and any reminders, and determine if there is anything worthy of being updated... This could get tricky as well...
- For updating, we'll start with just grabbing any people that have had interactions. Use a small model to determine if an update is needed, then run the bigger 01 model. I think we need o1 to do this because if I drop a massive note or a lot of notes, or upload a lot of images, the smaller model won't be able to handle it.

### Prompt Thoughts

- Should mention format & preferred style: bullet points, longer prose, etc...
- The number of sections and the content should only be as complex as the infomration available. If no information is available, then the output will be minimal. The amount that is returned should be suggestive of further action, value adds, and specific to the person and the user's relationship. If there's a lot of information, then feel free to be a little bit more verbose or thorough with the sections and information. Suggestions should still prompt further action, but should be high quality and more personalized.
- Make sure to highlight the AI parts of the For You section.
- Completeness should be a single number between 0 and 100.
- The sections should be in order of importance to the user.
- 0 - 25 is poor, 26 - 49 is okay, 50 - 79 is good, 80 - 100 is great.
- Scores of 0 - 25 have little no information or have unhelpful information
- Scores of 26 - 49 have more information, but still lots of room for getting to know the person on a deeper level.
- Score of 50 - 79 are pretty good. A lot of questions have information and the two people clearly know each other, but there is still another layer missing
- Scores of 80 - 100 are great. You know a ton about this person and clearly spent time with this person listening and learning about them as a person.

- Provide it examples:

```example-1.md
## Background Summary (title)
(content)
### Professional

CEO & Founder at AI Ventures Previously led product at Google (5 years) Angel investor in 10+ startups

### Education

MS in Computer Science from Stanford BS in Mathematics from MIT

### Achievements

Forbes 30 Under 30 (2022) 3 successful exits Published author on AI Ethics

### Personal

Married, 2 children Avid runner and chess player Volunteers at local STEM programs

(forYou) intentionally left blank
```

```example-2.md
## Professional Background (title)
(content)
Founder and CEO of NeuraTech, a leading AI research company focusing on ethical AI development.

Previously: Lead AI Researcher at Google Brain (5 years), Postdoctoral Fellow at MIT (3 years).

**Key Strengths:** (forYou)

- Pioneering research in neural network architectures
- Strong leadership and team management skills
- Excellent public speaker and thought leader in AI ethics

**Current Focus & Interests** (title)
(content)
Leading NeuraTech's efforts in developing ethical AI frameworks for industry-wide adoption.

**Areas of Interest:** (forYou)

- Explainable AI and transparency in machine learning models
- AI's impact on future workforce and job market
- Quantum computing applications in AI
```

#### Technical Thoughts

- This probably going to need to use o1 to process.
- Therefore need a background job handler that can allow the user to "move on".
- We will need to queue the jobs in the frontend and track them on the client side.
- No... we can instead hand back a single record that has a "isProcessing" flag, when the job starts and then then finishes. The client can just "poll" for the record until it's finished.

#### Summary

If you're creating a **dossier** on an individual, it should be structured in a way that provides both **high-level insights** and **granular details** for strategic relationship management. Below is an expanded **categorization system** that integrates **personal, professional, social, and psychological** dimensions.

---

### **Comprehensive Individual Dossier Categories**

#### **1. Relationship Context & History**

- Who introduced us? How did we meet?
- What is the relationship stage? (New, casual, or close relationship)
- How often do we interact? What is the nature of our interactions?
- Are there any key events that shaped our relationship? (E.g., major deals, shared experiences)
- What mutual connections or groups are we both part of?
- How do they perceive our relationship? (Transactional, friendly, mentorship, etc.)
- Have they referred me to others or vice versa?

#### **2. Personal Background**

- Full name, nicknames, and preferred way of being addressed
- Date of birth, age, zodiac sign (if relevant)
- Ethnicity, cultural background, or heritage
- Family history & structure (Parents, siblings, spouse, children)
- Personal values & moral compass
- Political leanings (if relevant for relationship-building)
- Religious beliefs or spiritual practices
- Hobbies, interests, and passions
- Key life experiences that shaped their worldview
- Languages spoken
- Personal rituals or routines (e.g., morning habits, meditation, fitness)
- Personal style and aesthetic preferences

#### **3. Professional & Career Insights**

- Current occupation & job title
- Employer / Company (or self-employed status)
- Industry expertise & domain knowledge
- Career trajectory & past roles
- Professional network & influence
- Decision-making style in business
- Key achievements and milestones
- Current work focus & major projects
- Work ethic & leadership style
- Business or financial ambitions (Growth, stability, exits, etc.)
- Work-life balance preferences
- Professional pain points or frustrations
- Personal brand & public persona (Social media, speaking engagements, interviews)

#### **4. Social & Network Influence**

- Key people in their network (Who they trust, listen to, or work with)
- Organizations, communities, or clubs they are part of
- Alumni networks or past affiliations (School, military, corporate)
- Level of social influence (e.g., introvert vs. extrovert, public speaker, influencer)
- Social circles they navigate in (Tech, finance, philanthropy, etc.)
- Relationship with wealth and status (Egalitarian, elitist, philanthropic)
- How they introduce new people to their network
- Their preferred level of exclusivity in social interactions

#### **5. Communication & Interaction Style**

- Preferred communication method (Text, call, email, in-person, voice notes, etc.)
- Response time & communication speed
- Direct or indirect communicator?
- Frequency of follow-ups needed
- Preferred conversation topics
- Sense of humor & conversational tone (Serious, playful, sarcastic, intellectual)
- Body language cues & non-verbal tells
- Digital etiquette (How they interact online, their email style, social media use)
- Public speaking ability & comfort in presentations
- Conflict resolution style (Avoidant, confrontational, diplomatic, problem-solver)

#### **6. Financial & Business Philosophy**

- Wealth mindset (Abundance vs. scarcity)
- Investment preferences (Real estate, Bitcoin, stocks, startups, art, philanthropy)
- Spending habits (Frugal, extravagant, balanced)
- Risk tolerance in financial decisions
- Views on money, success, and wealth-building
- Charitable giving preferences (Causes they support, donation habits)
- Business deal-making style (Aggressive, strategic, collaborative)
- Trust level in financial institutions and systems

#### **7. Psychological Profile & Behavioral Insights**

- Core motivations & driving forces
- How they handle stress & pressure
- Emotional intelligence level
- Adaptability & openness to change
- Decision-making process (Gut-driven, data-driven, influenced by others)
- Cognitive biases they exhibit (Optimism bias, loss aversion, overconfidence, etc.)
- How they perceive power and influence
- Relationship with authority (Respectful, skeptical, anti-establishment)
- Learning style (Visual, auditory, kinesthetic, experimental)
- How they respond to praise vs. criticism
- Key fears or anxieties that impact decisions

#### **8. Lifestyle & Personal Preferences**

- Diet & food preferences (Vegetarian, keto, adventurous eater, picky eater)
- Fitness & health habits
- Travel preferences (Luxury, budget, adventure, routine destinations)
- Favorite vacation spots & dream destinations
- Music, books, and entertainment preferences
- Style & fashion preferences (Minimalist, extravagant, casual, classic)
- Favorite brands & product preferences
- Ideal environment for deep thinking or relaxation
- How they celebrate milestones (Birthdays, anniversaries, achievements)
- Preferences for gifts (Material, experiential, sentimental, practical)
- Bucket list experiences or aspirations

#### **9. Pain Points, Challenges & Frustrations**

- What obstacles or difficulties are they currently facing?
- What recurring problems do they mention?
- What skills, resources, or people could help solve their challenges?
- How do they typically approach problem-solving?
- Have they expressed concerns about health, work, finances, or relationships?
- Do they have a history of overcoming significant adversity?

#### **10. Future Outlook & Goals**

- Short-term goals (Next 6-12 months)
- Long-term vision (5-10 years)
- Personal & professional aspirations
- Life philosophy & ultimate purpose
- What would make them feel fulfilled?
- Legacy they want to leave behind
- Are they actively taking steps toward their future vision?
- Who or what inspires them?

#### **11. Influence & Power Dynamics**

- Who do they trust most for advice?
- What role do they play in their industry (Maverick, innovator, leader, follower)?
- Who do they view as competition or adversaries?
- Are they more of a connector or a gatekeeper?
- How do they exert influence (Direct action, subtle persuasion, storytelling, data)?
- Do they enjoy being in the spotlight or working behind the scenes?
- How comfortable are they with authority and leadership?
- Do they seek validation from external sources, or are they internally driven?

#### **12. Legacy & Personal Impact**

- What kind of impact do they want to have on their community or industry?
- Are they involved in philanthropy or social causes?
- What principles guide their life decisions?
- What lessons do they want to pass on to the next generation?
- How do they want to be remembered?

---

### **How to Use This Dossier Structure**

- This structure allows you to **quickly assess** key aspects of an individual, whether for **business, friendship, or networking**.
- You can prioritize **what to track and update** depending on your goals with the relationship.
- It enables **customized interactions** based on a person’s values, communication style, and preferences.
- It helps in **strategic decision-making** when navigating professional or personal relationships.

Would you like me to refine this further based on a specific **use case** (e.g., business deals, social networking, hiring, fundraising)?
