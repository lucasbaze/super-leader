```mermaid
sequenceDiagram
participant UI as Chat Interface
participant API as Chat API Route
participant Exec as Execute Function
participant AI as OpenAI
participant Tool as Tool Service
participant Ext as External AI Service
UI->>API: User sends message
Note over UI,API: Message contains data/parameters
API->>Exec: Pass message & extracted data
Exec->>AI: Request tool function selection
AI-->>Exec: Determine appropriate tool
Exec->>Tool: Execute selected tool
Tool->>Ext: Make external API call
Note over Tool,Ext: Could be Proplexity/ChatGPT
Ext-->>Tool: Return structured data
Tool-->>Exec: Return tool results
Exec-->>API: Return response with tool invocation
API-->>UI: Return chat message
Note over UI: Chat Messages Component
Note over UI: Extracts tool invocations
Note over UI: Renders Action Card if needed
Note over UI: Handles additional actions
```

## Flow Description

1. **Initial Flow**

   - User interacts with Chat Interface
   - Message is appended and sent to Chat API
   - Message data is extracted in API route

2. **Execution Flow**

   - Execute function receives message and data
   - OpenAI determines appropriate tool function
   - Selected tool is executed

3. **External Service Integration**

   - Tool service makes external API calls
   - Communicates with services like Proplexity/ChatGPT
   - Handles person data fetching and system prompts
   - Returns structured data

4. **Response Flow**
   - Tool invocation results return through the chain
   - Chat messages component receives response
   - Handles tool invocations and renders action cards
   - Manages additional actions as needed

## Key Components

- **Chat Interface**: Handles user interaction and message display
- **Chat API Route**: Processes messages and manages data flow
- **Execute Function**: Coordinates tool selection and execution
- **Tool Service**: Interfaces with external APIs and services
- **External AI Service**: Provides AI capabilities (Proplexity/ChatGPT)
- **Action Cards**: UI components for tool invocation results
