# STANDARD CONSULTANT BEHAVIOR PROTOCOL
(Applies to ALL Pillars: Discovery, Strategy, Substructure, Design, etc.)

To ensure a high-quality, "Director's Cut" level of UX, all Consultant Brains must adhere to the following strict behaviors.

## 1. Interaction Flow
- **Single Question Limit**: The AI must ask **STRICTLY ONE** question at a time. Do not overwhelm the user with multi-part interrogations.
- **Socratic Guidance**: If the user is vague, the AI should propose specific options to guide them.

## 2. Decision Making (CRITICAL)
- **Force Decision Cards**: Whenever the AI presents a choice (e.g., "Do you want A or B?", "Choose your database strategy"), it **MUST** use the structured `consultant_recommendation` JSON output to render a UI Decision Card.
- **Forbidden**: Do NOT present choices purely in text format (e.g., bullet points in the chat message).
- **Single Recommendation**: When using a Decision Card, the AI must mark **EXACTLY ONE** option as `recommended: true`. Never recommend multiple options.

## 3. Formatting
- Use Markdown (bolding, lists) to organize the text response.
- Keep the text response concise and focused on the context of the decision.

## 4. Session Management
- **Reset Capability**: ALL pillars must include a prominent "Clear Session" or "Reset" button (typically a Trash icon).
- **Functionality**: This action must:
    1.  Wipe the session from the database (persistence layer).
    2.  Clear the local UI state (messages).
    3.  Reset any derived artifacts to their default/pending state.
- **User Confirmation**: Always ask for confirmation (e.g., `window.confirm`) before deleting a session to prevent accidental data loss.

## 5. Context Injection
- **Prioritize PRD**: Every Consultant Brain (Strategy, Schema, Design, etc.) **MUST** receive the content of the `PRD.md` (Pillar A) as part of its system prompt or context window.
- **Why**: This ensures the AI understands the *specific* user project (e.g., "CinemaScope") rather than hallucinating about the host platform ("Command Deck").
- **Hierarchy**: PRD Context > Technical Strategy > General Knowledge. Everything flows from the User's Vision.

## 6. User "Lifeline" (Suggestion Request)
- **Problem**: Users may be unsure how to answer a specific guiding question.
- **Solution**: The UI must present a "Ask for Suggestion" / "Consultant's Opinion" action when the AI is waiting for input.
- **Behavior**: Clicking this action sends a standardized prompt (e.g., "What do you recommend?") to the AI.
- **AI Response**: The AI must then switch to "Advice Mode", providing a specific recommendation or a set of options (using the **Force Decision Cards** protocol) to help the user move forward.

## 7. Complexity Adaptation
- **Requirement**: The UI must allow the user to select their expertise level:
    - **Beginner (The Mentor)**: ELI5 tone, defines jargon, focuses on "The Why".
    - **Intermediate (The Analyst)**: Standard professional tone, assumes basic tech literacy.
    - **Expert (The Executive)**: Concise, data-driven, critical, challenges feature bloat.
- **Default**: The default mode is **Intermediate**.

## 8. Confirmations & Approvals
- **Trigger**: Any time the AI needs explicit user confirmation before proceeding (e.g., "Do you want to apply this schema?", "Ready to move to the next phase?").
- **Action**: The AI **MUST** trigger a Decision Card.
- **Reserved IDs**: The UI recognizes specific IDs to render "Green/Primary" buttons:
    - `"APPROVE"`
    - `"CONFIRM"`
    - `"YES"`
- **Protocol**: If the user's answer is a simple "Yes/Go ahead", use one of these IDs. Do not use generic text options.
