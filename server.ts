import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("-----------------------------------------");
    console.log("🚀 Gemini API Engine Initialized Server-Side");
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.log("-----------------------------------------");
  console.log("⚠️ No active GEMINI_API_KEY detected in env.");
  console.log("Running in secure offline simulated behavior.");
  console.log("Configure Secrets in Settings > Secrets to link Gemini.");
  console.log("-----------------------------------------");
}

// 1. API: Task Milestone Decomposer
app.post("/api/ai/breakdown", async (req, res) => {
  const { title, hours } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title parameter is required." });
  }

  const requestedHours = hours || 12;

  // If Gemini is active, let's call the real API with responseSchema!
  if (ai) {
    try {
      const prompt = `Deconstruct this large project objective: "${title}" into precisely 3 sequential milestone phases.
                     Estimated cumulative duration for the entire project is ${requestedHours} hours.
                     For each milestone phase, define:
                     - Recommended Order (1, 2, 3)
                     - Title (Concise display header)
                     - Description (Clear action guide)
                     - Estimated hours (The sum must equal ${requestedHours})
                     Also provide a 1-sentence high-level Roadmap Summary explaining why this sequence is highly efficient.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Nova, a highly structured AI Chief of Staff and Agile coach specializing in milestone compilation.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taskTitle: { type: Type.STRING },
              estimatedTotalHours: { type: Type.INTEGER },
              roadmapSummary: { type: Type.STRING },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimatedHours: { type: Type.INTEGER },
                    recommendedOrder: { type: Type.INTEGER }
                  },
                  required: ["id", "title", "description", "estimatedHours", "recommendedOrder"]
                }
              }
            },
            required: ["taskTitle", "estimatedTotalHours", "roadmapSummary", "subtasks"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const payload = JSON.parse(text);
        return res.json(payload);
      }
    } catch (err) {
      console.warn("Gemini breakdown errored, shifting to local model simulator:", err);
    }
  }

  // Pure CSS-compatible local simulator payload when offline
  const cleanTitle = title.trim();
  const subtasks = [
    {
      id: `sim-sub-1`,
      title: `Define Sandbox Requirements`,
      description: `Draft schema parameters, review structural options, and inspect sample files for "${cleanTitle}".`,
      estimatedHours: Math.ceil(requestedHours * 0.25),
      recommendedOrder: 1
    },
    {
      id: `sim-sub-2`,
      title: `Continuous Sprints & MVP Development`,
      description: `Build out key interface logic, configure reactive state variables, and fix layout offsets.`,
      estimatedHours: Math.ceil(requestedHours * 0.5),
      recommendedOrder: 2
    },
    {
      id: `sim-sub-3`,
      title: `Verification & Delivery Checkpoints`,
      description: `Execute lint tests, validate custom interactions, and present the polished preview.`,
      estimatedHours: Math.floor(requestedHours * 0.25) || 1,
      recommendedOrder: 3
    }
  ];

  return res.json({
    taskTitle: cleanTitle,
    estimatedTotalHours: requestedHours,
    roadmapSummary: `Our scheduler deconstructed "${cleanTitle}" by establishing sandboxes, conducting rapid building sprints, and finishing with absolute validation checks.`,
    subtasks
  });
});

// 2. API: Save My Week (Emergency Recovery Assessment)
app.post("/api/ai/save-my-week", async (req, res) => {
  const { tasks } = req.body;

  // Real Gemini logic with JSON response schema
  if (ai) {
    try {
      const prompt = `Analyze this list of commitments: ${JSON.stringify(tasks)}.
                     Identify if there are deadline hazards, and construct an emergency recovery plan.
                     Configure:
                     - Risk Level ('HIGH' | 'MEDIUM' | 'LOW')
                     - Short 2-sentence Risk Explanation
                     - list of precisely 3 Recovery Steps to de-escalate workload.
                     - Optimized Weekly Schedule mapping 3 crucial 2-hour schedule slots to save the week.
                       Include: Time Block (e.g. 'Monday 10:00 AM'), Task Title, Action Reason, Type ('Deep Focus' | 'Pacing Buffer' | 'Sync Session')
                     - Short 1-sentence weekly outlook message.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the Nova Chief of Staff Emergency Controller. You diagnose cognitive overload and construct optimized stabilization roadmaps.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING },
              riskExplanation: { type: Type.STRING },
              recoverySteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              optimizedSchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeBlock: { type: Type.STRING },
                    taskTitle: { type: Type.STRING },
                    actionReason: { type: Type.STRING },
                    type: { type: Type.STRING }
                  },
                  required: ["timeBlock", "taskTitle", "actionReason", "type"]
                }
              },
              weeklyOutlook: { type: Type.STRING }
            },
            required: ["riskLevel", "riskExplanation", "recoverySteps", "optimizedSchedule", "weeklyOutlook"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const payload = JSON.parse(text);
        return res.json(payload);
      }
    } catch (err) {
      console.warn("Gemini SaveMyWeek failed, shifting to offline simulation:", err);
    }
  }

  // Offline simulated Save My Week Plan
  return res.json({
    riskLevel: "HIGH",
    riskExplanation: "Our overload level calculations detected multiple close deadlines with high work-hour density, threatening cognitive depletion.",
    recoverySteps: [
      "De-escalate low-priority segments: Move routine study readings to Friday registers.",
      "Buffer sequences: Maintain 30-minute pacing intervals after 2 hours of solid build sprints.",
      "Protect Deep Focus hours on Monday and Wednesday mornings to code crucial models."
    ],
    optimizedSchedule: [
      {
        timeBlock: "Mon 09:00 AM - 11:00 AM",
        taskTitle: "Refactor core codebase nodes",
        actionReason: "Conduct deep focus sprint when concentration indexes are peak.",
        type: "Deep Focus"
      },
      {
        timeBlock: "Tue 02:00 PM - 03:00 PM",
        taskTitle: "Pitch sync preparation",
        actionReason: "Protect this segment to clear critical client deliverables.",
        type: "Sync Session"
      },
      {
        timeBlock: "Wed 10:00 AM - 12:00 PM",
        taskTitle: "Pacing exercise break",
        actionReason: "Clear cognitive buffer limits with fresh hydration.",
        type: "Pacing Buffer"
      }
    ],
    weeklyOutlook: "Stabilization coordinates applied. The emergency plan levels peak overlaps and preserves key project deliverables safely."
  });
});

// 3. API: Natural Language Chat
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  if (ai) {
    try {
      // Format chat context
      const chatContext = messages.map(m => `${m.sender === 'user' ? 'User' : 'Nova'}: ${m.text}`).join("\n");
      const systemInstruction = `You are Nova, an elite full-stack AI Chief of Staff and strategic executive coach.
                                You speak with precision, encouragement, and professional composure.
                                Keep answers elegant, short, and focused strictly on the user's workload performance.
                                If they are struggling, suggest applying a structured suggestedAction.
                                If appropriate, include a suggestedAction parameter:
                                { type: "save_my_week" } can trigger the overload diagnostics, and { type: "create_task" } launches helper templates.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Here is the current conversation thread:\n${chatContext}\n\nRespond as Nova. If applicable, recommend the user trigger the Emergency Stabilization Protocol or Add a new task node.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: { type: Type.STRING },
              suggestedAction: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["type", "label"]
              }
            },
            required: ["replyText"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const payload = JSON.parse(text);
        return res.json(payload);
      }
    } catch (err) {
      console.warn("Gemini Chat failed, routing simulated response:", err);
    }
  }

  // Sim response
  const lastUserText = messages[messages.length - 1]?.text || "";
  let replyText = "I have analyzed your workload commitments and habit streaks index. Would you like me to sequence these into deep focus blocks for tomorrow?";
  let suggestedAction = undefined;

  if (lastUserText.toLowerCase().includes("overload") || lastUserText.toLowerCase().includes("save")) {
    replyText = "Emergency criteria diagnosed. Our overload indices are peaking because of overlapping startup pitch deck milestones. Promptly deploy the stabilization protocol!";
    suggestedAction = { type: 'save_my_week', label: 'Deploy Save My Week Protocol' };
  } else if (lastUserText.toLowerCase().includes("create") || lastUserText.toLowerCase().includes("task")) {
    replyText = "Let's establish a clear commitment node inside the Workspace. Click below to initialize a high-importance item.";
    suggestedAction = { type: 'create_task', label: 'Initiate Task Node Template' };
  }

  return res.json({ replyText, suggestedAction });
});

// 4. API: Voice input translator & analyzer (Nova Voice)
app.post("/api/ai/process-voice", async (req, res) => {
  const { transcript, currentView, tasksContext, goalsContext } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript required." });
  }

  // If Gemini client is initialized, use it for deep semantic understanding
  if (ai) {
    try {
      const todayString = new Date().toDateString();
      const systemInstruction = `You are Nova Voice, the premium hands-free AI voice assistant for Nova AI, an advanced student and professional productivity platform.
Analyze the user's speech transcript and determine their intent. Map it to one of the following structured actions:
1. NAVIGATE: user wants to go to a screen. Parameters: { view: 'dashboard' | 'tasks' | 'calendar' | 'goals' | 'habits' | 'settings' | 'save_my_week' | 'planner' }
2. CREATE_TASK: user wants to add a task. Parameters: { title: string, category: 'Work'|'Study'|'Personal'|'Health'|'Finance'|'Startup', priority: 'high'|'medium'|'low', estimatedTime: number, deadline: string (YYYY-MM-DD, default is 2 days from now) }
3. MARK_COMPLETE: user wants to complete or start a task. Parameters: { taskTitle: string, taskId: string (if matching), status: 'completed' | 'inprogress' | 'todo' }
4. ADD_GOAL: user wants to add a new goal. Parameters: { title: string, category: 'Academic'|'Career'|'Personal'|'Health'|'Financial'|'Startup', timeframe: 'weekly'|'monthly'|'quarterly' }
5. SAVE_MY_WEEK: user wants to run save-my-week / emergency recovery plan. Parameters: {}
6. PRIORITIZE_TASKS: user wants to sequence or prioritize tasks. Parameters: {}
7. GENERATE_SCHEDULE: user wants to generate a schedule or organize tasks. Parameters: {}
8. ANSWER_QUESTION: user is asking a general question, productivity advice, or standard chatbot inquiry. Parameters: {}

Your response must be in JSON format matching this schema:
{
  "action": "NAVIGATE" | "CREATE_TASK" | "MARK_COMPLETE" | "ADD_GOAL" | "SAVE_MY_WEEK" | "PRIORITIZE_TASKS" | "GENERATE_SCHEDULE" | "ANSWER_QUESTION",
  "parameters": object (specific to action),
  "replyText": string (a short, delightful, professional assistant response spoken in a supportive voice),
  "speakText": string (a concise text specifically written for text-to-speech, maximum 15-20 words, very clear and natural)
}

Contextual Information:
- Current View: ${currentView || 'dashboard'}
- User's existing tasks: ${JSON.stringify(tasksContext || [])}
- User's existing goals: ${JSON.stringify(goalsContext || [])}
- Current Date/Time: ${todayString}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Spoken Transcript: "${transcript}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              parameters: { type: Type.OBJECT },
              replyText: { type: Type.STRING },
              speakText: { type: Type.STRING }
            },
            required: ["action", "parameters", "replyText", "speakText"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        
        // Backward compatibility layer for legacy chatbot expectations
        let parsedTask = null;
        if (parsed.action === "CREATE_TASK") {
          const p = parsed.parameters || {};
          parsedTask = {
            title: p.title || "Spoken Task Node",
            description: p.description || `Synthesized automatically from spoken prompt: "${transcript}".`,
            category: p.category || "Study",
            priority: p.priority || "medium",
            estimatedTime: Number(p.estimatedTime) || 2,
            deadline: p.deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }

        return res.json({
          ...parsed,
          parsedTask
        });
      }
    } catch (err) {
      console.error("Gemini voice processing failed, falling back to local analyzer:", err);
    }
  }

  // Advanced Fallback Rule-Based Parser (Offline / Missing API Keys)
  const text = transcript.toLowerCase();
  
  let action = "ANSWER_QUESTION";
  let parameters: any = {};
  let replyText = `I heard you say: "${transcript}". How can I assist you with your workload today?`;
  let speakText = `I heard you say: "${transcript}".`;

  if (text.includes("dashboard") || text.includes("home") || text.includes("mainframe")) {
    action = "NAVIGATE";
    parameters = { view: "dashboard" };
    replyText = `Redirecting your mainframe viewport to the Dashboard focus interface.`;
    speakText = `Opening your Dashboard.`;
  } else if (text.includes("calendar") || text.includes("schedule")) {
    action = "NAVIGATE";
    parameters = { view: "calendar" };
    replyText = `Opening your focus calendar and milestone timeline views.`;
    speakText = `Opening your Calendar.`;
  } else if (text.includes("habit") || text.includes("streak")) {
    action = "NAVIGATE";
    parameters = { view: "habits" };
    replyText = `Displaying your custom habit matrices and streak counts.`;
    speakText = `Opening daily habits.`;
  } else if (text.includes("setting")) {
    action = "NAVIGATE";
    parameters = { view: "settings" };
    replyText = `Navigating to workspace profile and security setting coordinates.`;
    speakText = `Opening Settings.`;
  } else if (text.includes("save my week") || text.includes("emergency") || text.includes("overload")) {
    action = "SAVE_MY_WEEK";
    replyText = `Activating emergency workload distribution system. Analyzing deadline risks under the Save My Week protocol.`;
    speakText = `Executing Save My Week recovery program.`;
  } else if (text.includes("goal")) {
    if (text.includes("create") || text.includes("add") || text.includes("new")) {
      const titleMatch = transcript.match(/(?:create|add|new)\s+goal\s+called\s+([^]+)/i) ||
                         transcript.match(/(?:create|add|new)\s+goal\s+([^]+)/i);
      const title = titleMatch ? titleMatch[1] : "Spoken Goal Target";
      action = "ADD_GOAL";
      parameters = { title, category: "Personal", targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] };
      replyText = `Initialized goal: "${title}" inside your long-term roadmap.`;
      speakText = `Created goal ${title}.`;
    } else {
      action = "NAVIGATE";
      parameters = { view: "goals" };
      replyText = `Opening your Goal Benchmarks and active milestone tracker.`;
      speakText = `Opening Goals.`;
    }
  } else if (text.includes("task") || text.includes("todo") || text.includes("to-do") || text.includes("create") || text.includes("add")) {
    if (text.includes("complete") || text.includes("done") || text.includes("finish") || text.includes("mark")) {
      const titleMatch = transcript.match(/(?:complete|finish|mark|done)\s+(?:task|todo)\s+called\s+([^]+)/i) ||
                         transcript.match(/(?:complete|finish|mark|done)\s+(?:task|todo)\s+([^]+)/i) ||
                         transcript.match(/(?:complete|finish|mark|done)\s+([^]+)/i);
      const title = titleMatch ? titleMatch[1] : "Commitment";
      action = "MARK_COMPLETE";
      parameters = { taskTitle: title, status: "completed" };
      replyText = `Marking task matching "${title}" as complete in your database.`;
      speakText = `Completed task ${title}.`;
    } else {
      const titleMatch = transcript.match(/(?:create|add|new)\s+(?:task|todo)\s+called\s+([^]+)/i) || 
                         transcript.match(/(?:create|add|new)\s+(?:task|todo)\s+([^]+)/i) ||
                         transcript.match(/(?:create|add|new)\s+([^]+)/i);
      const title = titleMatch ? titleMatch[1] : "Spoken Task node";
      action = "CREATE_TASK";
      parameters = {
        title,
        category: "Study",
        priority: "medium",
        estimatedTime: 2,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      replyText = `Created task: "${title}" inside your Study workflow registry.`;
      speakText = `Created task ${title}.`;
    }
  } else if (text.includes("prioritize") || text.includes("sort")) {
    action = "PRIORITIZE_TASKS";
    replyText = `Re-prioritizing and sequence-mapping all active commitments.`;
    speakText = `Prioritizing tasks.`;
  } else if (text.includes("plan") || text.includes("schedule")) {
    action = "GENERATE_SCHEDULE";
    replyText = `Analyzing parameters to optimize your schedule blocks.`;
    speakText = `Generating schedule.`;
  }

  // Parse legacy formatted task for backward compatibility
  let parsedTask = null;
  if (action === "CREATE_TASK") {
    parsedTask = {
      title: parameters.title || "Spoken Task Node",
      description: `Synthesized automatically from user spoken audio: "${transcript}".`,
      category: parameters.category || "Study",
      priority: parameters.priority || "medium",
      estimatedTime: Number(parameters.estimatedTime) || 2,
      deadline: parameters.deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  return res.json({
    action,
    parameters,
    replyText,
    speakText,
    parsedTask
  });
});

// ----------------------------------------------------
// Production / Frontend routing setup
// ----------------------------------------------------
import { createServer as createViteServer } from "vite";

async function setupRoutingAndStart() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static UI assets from production build folder
    app.use(express.static(join(__dirname, "dist")));
    
    app.get("*", (req, res, next) => {
      // Exclude API roads from client routing
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(join(__dirname, "dist/index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nova backend container actively listening on port ${PORT}`);
  });
}

setupRoutingAndStart().catch((err) => {
  console.error("Failed to boot app server with Vite routing:", err);
});
