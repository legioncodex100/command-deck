import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const SQL_GEN_SYSTEM = `
You are a PostgreSQL Architect.
Input: A JSON description of data entities (tables, columns) or a rough schema sketch.
Output: High-quality, valid PostgreSQL DDL.

Requirements:
1.  **RLS**: Every table MUST have Row Level Security enabled.
2.  **Project Scoping**: Every table (except users/projects) MUST have a \`project_id\` column referencing \`projects(id)\`.
3.  **Policies**: Generate standard RLS policies for Select/Insert/Update/Delete checking \`project_id\`.
4.  **Syntax**: Valid Postgres SQL.
5.  **Output**: Return ONLY the SQL code block.
`;

const VALIDATION_SYSTEM = `
You are a "Structural Auditor" for Database Schemas.
Input: SQL DDL.
Output: A JSON object with validation results.

Checks:
1.  **Tangled Pipes**: Are foreign keys missing or circular?
2.  **Scoping**: Does every table have \`project_id\`?
3.  **RLS**: Is RLS enabled for all tables?

Output Format (JSON):
{
  "isValid": boolean,
  "issues": string[], // List of error messages
  "score": number // 0-100
}
`;

export async function generateSQL(blueprintContext: string) {
    if (!apiKey) throw new Error("API Key missing");

    try {
        const result = await model.generateContent(`${SQL_GEN_SYSTEM}\n\nBLUEPRINT/CONTEXT:\n${blueprintContext}`);
        const text = result.response.text();
        // Clean markdown
        return text.replace(/```sql/g, '').replace(/```/g, '').trim();
    } catch (e) {
        console.error("SQL Gen Error:", e);
        throw e;
    }
}

export async function validateSchema(sql: string) {
    if (!apiKey) throw new Error("API Key missing");

    try {
        const result = await model.generateContent(`${VALIDATION_SYSTEM}\n\nSQL TO VALIDATE:\n${sql}`);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Schema Validation Error:", e);
        throw e;
    }
}
