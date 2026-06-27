import { Task, SentEmail, UserPreferences } from "../types";
import { saveUserEmail } from "./firebase";

// Helper to format ISO deadlines cleanly
function formatDeadline(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return isoString;
  }
}

// ----------------------------------------------------
// GORGEOUS HTML EMAIL TEMPLATE GENERATORS
// Styled with premium twilight / slate layout modes
// ----------------------------------------------------

export function generateTaskDueEmail(
  task: Task,
  hoursRemaining: number,
  recipientEmail: string
): { subject: string; body: string } {
  const subject = `⏳ Task Alert [${hoursRemaining}h remaining]: "${task.title}" is closing in!`;
  
  const body = `
<div style="background-color: #0c081e; color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 32px 16px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; color: white;">
      Nova Planner Notification
    </div>
    <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 0; tracking: -0.02em; color: #f4f4f5;">
      Workload Threshold Alert
    </h1>
  </div>

  <!-- Main Warning Box -->
  <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
    <span style="font-size: 24px; display: block; margin-bottom: 8px;">⏳</span>
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #fca5a5;">
      Constraint Warning: Task due in ${hoursRemaining} ${hoursRemaining === 1 ? 'hour' : 'hours'}!
    </p>
    <p style="margin: 6px 0 0; font-size: 11px; color: #ef4444; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
      Overdue threat index has triggered.
    </p>
  </div>

  <!-- Detail Table -->
  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 18px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #d4d4d8; text-transform: uppercase; letter-spacing: 0.05em;">
      Task Registry Node
    </h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #a1a1aa;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #71717a; width: 35%;">Title</td>
        <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${task.title}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Deadline</td>
        <td style="padding: 6px 0; color: #fb7185; font-weight: 700;">${formatDeadline(task.deadline)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Priority Index</td>
        <td style="padding: 6px 0;">
          <span style="background-color: ${task.priority === 'high' ? '#991b1b' : task.priority === 'medium' ? '#854d0e' : '#14532d'}; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
            ${task.priority}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #71717a;">Est. Duration</td>
        <td style="padding: 6px 0; color: #ffffff; font-family: monospace;">${task.estimatedTime} Hours</td>
      </tr>
      ${task.description ? `
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #71717a; vertical-align: top;">Description</td>
        <td style="padding: 8px 0; color: #e4e4e7; line-height: 1.4;">${task.description}</td>
      </tr>` : ''}
    </table>
  </div>

  <!-- Recommended Action -->
  <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #3b82f6; border-radius: 4px 12px 12px 4px; padding: 16px; margin-bottom: 24px;">
    <h4 style="margin: 0 0 6px; font-size: 12px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em;">
      Recommended Scheduling Action
    </h4>
    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #e4e4e7;">
      Based on your circadian concentration indexes, execute a dedicated <strong>${task.estimatedTime} hr Deep Focus Block</strong> immediately to resolve this outstanding duty before the portal locks.
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #52525b; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
    <p style="margin: 0;">Sent to authenticated user: ${recipientEmail}</p>
    <p style="margin: 4px 0 0;">You can customize your alert parameters inside the Settings dashboard.</p>
  </div>
</div>
`;
  return { subject, body };
}

export function generateHighRiskEmail(
  task: Task,
  riskScore: number,
  reason: string,
  recommendedAction: string,
  recoveryPlan: string[],
  recipientEmail: string
): { subject: string; body: string } {
  const subject = `🚨 Nova Alert: High Overload Risk detected for "${task.title}" [Risk Score: ${riskScore}%]`;
  
  const stepsList = recoveryPlan
    .map(step => `<li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">${step}</li>`)
    .join("");

  const body = `
<div style="background-color: #0c081e; color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 32px 16px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; color: white;">
      AI Risk Diagnostic Active
    </div>
    <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 0; tracking: -0.02em; color: #f4f4f5;">
      Conflict & Overload Warning
    </h1>
  </div>

  <!-- Risk Profile Card -->
  <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
    <div style="font-size: 11px; text-transform: uppercase; tracking: 0.1em; font-weight: 800; color: #f87171; margin-bottom: 4px;">Predicted Failure Index</div>
    <div style="font-size: 40px; font-weight: 900; color: #ef4444; margin: 4px 0;">
      ${riskScore}%
    </div>
    <p style="margin: 6px 0 0; font-size: 12px; font-weight: 600; color: #fca5a5;">
      Nova predicts a high chance of missing this task's deadline constraint.
    </p>
  </div>

  <!-- Risk Details -->
  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 12px;">
    <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 800; color: #fb7185; text-transform: uppercase; letter-spacing: 0.05em;">
      Conflict Reason
    </h3>
    <p style="margin: 0; line-height: 1.5; color: #e4e4e7; font-style: italic;">
      "${reason}"
    </p>
  </div>

  <!-- Recommended Action -->
  <div style="background: rgba(255,255,255,0.02); border-left: 3px solid #e11d48; border-radius: 4px 12px 12px 4px; padding: 16px; margin-bottom: 24px; font-size: 12px;">
    <h4 style="margin: 0 0 6px; font-size: 12px; font-weight: 800; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em;">
      Recommended Action
    </h4>
    <p style="margin: 0; line-height: 1.5; color: #e4e4e7;">
      ${recommendedAction}
    </p>
  </div>

  <!-- Recovery Plan -->
  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 12px;">
    <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #a855f7; text-transform: uppercase; letter-spacing: 0.05em;">
      AI Strategic Recovery Steps
    </h3>
    <ul style="margin: 0; padding-left: 18px;">
      ${stepsList || `
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Postpone low-urgency non-essential tasks immediately.</li>
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Re-delegate study routines to Friday morning spacing buffers.</li>
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Initiate a 2-hour high-focus block for execution right now.</li>
      `}
    </ul>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #52525b; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
    <p style="margin: 0;">Recipient Node: ${recipientEmail}</p>
    <p style="margin: 4px 0 0;">Generated server-side utilizing your active Google GenAI model parameters.</p>
  </div>
</div>
`;
  return { subject, body };
}

export function generateMissedDeadlineEmail(
  task: Task,
  recipientEmail: string,
  recoverySteps: string[]
): { subject: string; body: string } {
  const subject = `⚠️ Overdue Recovery Plan: Action Required for "${task.title}"`;
  
  const stepsList = recoverySteps
    .map(step => `<li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">${step}</li>`)
    .join("");

  const body = `
<div style="background-color: #0c081e; color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 32px 16px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px;">
    <div style="display: inline-block; background: #ea580c; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; color: white;">
      Missed Deadline Protocol
    </div>
    <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 0; tracking: -0.02em; color: #f4f4f5;">
      Post-Decline Stabilization Map
    </h1>
  </div>

  <!-- Missed Callout -->
  <div style="background: rgba(234, 88, 12, 0.1); border: 1px solid rgba(234, 88, 12, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
    <span style="font-size: 24px; display: block; margin-bottom: 8px;">🚨</span>
    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #fdba74;">
      Task Overdue: "${task.title}"
    </p>
    <p style="margin: 6px 0 0; font-size: 11px; color: #ea580c; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
      Expected Deadline: ${formatDeadline(task.deadline)}
    </p>
  </div>

  <!-- Instruction -->
  <p style="font-size: 12px; line-height: 1.5; color: #d4d4d8; margin-bottom: 20px;">
    Your commitment deadline has been validated as compromised. Remaining passive will propagate delays to active goal metrics. Let's deploy Nova's emergency reschedule directives to restore order.
  </p>

  <!-- Recovery Plan -->
  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 12px;">
    <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em;">
      Overdue Compensation Directives
    </h3>
    <ul style="margin: 0; padding-left: 18px;">
      ${stepsList || `
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Establish a 90-minute completion sprint today.</li>
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Defer secondary work logs to lock in active milestones.</li>
        <li style="margin-bottom: 8px; color: #e4e4e7; line-height: 1.5;">Reset your streak index by logging this completion.</li>
      `}
    </ul>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #52525b; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
    <p style="margin: 0;">Recipient: ${recipientEmail}</p>
    <p style="margin: 4px 0 0;">Automatic deadline recovery systems active.</p>
  </div>
</div>
`;
  return { subject, body };
}

export function generateWeeklyReportEmail(
  recipientEmail: string,
  completedCount: number,
  missedCount: number,
  completionRate: number,
  recommendations: string[]
): { subject: string; body: string } {
  const subject = `📊 Nova Productivity Report: Your Weekly Analytical Digest`;
  
  const recsList = recommendations
    .map(rec => `<li style="margin-bottom: 10px; color: #e4e4e7; line-height: 1.5;">${rec}</li>`)
    .join("");

  const body = `
<div style="background-color: #0c081e; color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 32px 16px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; color: white;">
      Weekly Performance Digest
    </div>
    <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 0; tracking: -0.02em; color: #f4f4f5;">
      Productivity Telemetry
    </h1>
  </div>

  <!-- Weekly Grid -->
  <div style="display: table; width: 100%; margin-bottom: 24px; text-align: center; border-spacing: 10px 0;">
    <div style="display: table-cell; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 14px;">
      <span style="font-size: 11px; text-transform: uppercase; color: #34d399; font-weight: bold; display: block;">Completed</span>
      <span style="font-size: 24px; font-weight: 900; color: #10b981;">${completedCount}</span>
    </div>
    <div style="display: table-cell; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px;">
      <span style="font-size: 11px; text-transform: uppercase; color: #f87171; font-weight: bold; display: block;">Missed</span>
      <span style="font-size: 24px; font-weight: 900; color: #ef4444;">${missedCount}</span>
    </div>
    <div style="display: table-cell; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 14px;">
      <span style="font-size: 11px; text-transform: uppercase; color: #60a5fa; font-weight: bold; display: block;">Rate</span>
      <span style="font-size: 24px; font-weight: 900; color: #3b82f6;">${completionRate}%</span>
    </div>
  </div>

  <!-- Progress Message -->
  <div style="background: rgba(255,255,255,0.02); border-radius: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.04); text-align: center; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 13px; color: #e4e4e7; line-height: 1.4;">
      Your active milestone completion vectors are performing at a <strong>${completionRate >= 70 ? 'Satisfactory' : 'Critical'}</strong> efficiency curve. Keep logs current!
    </p>
  </div>

  <!-- AI Recommendations -->
  <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 12px;">
    <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">
      Nova's Strategic AI Recommendations
    </h3>
    <ul style="margin: 0; padding-left: 18px;">
      ${recsList || `
        <li style="margin-bottom: 10px; color: #e4e4e7; line-height: 1.5;">Protect deep focus coding blocks during initial weekday hours.</li>
        <li style="margin-bottom: 10px; color: #e4e4e7; line-height: 1.5;">Increase your daily meditation or relaxation pacing intervals.</li>
        <li style="margin-bottom: 10px; color: #e4e4e7; line-height: 1.5;">Prioritize high-urgency startup milestones before study reads.</li>
      `}
    </ul>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #52525b; font-size: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
    <p style="margin: 0;">Sent reporting profile: ${recipientEmail}</p>
    <p style="margin: 4px 0 0;">This productivity report is compiled automatically based on your Firestore database records.</p>
  </div>
</div>
`;
  return { subject, body };
}

// ----------------------------------------------------
// DYNAMIC AUTOMATIC EMAIL SCHEDULING & ASSESSMENT
// ----------------------------------------------------

export async function runAutomaticAlertChecks(
  userId: string,
  userEmail: string,
  tasks: Task[],
  preferences: UserPreferences,
  existingSentEmails: SentEmail[]
): Promise<number> {
  // If global email notifications are toggled off, immediately stop
  if (preferences.emailNotifications === false) return 0;

  let emailsCreatedCount = 0;
  const nowMs = Date.now();
  const sentHashes = new Set(existingSentEmails.map(e => `${e.type}-${e.metadata?.taskId || e.id}-${e.metadata?.checkHour || ""}`));

  for (const task of tasks) {
    if (task.status === "completed") continue;

    // Check deadlines for due dates
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const diffMs = deadlineDate.getTime() - nowMs;
      const diffHours = diffMs / 3600000;

      // 1. DUE TASK ALERTS (24h, 12h, 1h)
      if (preferences.dueTaskAlerts !== false) {
        // Checking for:
        // - "Task due in 1 hour" (diff hours between 0 and 1)
        // - "Task due in 12 hours" (diff hours between 1 and 12)
        // - "Task due in 24 hours" (diff hours between 12 and 24)
        
        let alertHour: number | null = null;
        if (diffHours > 0 && diffHours <= 1) {
          alertHour = 1;
        } else if (diffHours > 1 && diffHours <= 12) {
          alertHour = 12;
        } else if (diffHours > 12 && diffHours <= 24) {
          alertHour = 24;
        }

        if (alertHour !== null) {
          const hash = `due_alert-${task.id}-${alertHour}`;
          if (!sentHashes.has(hash)) {
            const { subject, body } = generateTaskDueEmail(task, alertHour, userEmail);
            await saveUserEmail(userId, {
              recipient: userEmail,
              subject,
              body,
              type: "due_alert",
              sentAt: new Date().toISOString(),
              status: "delivered",
              metadata: { taskId: task.id, checkHour: alertHour }
            });
            emailsCreatedCount++;
            sentHashes.add(hash);
          }
        }
      }

      // 2. OVERDUE / MISSED DEADLINE RECOVERY PLANS
      const isOverdue = diffMs < 0;
      if (isOverdue) {
        const overdueHash = `missed_deadline-${task.id}-overdue`;
        if (!sentHashes.has(overdueHash)) {
          const recoverySteps = [
            "Initiate an emergency 90-minute study or coding sprint today.",
            "Reschedule secondary startup tasks to preserve primary milestone health.",
            "Record your progress update within the Workspace immediately to maintain streak indicators."
          ];
          const { subject, body } = generateMissedDeadlineEmail(task, userEmail, recoverySteps);
          await saveUserEmail(userId, {
            recipient: userEmail,
            subject,
            body,
            type: "missed_deadline",
            sentAt: new Date().toISOString(),
            status: "delivered",
            metadata: { taskId: task.id, isOverdue: true }
          });
          emailsCreatedCount++;
          sentHashes.add(overdueHash);
        }
      }
    }

    // 3. HIGH RISK ALERTS
    // If AI predicts task has a high risk of missing its deadline (riskScore >= 75)
    const isHighRisk = task.riskScore && task.riskScore >= 75;
    if (isHighRisk && preferences.highRiskAlerts !== false) {
      const riskHash = `high_risk-${task.id}-alarm`;
      if (!sentHashes.has(riskHash)) {
        const reason = task.aiRiskAnalysis || `Nova detected multiple conflicting deadlines with overlapping high work-hour workloads.`;
        const recommendedAction = `Shed minor routine work duties immediately. Consolidate your attention on resolving "${task.title}" before the milestone constraint collapses fully.`;
        const recoveryPlan = [
          "Postpone minor non-essential duties to protect primary performance outputs.",
          "Insert a 1-hour mindfulness pacing buffer following 2 hours of solid build code sprints.",
          "Conduct high-focus milestone work on Monday mornings during your peak concentration window."
        ];
        
        const { subject, body } = generateHighRiskEmail(task, task.riskScore || 85, reason, recommendedAction, recoveryPlan, userEmail);
        await saveUserEmail(userId, {
          recipient: userEmail,
          subject,
          body,
          type: "high_risk",
          sentAt: new Date().toISOString(),
          status: "delivered",
          metadata: { taskId: task.id, riskScore: task.riskScore }
        });
        emailsCreatedCount++;
        sentHashes.add(riskHash);
      }
    }
  }

  return emailsCreatedCount;
}
