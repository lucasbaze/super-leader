# Enhanced Power Connector Completeness Metric Prompt (Revised for Current Schema)

I'll adapt the framework to work with your current schema while maintaining the core Power Connector methodology.

## System Prompt

```
You are a Power Connector Relationship Analyst that specializes in evaluating relationship completeness based on Judy Robinett's methodology.

Your task is to analyze available information about a person and:
1. Calculate a precise completeness score (0-100)
2. Identify 2-3 key highlights about the person
3. Organize available information into relevant sections
4. Provide targeted relationship-building suggestions

## COMPLETENESS DIMENSIONS (INTERNAL SCORING)
Calculate the completeness score based on these 10 key dimensions:

1. PERSONAL FOUNDATION: Family, background, locations, important dates (0-10 points)
2. PROFESSIONAL PROFILE: Role, career history, accomplishments, strengths (0-10 points)
3. VALUES & CHARACTER: Core principles, evidence of integrity, how they treat others (0-10 points)
4. PASSIONS & INTERESTS: Non-professional activities, causes, curiosities (0-10 points)
5. GOALS & ASPIRATIONS: Short/long-term objectives, vision, obstacles (0-10 points)
6. RESOURCES & VALUE: Skills, expertise, decision authority, unique value (0-10 points)
7. ECOSYSTEM POSITIONING: Key ecosystems, influence level, organizations (0-10 points)
8. NETWORK CONNECTIONS: Key people they know, how you were introduced (0-10 points)
9. RELATIONSHIP HISTORY: Interaction patterns, value exchanged, communication style (0-10 points)
10. CURRENT NEEDS: Active challenges, resources sought, opportunities (0-10 points)

The overall score is the sum of all dimension scores, creating a 0-100 scale.

## SECTION ORGANIZATION
Organize information into these section groups (use only what has sufficient information):

1. PERSONAL INFORMATION GROUP
   - Sections might include: "Background", "Family", "Personal Interests"
   - Suggestion: Focus on personal connection opportunities

2. PROFESSIONAL INFORMATION GROUP
   - Sections might include: "Career Journey", "Expertise", "Professional Achievements"
   - Suggestion: Focus on professional collaboration opportunities

3. RELATIONSHIP INFORMATION GROUP
   - Sections might include: "Interaction History", "Communication Style", "Shared Connections"
   - Suggestion: Focus on relationship development tactics

4. STRATEGIC VALUE GROUP
   - Sections might include: "Ecosystem Access", "Resources", "Potential Value Exchange"
   - Suggestion: Focus on strategic connection opportunities

## SECTION ICONS
Use these icons for sections:
- Background: 👤
- Family: 👨‍👩‍👧‍👦
- Personal Interests: ⭐
- Career Journey: 📈
- Expertise: 🧠
- Professional Achievements: 🏆
- Interaction History: 🤝
- Communication Style: 💬
- Shared Connections: 🔄
- Ecosystem Access: 🌐
- Resources: 💼
- Potential Value Exchange: ⚖️
- Current Needs: 🎯
- Goals: 🚀
- Values: 💎

## FORMAT REQUIREMENTS
1. Keep all content concise and specific
2. Use markdown formatting in all content fields
3. Format suggestions to be actionable and specific
4. Include the reason for each suggestion
5. Structure response exactly according to the required schema

Be extremely focused and return only the exact schema requested.
```

## User Prompt

```
I need to analyze the completeness of my relationship with {{person.first_name}} {{person.last_name}}.

PERSON CONTEXT:
- Power Circle: {{powerCircle}} (Top 5, Key 50, or Vital 100)
- Relationship Duration: {{relationshipDuration}} (New, Established, Long-term)
- Interaction Frequency: {{interactionFrequency}} (Weekly, Monthly, Quarterly+)

AVAILABLE INFORMATION:

Basic Information:
- Name: {{person.first_name}} {{person.last_name}}
- Birthday: {{person.birthday || 'Unknown'}}
- Address: {{primaryAddress ? primaryAddressString : 'Unknown'}}
- Bio: {{person.bio || 'None'}}
- Current Role: {{person.company_role || 'Unknown'}}
- Company: {{person.company || 'Unknown'}}
- Email: {{primaryEmail ? primaryEmail.value : 'Unknown'}}
- Phone: {{primaryPhone ? primaryPhone.value : 'Unknown'}}
- Groups: {{groups.map(g => g.name).join(', ')}}

Previous AI Summary:
{{person.ai_summary || 'No additional information available'}}

Recent Interactions:
{{interactions.slice(0, 10).map(i => `- ${new Date(i.created_at).toLocaleDateString()}: ${i.type} - ${i.note}`).join('\n')}}

Generate a comprehensive summary using the Power Connector framework to evaluate the completeness of this relationship.
```

## Output Example (Based on Your Schema)

```json
{
  "completeness": 65,
  "highlights": "Tech entrepreneur focused on AI accessibility. Has critical connections in the VC ecosystem. Currently seeking Series B funding for expansion.",
  "groupedSections": [
    {
      "sections": [
        {
          "title": "Background",
          "icon": "👤",
          "content": "**Michael Zhang** is from San Francisco, with a background in computer science. He previously worked at Google before founding his current startup three years ago."
        },
        {
          "title": "Family",
          "icon": "👨‍👩‍👧‍👦",
          "content": "Married to **Sarah** with two children. Family is originally from Beijing, with parents still living there."
        }
      ],
      "suggestion": {
        "content": "**Ask about his recent family visit to Beijing** mentioned in your March interaction.",
        "reason": "Following up on personal details shows you value him beyond professional utility and strengthens your position in his Top 50."
      }
    },
    {
      "sections": [
        {
          "title": "Career Journey",
          "icon": "📈",
          "content": "Founded **AccessAI** in 2020 after 5 years at Google. Has grown the company from 3 to 45 employees and raised a $7M Series A in 2022."
        },
        {
          "title": "Expertise",
          "icon": "🧠",
          "content": "Specializes in making AI systems more accessible to non-technical users. Strong technical background combined with product vision."
        }
      ],
      "suggestion": {
        "content": "**Connect Michael with Jennifer from your Key 50** who specializes in UI/UX for technical products.",
        "reason": "Michael mentioned UX challenges in your last interaction, and this connection could provide value while strengthening your position as a connector."
      }
    },
    {
      "sections": [
        {
          "title": "Ecosystem Access",
          "icon": "🌐",
          "content": "Well-connected in the **San Francisco tech ecosystem** and has relationships with several key VCs including Andreessen Horowitz and Sequoia."
        },
        {
          "title": "Current Needs",
          "icon": "🎯",
          "content": "Currently preparing for **Series B funding round** and looking to expand marketing team. Also mentioned interest in entering European markets."
        }
      ],
      "suggestion": {
        "content": "**Offer to introduce Michael to your contact at TechStars London** who could provide insights on UK/EU market entry.",
        "reason": "This addresses his strategic need for European expansion while leveraging your unique network value in a different ecosystem."
      }
    }
  ]
}
```

## Implementation Notes

1. **Power Connector Integration**:

   - The completeness score is now calculated internally using the 10 Power Connector dimensions
   - Information is organized into section groups that reflect these dimensions
   - Suggestions include specific follow-up questions from the framework

2. **Data Mapping**:

   - Add `powerCircle`, `relationshipDuration`, and `interactionFrequency` as context
   - The system will adjust score expectations based on power circle (higher expectations for Top 5)
   - Suggestions are tailored based on relationship context

3. **Process Optimization**:

   - The prompt efficiently analyzes available information without requiring massive restructuring
   - Section groups are created only for dimensions with sufficient information
   - Icons provide visual cues that enhance the user experience

4. **Token Efficiency**:
   - System prompt defines the methodology without requiring verbose responses
   - Output remains concise while providing actionable insights
   - Only includes sections where you have meaningful information

This approach gives you the Power Connector completeness methodology while maintaining compatibility with your existing schema structure. The LLM will analyze relationship quality through the 10 dimensions framework but present information in your current UI-friendly format.
