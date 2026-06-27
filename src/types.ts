export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date string (YYYY-MM-DD)
  priority: 'low' | 'medium' | 'high';
  category: 'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | 'Startup';
  estimatedTime: number; // in hours
  status: 'todo' | 'inprogress' | 'completed';
  
  // AI Metrics (calculated or updated by AI Productivity Engine)
  priorityScore?: number; // 0-100
  urgencyScore?: number; // 0-100
  importanceScore?: number; // 0-100
  riskScore?: number; // 0-100
  aiRiskAnalysis?: string; // summary of risk/deadline conflict
}

export interface Milestone {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  targetWeek: string;
  dailyActions: string[];
}

export interface Goal {
  id: string;
  title: string; // e.g. "Crack Placement Interview"
  category: string;
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
}

export interface Habit {
  id: string;
  name: 'Coding' | 'Exercise' | 'Reading' | 'Meditation' | string;
  streak: number;
  consistencyScore: number; // percentage (0-100)
  completedDays: string[]; // List of YYYY-MM-DD strings
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  duration?: number; // in minutes
  type: 'task' | 'meeting' | 'goal' | 'deadline';
  priority?: 'low' | 'medium' | 'high';
}

export interface AIScheduleSuggestion {
  timeBlock: string; // e.g. "09:00 AM - 11:00 AM"
  taskId: string;
  taskTitle: string;
  type: string;
  actionReason: string;
}

export interface AIRecoveryPlan {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskExplanation: string;
  overloadDetected: boolean;
  recoverySteps: string[];
  optimizedSchedule: AIScheduleSuggestion[];
  weeklyOutlook: string;
}

export interface TaskBreakdown {
  id: string;
  taskTitle: string;
  roadmapSummary: string;
  estimatedTotalHours: number;
  subtasks: {
    id: string;
    title: string;
    estimatedHours: number;
    recommendedOrder: number;
    description: string;
    completed: boolean;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  suggestedAction?: {
    type: string;
    payload?: any;
    label: string;
  };
}

export interface ChatSession {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  messages: ChatMessage[];
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface UserPreferences {
  theme: "light" | "dark";
  themeFamily?: "default" | "purple" | "cyberpunk" | "emerald" | "sunset";
  emailNotifications?: boolean;
  dueTaskAlerts?: boolean;
  highRiskAlerts?: boolean;
  weeklyReports?: boolean;
  goalUpdates?: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  authProvider: "email" | "google";
  createdAt: string;
  lastLogin: string;
  profilePhoto?: string;
  role: string;
  preferences?: UserPreferences;
  sessionExpiry: string;
  bio?: string;
  timezone?: string;
  productiveTime?: string;
  workStyle?: string;
  focusGoals?: string;
}

export interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  type: 'due_alert' | 'high_risk' | 'missed_deadline' | 'weekly_report' | 'goal_update';
  sentAt: string;
  status: 'delivered' | 'pending' | 'failed';
  metadata?: any;
}


