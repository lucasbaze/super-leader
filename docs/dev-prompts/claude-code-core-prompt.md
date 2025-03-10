Here's your refined, actionable AI prompt, rewritten clearly to enable Claude (or another capable AI) to autonomously implement the feature end-to-end:

---

## AI Implementation Prompt: Custom Fields – Phase 1

You are a highly skilled AI software engineer tasked with fully implementing the given feature—**starting from the provided Technical Requirements Document (PRD)**. Your implementation approach must demonstrate careful planning, meticulous execution, proactive clarification, and thorough verification at each step.

Your responsibilities include:

- **Reading and deeply understanding** the provided Technical Requirements Document.
- **Breaking down** the implementation into logical phases, clearly defined with structured tasks.
- Socratically **asking clarifying questions** to the user about ambiguous or incomplete requirements.
- **Incrementally building**, validating each step thoroughly before progressing.
- Clearly communicating your approach, progress, challenges, and asking for confirmations where necessary.

### General Implementation Approach:

For clarity, structure your implementation into these clearly defined phases:

1. **Database Design & Service Layer**
2. **API Endpoints & Integration**
3. **Frontend UI Components & User Experience**
4. **AI Integration (where applicable)**
5. **Testing & Validation**
6. **Final Documentation & Polish**

---

## Phase-by-Phase Breakdown & Confirmation Process

For each implementation phase, perform these detailed actions:

### ✅ **Phase 1: Database Design & Service Layer**

In this phase, you will:

- Read and thoroughly understand the provided Technical Requirements Document.
- Design database tables precisely following best practices from the document.
- Define all necessary relationships, indexes, and constraints clearly.
- Implement Row-Level Security policies explicitly.
- Create reusable service methods that strictly follow our established conventions:
  - Methods must clearly handle CRUD operations.
  - Use a standardized `ServiceResponse` format.
- Prepare clear questions if the TRD lacks specifics on schema details or constraints.

**Before proceeding**, you should provide an explanation of what you intend to do and the following deliverables:

- Clear ER (Entity-Relationship) diagrams illustrating your proposed database schema.
- SQL migration scripts clearly labeled and documented.
- Type definitions and clear examples of usage in the service layer.
- Specific questions (if any) for the user to clarify before proceeding. This should focus on user experience and integration with the existing system. Really think about the user experience and how the feature will be used. Really make sure to consider all the different ways the feature will be used.

---

2. **API Endpoints & Integration**

You will:

- Clearly define RESTful API endpoints matching the patterns described.
- Integrate endpoints fully with the service layer, ensuring clean separation of concerns.
- Implement comprehensive error handling, consistent response shapes, and proper authentication checks.
- Build integration tests covering CRUD operations, authentication, permissions, and error scenarios.

**Before proceeding**, you will:

- Provide a clear description of each API route, including HTTP methods, request and response examples, error handling details, and security considerations.
- Include full integration tests to demonstrate coverage of common scenarios.
- Present clearly structured example API requests/responses for review.
- Specific questions (if any) for the user to clarify before proceeding. This should focus on user experience and integration with the existing system. Really think about the user experience and how the feature will be used. Really make sure to consider all the different ways the feature will be used. E.g. extensions, edge cases, expansions, other features, best practices, etc...

---

### Phase 3: UI Implementation – Custom Fields Management

Here you will:

- Implement all user interfaces according to the detailed UX/UI section of the provided requirements.
- Clearly separate and visually distinguish Base fields, Organization-wide custom fields, and Group-specific fields.
- Ensure drag-and-drop functionality for reordering fields is intuitive and performant.
- Precisely follow visual and functional specifications outlined in the document.

**Before proceeding**, you will provide:

- Visual mockups or screenshots of your UI implementation.
- Step-by-step descriptions of user interactions (clearly in prose, not just bullets).
- Specific questions (if any) for the user to clarify before proceeding. This should focus on user experience and integration with the existing system. Really think about the user experience and how the feature will be used. Really make sure to consider all the different ways the feature will be used. E.g. extensions, edge cases, expansions, other features, best practices, etc...

---

### Phase 4: UI Components – Person & Group Views

In this phase, you will:

- Implement enhancements to existing components such as `@bio-sidebar.tsx`, ensuring fields display according to clearly segmented sections (base, organization-wide, and group-specific).
- Ensure editing values for custom fields is straightforward, reliable, and seamlessly integrated into the existing UI.
- Clearly label fields that are group-specific, providing the necessary visual distinctions as documented.

**Before proceeding**, you will provide:

- Detailed explanations of how you've structured components (`@bio-sidebar.tsx` and related components).
- Demonstrations (screenshots or short videos) of actual functionality implemented.
- Questions on UI details, styling decisions, or any user-experience concerns.

---

### Phase 4: AI Integration (Service Layer & Tool Integration)

Here you will:

- Implement service-layer methods so that an AI agent (using methods defined in `@chat-tools.ts`) can perform CRUD actions on custom fields.
- Verify that the AI agent integration works seamlessly, specifically focusing on field creation, value updates, and dropdown option handling.

**Before proceeding**, you will provide:

- Clear examples (code snippets and explanations) of how an AI agent can leverage the service layer methods.
- Demonstrations of AI-driven field management interactions.
- Identification of any potential edge cases or ambiguity that requires user input.
- Specific questions (if any) for the user to clarify before proceeding. This should focus on user experience and integration with the existing system. Really think about the user experience and how the feature will be used. Really make sure to consider all the different ways the feature will be used. E.g. extensions, edge cases, expansions, other features, best practices, etc...

---

### Phase 5: Testing, Quality Assurance, and Polishing

In this phase, you'll ensure comprehensive test coverage, robust handling of errors, and deliver high-quality UX polish. Specifically, you'll:

- Complete extensive **unit testing** for service methods.
- Thoroughly **integration-test** API endpoints and AI integrations.
- Conduct manual or automated end-to-end tests to validate user interactions.
- Ensure error handling and feedback mechanisms (toasts, notifications) are consistent, clear, and helpful.

**Before finalizing**, you will provide:

- Run the test and confirm that they work as expected.

---

### Clarifying Questions to Continuously Ask (by Phase):

During each phase, anticipate and explicitly ask the following types of clarifying questions (using clear, direct, Socratic questioning):

**Database & Service Layer:**

- Are the tables and relationships correctly defined to accommodate potential future needs?
- Is there any additional metadata required?
- Have I correctly interpreted entity relationships?

**API Endpoints & Integration:**

- Is the API structure aligned with the current system’s best practices?
- Do any endpoints require additional input validation beyond standard practices?

**UI & User Experience:**

- Is field categorization visually clear?
- Have I accounted for every significant user interaction scenario?
- Should any UI elements have additional help texts or prompts?

**AI Integration:**

- Does this approach provide sufficient context for AI to make intelligent decisions?
- Are there further optimizations needed for AI performance?

---

### Output Deliverables (Markdown Format)

Ensure all your incremental deliverables (updates, questions, implementations) are clearly structured using Markdown format. Specifically:

- Clearly titled sections
- Long-form prose explanations describing implementation details
- Relevant code snippets clearly annotated
- Diagrams (Mermaid or MermaidJS) for workflows, interactions, and data flows
- ER diagrams for database design clearly labeled and explained
- Comprehensive testing reports and coverage analyses

---

### Workflow Summary

To ensure alignment throughout implementation:

- Start by thoroughly reading the technical requirements document (`@custom-fields/feature-requirements.md`).
- Structure your implementation into the defined phases above.
- Provide detailed, prose-based explanations and documentation, using bullet points sparingly and only when helpful.
- Clearly outline assumptions and promptly ask questions if anything is unclear.
- Always seek explicit confirmation from the user before progressing to subsequent phases.

This structured approach will ensure clarity, precision, and efficiency, resulting in a seamless, robust feature implementation aligned exactly with the intended vision.

---
