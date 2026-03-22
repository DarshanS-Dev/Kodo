"use client";

const BASE = "https://kodo-yx1z.onrender.com";
const USER_ID = "user_001";

// Types
export type ProblemSummary = { id: string; title: string; difficulty: "easy" | "medium" | "hard"; tags: string[] };
export type TestCase = { input: string; output: string };
export type Problem = {
  id: string; title: string; difficulty: "easy" | "medium" | "hard"; tags: string[];
  description: string; examples: { input: string; output: string }[];
  test_cases: TestCase[]; starter_code: string;
};
export type ChatAction = { type: "open_problem"; problem_id: string };
export type SubmitResult = { status: string; feedback: string };

// 1. Session start — returns plain string greeting
export async function startSession(): Promise<string> {
  const res = await fetch(`${BASE}/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID }),
  });
  if (!res.ok) throw new Error(`Status: ${res.status}`);
  const text = await res.text();
  return text.replace(/^"|"$/g, ""); // Clean quotes if it's a JSON string
}

// 2. Chat — streams response token by token via onChunk.
// If backend returns a JSON action instead, calls onAction.
export async function chat(
  query: string,
  problemId: string | undefined,
  currentCode: string | undefined,
  onChunk: (token: string) => void,
  onAction?: (action: ChatAction) => void
): Promise<void> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: USER_ID,
      query,
      problem_id: problemId,
      current_code: currentCode
    }),
  });

  if (!res.ok) throw new Error(`Status: ${res.status}`);
  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let firstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    if (firstChunk) {
      firstChunk = false;
      // Attempt to parse as JSON for actions
      try {
        const potentialJson = chunk.trim();
        if (potentialJson.startsWith("{")) {
          const data = JSON.parse(potentialJson);
          if (data.action?.type === "open_problem") {
            onAction?.(data.action);
            return;
          }
        }
      } catch {
        // Not JSON, continue to stream
      }
    }

    onChunk(chunk);
  }
}

// 3. Problem list
export async function getProblemList(): Promise<ProblemSummary[]> {
  const res = await fetch(`${BASE}/problem/list`);
  if (!res.ok) throw new Error(`Status: ${res.status}`);
  return res.json();
}

// 4. Single problem by ID
export async function getProblem(id: string): Promise<Problem> {
  const res = await fetch(`${BASE}/problem/${id}`);
  if (!res.ok) throw new Error(`Status: ${res.status}`);
  return res.json();
}

// 5. Submit solution
export async function submitProblem(
  problemId: string,
  code: string,
  passed: boolean,
  attempts: number
): Promise<SubmitResult> {
  const res = await fetch(`${BASE}/problem/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: USER_ID,
      problem_id: problemId,
      code,
      passed,
      attempts
    }),
  });
  if (!res.ok) throw new Error(`Status: ${res.status}`);
  return res.json();
}

// 6. Weekly insight
export async function getWeeklyInsight(): Promise<string> {
  const res = await fetch(`${BASE}/insight/weekly?user_id=${USER_ID}`);
  if (!res.ok) throw new Error(`Status: ${res.status}`);
  return res.text();
}
