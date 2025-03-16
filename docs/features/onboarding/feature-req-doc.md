# Product Requirements Document: AI-Driven Onboarding Chat Interface

## 1. Feature Purpose

**Problem Statement:**
Users need a personalized and engaging onboarding experience that helps them create their "Share Value Ask" while allowing the system to gather meaningful context about them for better personalization.

**Feature Alignment:**

- Aligns with the product's goal of fostering meaningful connections
- Supports personalized user experience through AI-driven context gathering
- Implements Judy Robinett's "Share Value Ask" methodology

**Urgency & Impact of Non-Implementation:**

- Without proper onboarding, users may not effectively utilize the platform's networking capabilities
- Missing crucial user context would limit AI's ability to provide personalized suggestions
- Reduced user engagement due to lack of guided introduction

**Alternatives Considered:**

- Traditional form-based onboarding
- Video tutorial introduction
- Static questionnaire

## User Stories

**Core User Stories:**

- As a new user, I want to be guided through creating my Share Value Ask so that I can effectively introduce myself to others
- As a user, I want to use voice input to answer questions so that I can engage in a more natural conversation flow
- As a user, I want to receive immediate feedback on my responses so that I can refine my personal narrative
- As a user, I want the AI to understand my background and interests so that it can provide personalized networking suggestions
- As a user, I want to see my Share Value Ask presented visually before finalizing so that I can ensure it accurately represents me
- As a user, I want to receive suggested questions I can ask others so that I can improve my relationship building skills

**Administrative Stories:**

- As a system, I want to track onboarding completion status so that I can direct users to the appropriate interface
- As a system, I want to create user context records during the conversation so that I can provide personalized experiences later
- As a system, I want to handle voice recognition gracefully so that users can fall back to text input if needed

## Relevant Files and Components

**Existing Components:**

```typescript:src/lib/chat/tools/create-user-context.ts
// Tool for creating user context records
export const createUserContextTool: ChatTool<
  { content: string; reason: string },
  CreateUserContextServiceResult['data'] | ToolError
> = {
  name: 'createUserContext',
  // ... existing implementation ...
};
```

```typescript:src/app/app/layout.tsx
// Main application layout
// Note: Onboarding will NOT inherit this layout
export default async function Page({ children }: { children: React.ReactNode }) {
  // ... existing implementation ...
}
```

---

## 2. User Impact

**Target User Segments:**

- New users logging in for the first time
- Users who need to establish their networking approach
- Professionals seeking to improve their relationship-building skills

**User Discovery Method:**

- Automatic routing on first login
- Middleware-driven navigation to onboarding
- Progress tracking via user profile

**Pain Points Addressed:**

- Difficulty in creating compelling self-introductions
- Uncertainty about relationship building
- Need for personalized networking guidance

**Behavioral Changes Anticipated:**

- More confident networking approaches
- Better prepared for initial conversations
- Increased platform engagement through personalization

---

## 3. Success Metrics

**Measurement Criteria:**

- Onboarding completion rate
- Time spent in onboarding flow
- Quality of gathered user context
- User satisfaction with generated Share Value Ask

**Key Performance Indicators (KPIs):**

- % of users completing onboarding
- Average number of context points gathered per user
- User engagement post-onboarding

---

## 4. Technical Scope

**Core Requirements:**

1. Database Updates:

```typescript
// Add to user_profile table
onboarding: {
  type: 'jsonb',
  default: {
    completed: false,
    steps: {
      shareValueAsk: {
        completed: false,
        data: null
      }
      // Future steps can be added here
    },
    currentStep: 'shareValueAsk'
  }
}
```

2. Integration Points:

- Voice-to-text functionality
- Existing chat interface components
- User context creation service
- Authentication middleware

**System Dependencies:**

- Supabase for data storage
- Voice-to-text API integration
- Chat interface components
- User context service

---

## 5. Implementation Details

**Minimum Viable Feature:**

1. Routing Logic:

```typescript
// Update middleware.ts
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const supabase = createClient(request, response);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding')
      .eq('user_id', user.id)
      .single();

    if (!profile?.onboarding?.completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return response;
}
```

2. Chat Flow Structure:

```typescript
interface OnboardingStep {
  question: string;
  contextKey: string;
  followUp?: (response: string) => string;
  validation?: (response: string) => boolean;
}

const onboardingFlow: OnboardingStep[] = [
  {
    question: 'What industry or field are you most passionate about?',
    contextKey: 'industry',
    followUp: (response) => `That's fascinating! ${response} is a dynamic field.`
  }
  // Additional steps...
];
```

**Error States:**

- Voice recognition failures
- Context creation failures
- Incomplete responses
- Session timeouts

---

## 6. UX/UI

**UI Design Principles:**

- Full-page chat interface
- Clean, distraction-free design
- Clear progress indicators
- Voice input toggle
- Minimal branding elements

**User Flow:**

1. First-time login → Automatic redirect to onboarding
2. Welcome message and introduction
3. AI-driven conversation with voice input option
4. Progressive context gathering
5. Share Value Ask generation and preview
6. Confirmation and redirect to goals page

**View Specifications:**

- Full-screen chat interface
- Message bubbles for AI and user
- Voice input button
- Progress indicator
- Preview card for Share Value Ask
- Confirmation screen

---

## 7. Integration Points

**Interactions with Existing Features:**

```typescript
// Example integration with createUserContext
import { createUserContextTool } from '@/lib/chat/tools/create-user-context';

const handleUserResponse = async (response: string, contextType: string) => {
  await createUserContextTool.execute(db, {
    content: `User expressed ${response} regarding ${contextType}`,
    reason: `Gathered during onboarding flow - ${contextType} question`
  });
};
```

---

## 8. Reference Implementation Files

**Note:** These files represent the current chat implementation in the system. While we may not be able to reuse all of this code directly for the onboarding flow, they provide valuable context for understanding the existing chat architecture and patterns.

### Core Message Handling

```typescript:src/lib/llm/messages.ts
// Handles message creation with consistent formatting
import type { CoreMessage } from 'ai';
import { MESSAGE_ROLE } from '@/lib/messages/constants';
import { dateHandler } from '../dates/helpers';
import { randomString } from '../utils';

function createMessageFn(role: 'system' | 'user' | 'assistant'): (content: string, id?: string) => CoreMessage {
  // ... existing implementation ...
}

export const $system = createMessageFn(MESSAGE_ROLE.SYSTEM);
export const $user = createMessageFn(MESSAGE_ROLE.USER);
export const $assistant = createMessageFn(MESSAGE_ROLE.ASSISTANT);
```

### Chat Interface Components

```typescript:src/components/chat/chat-interface.tsx
// Main chat interface component
'use client';

interface ChatInterfaceProps {
  conversationId: string | null;
  conversations: any[];
  isLoadingConversations: boolean;
  handleCreateConversation: ({ title }: { title: string }) => Promise<Conversation>;
  // ... other props ...
}

export function ChatInterface({
  conversationId,
  conversations,
  isLoadingConversations,
  // ... other props ...
}: ChatInterfaceProps) {
  // ... existing implementation ...
}
```

### Message List Component

```typescript:src/components/chat/chat-messages-list.tsx
// Handles message display and scrolling
interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  // ... other props ...
}

export const ChatMessagesList = forwardRef<HTMLDivElement, ChatMessagesProps>(
  // ... existing implementation ...
);
```

### Chat API Route

```typescript:src/app/api/chat/route.ts
// Handles chat API requests and AI interactions
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);

  // ... existing implementation ...

  const systemPrompt = `You are an expert in relationship management...`;

  // ... rest of implementation ...
}
```

### Chat Interface Hook

```typescript:src/hooks/chat/use-chat-interface.ts
// Custom hook for chat functionality
interface UseChatInterfaceProps {
  conversationId: string | null;
  handleCreateConversation: ({ title }: { title: string }) => Promise<Conversation>;
  extraBody?: Record<string, any>;
}

export function useChatInterface({
  conversationId,
  handleCreateConversation,
  extraBody = {}
}: UseChatInterfaceProps) {
  // ... existing implementation ...
}
```

**Implementation Considerations:**

1. The onboarding chat will need a simplified version of these components, focused specifically on the onboarding flow
2. We can reuse the message creation and formatting utilities
3. The chat interface will need to be modified to remove conversation management features
4. The API route will need a specialized system prompt for onboarding
5. The chat interface hook will need to be adapted to handle onboarding-specific state and actions

---

## Additional Notes:

The onboarding experience should feel conversational and natural, with the AI providing meaningful feedback and confirmation after each user response. The system should be designed to be extensible, allowing for additional onboarding steps to be added in the future without major restructuring.

The Share Value Ask generation should be treated as a milestone in the user's journey, with clear visual feedback when it's created and saved. The system should maintain context throughout the conversation, using previous responses to inform follow-up questions and suggestions.
