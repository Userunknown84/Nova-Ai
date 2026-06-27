import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import AuthPages from "./components/AuthPages";
import DashboardView from "./components/DashboardView";
import TaskManagementView from "./components/TaskManagementView";
import CalendarView from "./components/CalendarView";
import GoalTrackerView from "./components/GoalTrackerView";
import HabitTrackerView from "./components/HabitTrackerView";
import AIPlannerView from "./components/AIPlannerView";
import SaveMyWeekView from "./components/SaveMyWeekView";
import HistoryAndInsights from "./components/HistoryAndInsights";
import SettingsView from "./components/SettingsView";
import ChatAssistant from "./components/ChatAssistant";
import NovaVoice from "./components/NovaVoice";
import Footer from "./components/Footer";
import { 
  Task, 
  Goal, 
  Habit, 
  ChatMessage, 
  ChatSession,
  TaskBreakdown, 
  AIRecoveryPlan,
  AIScheduleSuggestion,
  HistoryLog,
  UserProfile,
  UserPreferences,
  SentEmail
} from "./types";
import { Sparkles, LayoutGrid, CheckCircle2, User, Moon, Sun, AlertOctagon, LogOut, ChevronDown, Calendar, Target, Mic } from "lucide-react";
import { 
  auth, 
  db,
  fetchUserTasks, 
  saveUserTask, 
  updateUserTask, 
  deleteUserTask,
  fetchUserGoals,
  saveUserGoal,
  updateUserGoal,
  deleteUserGoal,
  fetchUserHabits,
  saveUserHabit,
  updateUserHabit,
  deleteUserHabit,
  syncUserProfile,
  seedDefaultUserData,
  fetchUserHistory,
  saveUserHistoryLog,
  fetchUserChats,
  saveUserChatSession,
  deleteUserChatSession,
  updateUserThemePreference,
  updateUserPreferences,
  fetchUserEmails,
  saveUserEmail,
  deleteUserEmail
} from "./lib/firebase";
import { 
  runAutomaticAlertChecks,
  generateTaskDueEmail,
  generateHighRiskEmail,
  generateMissedDeadlineEmail,
  generateWeeklyReportEmail
} from "./lib/notificationEngine";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import ThemeDropdown from "./components/ThemeDropdown";

export default function App() {
  // Theme Setup (defaults to Dark Cosmos Glass)
  const [themeFamily, setThemeFamily] = useState<'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset'>(() => {
    return (localStorage.getItem("nova_theme_preset") as any) || "default";
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("nova_theme_mode") as 'light' | 'dark') || "dark";
  });

  // User State - connected dynamically to Firebase Auth session
  const [user, setUser] = useState<{ name: string; email: string; uid?: string } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);

  // Root Navigation state
  const [view, setView] = useState<string>("landing");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);

  // Dynamic user data sets resolved from Firestore Database
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<SentEmail[]>([]);

  // Unified logging helper
  const logActivity = async (action: string, details: string) => {
    const newLog: HistoryLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setHistoryLogs((prev) => [newLog, ...prev].slice(0, 150)); // limit to 150 in state for performance
    
    // Check if we are logged in and not in demo mode
    if (auth.currentUser?.uid && !isDemoMode) {
      try {
        await saveUserHistoryLog(auth.currentUser.uid, action, details);
      } catch (err) {
        console.error("Failed to persist activity log to firestore:", err);
      }
    }
  };


  // Clear expired message when navigating away from authentication views
  useEffect(() => {
    if (!['auth_signin', 'auth_signup', 'auth_forgot'].includes(view)) {
      setExpiredMessage(null);
    }
  }, [view]);

  // Listen to Firebase Auth Session and Sync User Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setIsDemoMode(false);
          let name = firebaseUser.displayName || "";
          let email = firebaseUser.email || "";
          let sessionExpiry: string | null = null;
          
          let profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (!profileSnap.exists()) {
            const isGoogle = firebaseUser.providerData.some(p => p.providerId === "google.com");
            if (isGoogle) {
              const profile = await syncUserProfile(firebaseUser, name || undefined, "google");
              name = profile.fullName;
              email = profile.email;
              sessionExpiry = profile.sessionExpiry;
            } else {
              // Wait for AuthPages signup process to finish writing the profile document
              let retries = 6;
              while (retries > 0 && !profileSnap.exists()) {
                await new Promise(resolve => setTimeout(resolve, 500));
                profileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
                retries--;
              }
              
              if (profileSnap.exists()) {
                const data = profileSnap.data();
                name = data.fullName || name;
                email = data.email || email;
                sessionExpiry = data.sessionExpiry || null;
              } else {
                const profile = await syncUserProfile(firebaseUser, name || undefined, "email");
                name = profile.fullName;
                email = profile.email;
                sessionExpiry = profile.sessionExpiry;
              }
            }
          } else {
            const data = profileSnap.data();
            name = data.fullName || name;
            email = data.email || email;
            sessionExpiry = data.sessionExpiry || null;
            
            // Restore theme preferences from Firestore
            if (data?.preferences) {
              if (data.preferences.themeFamily) {
                setThemeFamily(data.preferences.themeFamily as any);
                localStorage.setItem("nova_theme_preset", data.preferences.themeFamily);
              }
              if (data.preferences.theme) {
                setTheme(data.preferences.theme as any);
                localStorage.setItem("nova_theme_mode", data.preferences.theme);
              }
            }
          }

          // Secure 7-day Session Auto-logout Check
          if (sessionExpiry) {
            const expiryTime = new Date(sessionExpiry).getTime();
            const nowTime = new Date().getTime();
            if (nowTime > expiryTime) {
              await signOut(auth);
              setExpiredMessage("Your session has expired. Please sign in again.");
              setUser(null);
              setTasks([]);
              setGoals([]);
              setHabits([]);
              setView("auth_signin");
              setLoadingSession(false);
              return;
            }
          }

          setUser({ name, email, uid: firebaseUser.uid });
          
          // Fetch User specific tasks, goals, habits, and history
          const userTasks = await fetchUserTasks(firebaseUser.uid);
          const userGoals = await fetchUserGoals(firebaseUser.uid);
          const userHabits = await fetchUserHabits(firebaseUser.uid);
          const userHistory = await fetchUserHistory(firebaseUser.uid);
          const userEmails = await fetchUserEmails(firebaseUser.uid);

          setTasks(userTasks);
          setGoals(userGoals);
          setHabits(userHabits);
          setEmails(userEmails);

          // Build or populate the user profile state
          const refreshedProfileSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (refreshedProfileSnap.exists()) {
            const data = refreshedProfileSnap.data();
            setUserProfile({
              uid: firebaseUser.uid,
              fullName: data.fullName || name,
              email: data.email || email,
              authProvider: data.authProvider || "email",
              createdAt: data.createdAt || new Date().toISOString(),
              lastLogin: data.lastLogin || new Date().toISOString(),
              profilePhoto: data.profilePhoto || "",
              role: data.role || "user",
              sessionExpiry: data.sessionExpiry || "",
              bio: data.bio || "",
              timezone: data.timezone || "UTC",
              productiveTime: data.productiveTime || "Morning",
              workStyle: data.workStyle || "Pomodoro",
              focusGoals: data.focusGoals || "",
              preferences: data.preferences || {
                theme: theme,
                themeFamily: themeFamily,
                emailNotifications: true,
                dueTaskAlerts: true,
                highRiskAlerts: true,
                weeklyReports: true,
                goalUpdates: true
              }
            });
          }

          if (userHistory.length === 0) {
            try {
              await saveUserHistoryLog(firebaseUser.uid, "Account Created", "Nova AI premium workspace initialized");
              await saveUserHistoryLog(firebaseUser.uid, "Logged In", "Session established successfully");
              const freshHistory = await fetchUserHistory(firebaseUser.uid);
              setHistoryLogs(freshHistory);
            } catch (err) {
              console.error("Failed to seed initial user logs", err);
              setHistoryLogs([]);
            }
          } else {
            setHistoryLogs(userHistory);
          }

          // Route to dashboard
          setView("dashboard");
        } catch (err) {
          console.error("Error during session recovery and state sync:", err);
        }
      } else {
        // User logged out
        setIsDemoMode(curr => {
          if (!curr) {
            setUser(null);
            setTasks([]);
            setGoals([]);
            setHabits([]);
            setView("landing");
          }
          return curr;
        });
      }
      setLoadingSession(false);
    });

    return () => unsubscribe();
  }, []);

  // AI Planner States
  const [activeBreakdown, setActiveBreakdown] = useState<TaskBreakdown | null>(null);
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<AIScheduleSuggestion[]>([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // Save My Week Emergency stats
  const [recoveryPlan, setRecoveryPlan] = useState<AIRecoveryPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Nova Voice Assistant open state
  const [isNovaVoiceOpen, setIsNovaVoiceOpen] = useState(false);

  // Chat conversation threads state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Load chat sessions on log in or isDemoMode change
  useEffect(() => {
    const loadChats = async () => {
      if (user?.uid && !isDemoMode) {
        try {
          const fetched = await fetchUserChats(user.uid);
          setChatSessions(fetched);
          if (fetched.length > 0) {
            // Restore most recent conversation by default
            setActiveChatId(fetched[0].id);
            setMessages(fetched[0].messages);
          } else {
            setActiveChatId(null);
            setMessages([]);
          }
        } catch (err) {
          console.error("Error loading chat history:", err);
        }
      } else {
        // Load from local storage for demo/offline seamless experience
        const local = localStorage.getItem("nova_chats");
        if (local) {
          try {
            const parsed = JSON.parse(local) as ChatSession[];
            setChatSessions(parsed);
            if (parsed.length > 0) {
              setActiveChatId(parsed[0].id);
              setMessages(parsed[0].messages);
            } else {
              setActiveChatId(null);
              setMessages([]);
            }
          } catch (_) {}
        } else {
          setChatSessions([]);
          setActiveChatId(null);
          setMessages([]);
        }
      }
    };
    loadChats();
  }, [user, isDemoMode]);

  const saveChatSessionState = async (chatId: string, updatedMessages: ChatMessage[]) => {
    const lastMsg = updatedMessages[updatedMessages.length - 1];
    const updatedSession: ChatSession = {
      id: chatId,
      message: lastMsg ? lastMsg.text : "",
      sender: lastMsg ? lastMsg.sender : "user",
      timestamp: new Date().toISOString(),
      messages: updatedMessages
    };

    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== chatId);
      const newSessions = [updatedSession, ...filtered];
      if (!user?.uid || isDemoMode) {
        localStorage.setItem("nova_chats", JSON.stringify(newSessions));
      }
      return newSessions;
    });

    if (user?.uid && !isDemoMode) {
      try {
        await saveUserChatSession(user.uid, updatedSession);
      } catch (err) {
        console.error("Failed to save chat to Firestore:", err);
      }
    }
  };

  const handleSelectChatSession = (session: ChatSession) => {
    setActiveChatId(session.id);
    setMessages(session.messages);
  };

  const handleDeleteChatSession = async (chatId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== chatId);
      if (!user?.uid || isDemoMode) {
        localStorage.setItem("nova_chats", JSON.stringify(filtered));
      }
      return filtered;
    });

    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }

    if (user?.uid && !isDemoMode) {
      try {
        await deleteUserChatSession(user.uid, chatId);
      } catch (err) {
        console.error("Error deleting chat session:", err);
      }
    }
  };

  const handleStartNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleThemeChange = async (preset: 'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset', mode: 'light' | 'dark') => {
    setThemeFamily(preset);
    setTheme(mode);
    localStorage.setItem("nova_theme_preset", preset);
    localStorage.setItem("nova_theme_mode", mode);
    
    if (user?.uid && !isDemoMode) {
      try {
        await updateUserThemePreference(user.uid, mode, preset);
      } catch (err) {
        console.error("Failed to persist theme preset to Firestore:", err);
      }
    }
  };

  const handlePresetChange = (preset: 'default' | 'purple' | 'cyberpunk' | 'emerald' | 'sunset') => {
    handleThemeChange(preset, theme);
  };

  const toggleTheme = () => {
    const nextMode = theme === 'light' ? 'dark' : 'light';
    handleThemeChange(themeFamily, nextMode);
  };

  // --- AUTOMATED NOTIFICATIONS & SIMULATION ENGINE ---

  const handleUpdateUserPreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (auth.currentUser && !isDemoMode) {
      try {
        await updateUserPreferences(auth.currentUser.uid, newPrefs);
        setUserProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            preferences: {
              ...prev.preferences,
              ...newPrefs
            }
          };
        });
        logActivity("Preferences Synced", "User notification alarm parameters updated inside Firestore.");
      } catch (err) {
        console.error("Failed to persist user preferences to firestore:", err);
      }
    } else {
      setUserProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...newPrefs
          }
        };
      });
    }
  };

  const handleUpdateUserProfileData = async (profileData: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...profileData
      };
    });
    // Update root level user name if changed
    if (profileData.fullName) {
      setUser(prev => prev ? { ...prev, name: profileData.fullName! } : null);
    }
    
    if (user?.uid && !isDemoMode) {
      try {
        const { updateUserProfile } = await import("./lib/firebase");
        await updateUserProfile(user.uid, profileData);
        logActivity("Profile Updated", "User info registers synced with Firestore registry.");
      } catch (err) {
        console.error("Failed to persist user profile changes to firestore:", err);
      }
    } else {
      logActivity("Profile Updated (Demo)", "Demo sandbox profile telemetry updated in-memory.");
    }
  };

  const handleClearEmails = async () => {
    if (auth.currentUser && !isDemoMode) {
      try {
        for (const e of emails) {
          await deleteUserEmail(auth.currentUser.uid, e.id);
        }
        setEmails([]);
        logActivity("Emails Purged", "Sent email notifications history completely wiped.");
      } catch (err) {
        console.error("Failed to wipe user emails", err);
      }
    } else {
      setEmails([]);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (auth.currentUser && !isDemoMode) {
      try {
        await deleteUserEmail(auth.currentUser.uid, emailId);
        setEmails((prev) => prev.filter((e) => e.id !== emailId));
      } catch (err) {
        console.error("Failed to delete email", err);
      }
    } else {
      setEmails((prev) => prev.filter((e) => e.id !== emailId));
    }
  };

  const handleTriggerSimulation = async (type: 'due_alert' | 'high_risk' | 'missed' | 'weekly' | 'goal_update') => {
    const recipientEmail = user?.email || "sarah@gmail.com";
    let subject = "";
    let body = "";

    const sampleTask: Task = tasks[0] || {
      id: "sample-task",
      title: "Consolidate Design Presentation and System Code",
      category: "work",
      deadline: new Date(Date.now() + 15 * 3600000).toISOString(),
      priority: "high",
      status: "pending",
      estimatedTime: 3,
      riskScore: 85,
      aiRiskAnalysis: "Multiple conflicting deadlines with high work-hour workloads."
    };

    if (type === 'due_alert') {
      const res = generateTaskDueEmail(sampleTask, 12, recipientEmail);
      subject = res.subject;
      body = res.body;
    } else if (type === 'high_risk') {
      const res = generateHighRiskEmail(
        sampleTask, 
        85, 
        "Elevated work density across overlapping project deliverables.", 
        "Protect dedicated focus coding blocks by pushing out administrative tasks.", 
        [
          "Lock focus workspace blocks during early weekday mornings.",
          "Postpone minor non-essential studies to protect primary performance outputs.",
          "Insert a 1-hour mindfulness pacing buffer following 2 hours of solid build code sprints."
        ], 
        recipientEmail
      );
      subject = res.subject;
      body = res.body;
    } else if (type === 'missed') {
      const res = generateMissedDeadlineEmail(
        sampleTask, 
        recipientEmail, 
        [
          "Initiate an emergency 90-minute study or coding sprint today.",
          "Reschedule secondary startup tasks to preserve primary milestone health.",
          "Record your progress update within the Workspace immediately to maintain streak indicators."
        ]
      );
      subject = res.subject;
      body = res.body;
    } else if (type === 'weekly') {
      const res = generateWeeklyReportEmail(
        recipientEmail,
        tasks.filter(t => t.status === 'completed').length || 7,
        tasks.filter(t => t.status !== 'completed' && new Date(t.deadline || "").getTime() < Date.now()).length || 2,
        tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 78,
        [
          "Shed low-urgency study tasks during early week intervals.",
          "Increase routine habit intervals to maintain a high stress tolerance factor.",
          "Initiate peak concentration trackers periodically."
        ]
      );
      subject = res.subject;
      body = res.body;
    } else if (type === 'goal_update') {
      subject = `🎯 Nova Goal Progress Synced: Milestone Completed!`;
      body = `
        <div style="background-color: #0c081e; color: #ffffff; font-family: sans-serif; padding: 32px 16px; border-radius: 20px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <h1 style="font-size: 20px; font-weight: 900; color: #10b981;">Milestone Confirmed!</h1>
          <p style="font-size: 13px; color: #d4d4d8; line-height: 1.5; margin: 12px 0;">Awesome progress. You've hit the criteria check for your active goal. Keep up the high concentration sprints!</p>
          <div style="font-size: 32px; margin: 16px 0;">🔥</div>
          <p style="font-size: 10px; color: #52525b;">Nova Goal Analytics Active</p>
        </div>
      `;
    }

    const mappedType: "due_alert" | "high_risk" | "missed_deadline" | "weekly_report" | "goal_update" = 
      type === 'missed' ? 'missed_deadline' : 
      type === 'weekly' ? 'weekly_report' : 
      type;

    const emailObj = {
      recipient: recipientEmail,
      subject,
      body,
      type: mappedType,
      sentAt: new Date().toISOString(),
      status: "delivered" as const,
      metadata: { taskId: sampleTask.id }
    };

    if (auth.currentUser && !isDemoMode) {
      const savedId = await saveUserEmail(auth.currentUser.uid, emailObj);
      setEmails((prev) => [
        { ...emailObj, id: savedId } as SentEmail,
        ...prev
      ].slice(0, 150));
      logActivity("Simulated Email Sent", `Simulation log dispatched to user email directory.`);
    } else {
      const demoId = `email-${Date.now()}`;
      setEmails((prev) => [
        { ...emailObj, id: demoId } as SentEmail,
        ...prev
      ].slice(0, 150));
    }
  };

  useEffect(() => {
    if (!auth.currentUser || isDemoMode || tasks.length === 0) return;

    const runAlertChecks = async () => {
      try {
        const uPrefs = userProfile?.preferences || {
          emailNotifications: true,
          dueTaskAlerts: true,
          highRiskAlerts: true,
          weeklyReports: true,
          goalUpdates: true
        };
        const activeUserId = auth.currentUser!.uid;
        const recipientEmail = user?.email || auth.currentUser!.email || "sarah@gmail.com";
        
        const count = await runAutomaticAlertChecks(activeUserId, recipientEmail, tasks, uPrefs, emails);
        if (count > 0) {
          const freshEmails = await fetchUserEmails(activeUserId);
          setEmails(freshEmails);
          logActivity("System Notification Run", `Checked deadlines; automatically dispatched ${count} threat/due warnings.`);
        }
      } catch (err) {
        console.error("Error running automatic deadline notification checks:", err);
      }
    };

    const timeout = setTimeout(runAlertChecks, 5000);
    const interval = setInterval(runAlertChecks, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [tasks, userProfile, emails, isDemoMode, user]);

  // 1. API Action: Decompose ambiguous goals
  const handleTriggerBreakdown = async (title: string, hours: number) => {
    setIsGeneratingBreakdown(true);
    logActivity("AI Task Decomposed", `Decomposed "${title}" into tactical milestones`);
    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, hours })
      });
      const data = await response.json();
      setActiveBreakdown(data);
    } catch (err) {
      console.error("AI breakdown request failed. Simulating.", err);
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  // 2. Action Trigger for single task breakdown loop
  const handleDecomposeTaskItem = (task: Task) => {
    setView("planner");
    handleTriggerBreakdown(task.title, task.estimatedTime * 2);
  };

  // 3. API Action: Smart 24h Scheduler suggestions
  const handleGenerateSmartSchedule = async () => {
    setIsGeneratingSchedule(true);
    logActivity("AI Schedule Optimized", "Calculated peak focus blocks for active commitments");
    // Simulate smart calculation delays
    setTimeout(() => {
      const suggestions: AIScheduleSuggestion[] = [
        {
          timeBlock: "Today 09:00 AM - 11:59 AM",
          taskId: "t1",
          taskTitle: "Stanford ML Lecture 4 Draft",
          type: "Deep Focus",
          actionReason: "Aligned with your peak performance peak before academic stress levels increase."
        },
        {
          timeBlock: "Today 02:00 PM - 03:30 PM",
          taskId: "t2",
          taskTitle: "Review Angel Seed round Term Sheets",
          type: "Critical Review",
          actionReason: "Sequence structured after lunch during standard cognitive stabilization buffers."
        },
        {
          timeBlock: "Today 04:30 PM - 05:00 PM",
          taskId: "h2",
          taskTitle: "15-Min Cardio Sprint",
          type: "Pacing Buffer",
          actionReason: "Required pacing interval to secure cognitive strength before evening homework files."
        }
      ];
      setScheduleSuggestions(suggestions);
      setIsGeneratingSchedule(false);
    }, 1200);
  };

  // 4. API Action: Save My Week stabilized controller
  const handleGenerateSavePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch("/api/ai/save-my-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks })
      });
      const data = await response.json();
      setRecoveryPlan(data);
    } catch (err) {
      console.error("AI emergency plan failed", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 5. API Action: Chat Thread messaging
  const handleSendMessage = async (text: string, isVoice = false) => {
    const chatId = activeChatId || `c-${Date.now()}`;
    if (!activeChatId) {
      setActiveChatId(chatId);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsSendingMessage(true);

    // Save user message immediately to state and firestore
    await saveChatSessionState(chatId, nextMessages);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json();

      let finalMessages = [...nextMessages];

      // If voice input parsing auto-created a task!
      if (isVoice) {
        try {
          const voiceRes = await fetch("/api/ai/process-voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: text })
          });
          const voiceData = await voiceRes.json();
          if (voiceData.parsedTask) {
            const newTask: Task = {
              id: `t-${Date.now()}`,
              ...voiceData.parsedTask,
              status: 'todo',
              priorityScore: 78,
              urgencyScore: 80,
              importanceScore: 75,
              riskScore: 50,
              aiRiskAnalysis: "Automatically created via spoken voice prompt."
            };
            setTasks(prev => [newTask, ...prev]);
            
            // push confirmation message
            const sysMsg: ChatMessage = {
              id: `sys-${Date.now()}`,
              sender: 'assistant',
              text: `🎯 Sparkles! I classified your speech transcript and automatically initialized the task node: "${newTask.title}" inside the Workspace!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            finalMessages.push(sysMsg);
          }
        } catch (_) {}
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: data.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction ? {
          type: data.suggestedAction.type.toUpperCase() as any,
          label: data.suggestedAction.label
        } : undefined
      };

      finalMessages.push(assistantMsg);
      setMessages(finalMessages);
      
      // Save final response state to firestore and cache
      await saveChatSessionState(chatId, finalMessages);
    } catch (err) {
      console.error("AI chat failed", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Helper to add any voice transcript or Nova voice reply to the chatbot conversation
  const handleAddChatMessage = async (text: string, sender: 'user' | 'assistant', isVoice = false) => {
    const chatId = activeChatId || `c-${Date.now()}`;
    if (!activeChatId) {
      setActiveChatId(chatId);
    }
    const newMsg: ChatMessage = {
      id: `${sender[0]}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice
    };

    setMessages(prev => {
      const next = [...prev, newMsg];
      saveChatSessionState(chatId, next).catch(err => {
        console.error("Failed to sync voice chat message state:", err);
      });
      return next;
    });
  };

  // Apply Action triggered from Chat suggested chips
  const handleApplySuggestedAction = (actionType: string, payload?: any) => {
    if (actionType === 'SAVE_MY_WEEK' || actionType === 'save_my_week') {
      setView('save_my_week');
      handleGenerateSavePlan();
    } else if (actionType === 'CREATE_TASK' || actionType === 'create_task') {
      setView('tasks');
    }
  };

  // State Updates: Add Commitment Task
  const handleAddTask = async (taskDetails: Omit<Task, 'id'>) => {
    const tempId = `t-temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      ...taskDetails,
      priorityScore: taskDetails.priority === 'high' ? 90 : taskDetails.priority === 'medium' ? 65 : 30,
      urgencyScore: 70,
      importanceScore: taskDetails.priority === 'high' ? 85 : 55,
      riskScore: 40,
      aiRiskAnalysis: "Awaiting workspace scheduling metrics."
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity("Task Created", taskDetails.title);

    if (user?.uid && !isDemoMode) {
      try {
        const realId = await saveUserTask(user.uid, {
          title: newTask.title,
          description: newTask.description,
          deadline: newTask.deadline,
          priority: newTask.priority,
          category: newTask.category,
          estimatedTime: newTask.estimatedTime,
          status: newTask.status,
          priorityScore: newTask.priorityScore,
          urgencyScore: newTask.urgencyScore,
          importanceScore: newTask.importanceScore,
          riskScore: newTask.riskScore,
          aiRiskAnalysis: newTask.aiRiskAnalysis
        });
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: realId } : t));
      } catch (err) {
        console.error("Firestore save task error:", err);
      }
    }
  };

  // State Updates: Edit / Update status / Toggle completed
  const handleEditTask = async (id: string, updated: Partial<Task>) => {
    const existingTask = tasks.find(t => t.id === id);
    const title = existingTask?.title || "Commitment";
    
    if (updated.status === 'completed') {
      logActivity("Task Completed", title);
    } else if (updated.status === 'inprogress') {
      logActivity("Task Started", title);
    } else {
      logActivity("Task Updated", title);
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));

    if (user?.uid && !isDemoMode && !id.startsWith("t-temp-")) {
      try {
        await updateUserTask(user.uid, id, updated);
      } catch (err) {
        console.error("Firestore edit task error:", err);
      }
    }
  };

  // State Updates: Delete Commitment
  const handleDeleteTask = async (id: string) => {
    const existingTask = tasks.find(t => t.id === id);
    logActivity("Task Deleted", existingTask?.title || "Commitment");

    setTasks(prev => prev.filter(t => t.id !== id));

    if (user?.uid && !isDemoMode && !id.startsWith("t-temp-")) {
      try {
        await deleteUserTask(user.uid, id);
      } catch (err) {
        console.error("Firestore delete task error:", err);
      }
    }
  };

  // State Updates: Add dynamic Custom Goal
  const handleAddGoal = async (title: string, category: string, targetDate: string, milestones: any[]) => {
    const tempId = `g-temp-${Date.now()}`;
    const newGoal: Goal = {
      id: tempId,
      title,
      category,
      targetDate,
      progress: 0,
      milestones
    };
    setGoals(prev => [newGoal, ...prev]);
    logActivity("Goal Created", title);

    if (user?.uid && !isDemoMode) {
      try {
        const realId = await saveUserGoal(user.uid, {
          title,
          category,
          targetDate,
          progress: 0,
          milestones
        });
        setGoals(prev => prev.map(g => g.id === tempId ? { ...g, id: realId } : g));
      } catch (err) {
        console.error("Firestore save goal error:", err);
      }
    }
  };

  // State Updates: Toggle milestones completes and recalculate total progress
  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    let updatedGoal: Goal | null = null;
    const existingGoal = goals.find(g => g.id === goalId);
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;

      const updatedMilestones = g.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );

      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progressPercent = Math.round((completedCount / updatedMilestones.length) * 100);

      updatedGoal = {
        ...g,
        milestones: updatedMilestones,
        progress: progressPercent
      };
      
      const modifiedMilestone = g.milestones.find(m => m.id === milestoneId);
      if (modifiedMilestone) {
        const isNowCompleted = !modifiedMilestone.completed;
        const statusVerb = isNowCompleted ? "completed" : "uncompleted";
        logActivity("Goal Milestone Updated", `${g.title}: marked milestone "${modifiedMilestone.title}" as ${statusVerb}`);
        
        // Dispatch real-time simulated email on completing goal milestones
        if (isNowCompleted && (userProfile?.preferences?.goalUpdates !== false)) {
          handleTriggerSimulation('goal_update');
        }
      }

      return updatedGoal;
    }));

    if (user?.uid && !isDemoMode && !goalId.startsWith("g-temp-")) {
      try {
        setTimeout(async () => {
          if (updatedGoal) {
            await updateUserGoal(user!.uid!, goalId, {
              milestones: (updatedGoal as Goal).milestones,
              progress: (updatedGoal as Goal).progress
            });
          }
        }, 0);
      } catch (err) {
        console.error("Firestore toggle milestone error:", err);
      }
    }
  };

  // Delete Objective Goal
  const handleDeleteGoal = async (id: string) => {
    const existingGoal = goals.find(g => g.id === id);
    logActivity("Goal Deleted", existingGoal?.title || "Goal");

    setGoals(prev => prev.filter(g => g.id !== id));

    if (user?.uid && !isDemoMode && !id.startsWith("g-temp-")) {
      try {
        await deleteUserGoal(user.uid, id);
      } catch (err) {
        console.error("Firestore delete goal error:", err);
      }
    }
  };

  // State Updates: Toggle Habit Tile completed days & recalculate streak and consistency
  const handleToggleHabitDay = async (habitId: string, dayStr: string) => {
    let updatedHabit: Habit | null = null;
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;

      const isRecorded = h.completedDays.includes(dayStr);
      let updatedDays = [];
      if (isRecorded) {
        updatedDays = h.completedDays.filter(d => d !== dayStr);
        logActivity("Habit Untracked", `${h.name} unmarked for ${dayStr}`);
      } else {
        updatedDays = [...h.completedDays, dayStr];
        logActivity("Habit Checked", `${h.name} completed for ${dayStr}`);
      }

      // Calculate streak (consecutive preceding completions up to June 22, 2026)
      let streakCount = 0;
      for (let i = 0; i < 30; i++) {
        const checkD = new Date(2026, 5, 22 - i);
        const checkStr = `${checkD.getFullYear()}-${String(checkD.getMonth() + 1).padStart(2, '0')}-${String(checkD.getDate()).padStart(2, '0')}`;
        if (updatedDays.includes(checkStr)) {
          streakCount++;
        } else {
          break;
        }
      }

      // Consistency percentage based on past 14 days
      const past14 = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(2026, 5, 22 - i);
        past14.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
      const completionsCount = past14.filter(d => updatedDays.includes(d)).length;
      const consistencyScore = Math.round((completionsCount / 14) * 100);

      updatedHabit = {
        ...h,
        completedDays: updatedDays,
        streak: streakCount,
        consistencyScore
      };
      return updatedHabit;
    }));

    if (user?.uid && !isDemoMode && !habitId.startsWith("h-temp-")) {
      try {
        setTimeout(async () => {
          if (updatedHabit) {
            await updateUserHabit(user!.uid!, habitId, {
              completedDays: updatedHabit.completedDays,
              streak: updatedHabit.streak,
              consistencyScore: updatedHabit.consistencyScore
            });
          }
        }, 0);
      } catch (err) {
        console.error("Firestore toggle habit error:", err);
      }
    }
  };

  // Bootstrap Core Habits for New User accounts
  const handleBootstrapHabits = async () => {
    const defaultNames = ["Coding Practice", "Exercise", "Reading", "Meditation"];
    const bootstrappedList: Habit[] = [];
    
    if (user?.uid && !isDemoMode) {
      try {
        for (const name of defaultNames) {
          const habitData = {
            name,
            streak: 0,
            consistencyScore: 0,
            completedDays: []
          };
          const realId = await saveUserHabit(user.uid, habitData);
          bootstrappedList.push({ id: realId, ...habitData });
        }
        setHabits(bootstrappedList);
        await logActivity("Habits Bootstrapped", "Core habits set up successfully");
      } catch (err) {
        console.error("Failed to bootstrap habits in Firestore:", err);
      }
    } else {
      defaultNames.forEach((name, i) => {
        bootstrappedList.push({
          id: `h-bootstrap-${i}`,
          name,
          streak: 0,
          consistencyScore: 0,
          completedDays: []
        });
      });
      setHabits(bootstrappedList);
      logActivity("Habits Bootstrapped", "Core habits set up in-memory");
    }
  };

  // Handle user credentials update and persist to localStorage
  const handleUpdateUser = (updatedUser: { name: string; email: string }) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : { ...updatedUser });
  };

  // Setup landing views transitions
  const handleEnterWorkspace = () => {
    setIsDemoMode(true);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const demoUser = { 
      name: `NovaDemo_${randomSuffix}`, 
      email: `demo_${randomSuffix}@nova.ai`,
      uid: `demo_guest_${randomSuffix}` 
    };
    setUser(demoUser);

    setUserProfile({
      uid: demoUser.uid,
      fullName: demoUser.name,
      email: demoUser.email,
      authProvider: "email",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: "user",
      sessionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bio: "SaaS & AI Dev from San Francisco.",
      timezone: "PST",
      productiveTime: "Night Owl",
      workStyle: "Pomodoro",
      focusGoals: "Crack placement interviews, build AI agent products.",
      profilePhoto: "",
      preferences: {
        theme: theme,
        themeFamily: themeFamily,
        emailNotifications: true,
        dueTaskAlerts: true,
        highRiskAlerts: true,
        weeklyReports: true,
        goalUpdates: true
      }
    });

    // Preload realistic sample data
    const tomorrowStr = new Date();
    tomorrowStr.setDate(tomorrowStr.getDate() + 1);
    const tomorrowStrFormatted = tomorrowStr.toISOString().split('T')[0];

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysLaterFormatted = threeDaysLater.toISOString().split('T')[0];

    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
    const fiveDaysLaterFormatted = fiveDaysLater.toISOString().split('T')[0];

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterFormatted = sevenDaysLater.toISOString().split('T')[0];

    setTasks([
      {
        id: "demo-t1",
        title: "Machine Learning Assignment",
        description: "Complete the backpropagation and gradient descent problems.",
        deadline: tomorrowStrFormatted,
        priority: "high",
        category: "Study",
        estimatedTime: 3.5,
        status: "todo",
        priorityScore: 92,
        urgencyScore: 95,
        importanceScore: 89,
        riskScore: 78,
        aiRiskAnalysis: "High structural complexity. Plan scheduled prior to career placement goals."
      },
      {
        id: "demo-t2",
        title: "Placement Interview Preparation",
        description: "Revise core data structures, algorithms, and system design principles.",
        deadline: threeDaysLaterFormatted,
        priority: "high",
        category: "Study",
        estimatedTime: 5,
        status: "inprogress",
        priorityScore: 88,
        urgencyScore: 78,
        importanceScore: 92,
        riskScore: 60,
        aiRiskAnalysis: "Multi-hour dedication required. High correlation with quarterly placement goals."
      },
      {
        id: "demo-t3",
        title: "React Project Submission",
        description: "Optimize performance, integrate responsive animations, and build portfolio modules.",
        deadline: fiveDaysLaterFormatted,
        priority: "medium",
        category: "Work",
        estimatedTime: 4,
        status: "todo",
        priorityScore: 70,
        urgencyScore: 60,
        importanceScore: 75,
        riskScore: 45,
        aiRiskAnalysis: "Visual fidelity improvements scheduled. Low structural risk."
      },
      {
        id: "demo-t4",
        title: "Electricity Bill Payment",
        description: "Pay outstanding utilities invoice before the billing cycle expiration.",
        deadline: sevenDaysLaterFormatted,
        priority: "low",
        category: "Finance",
        estimatedTime: 0.5,
        status: "todo",
        priorityScore: 45,
        urgencyScore: 35,
        importanceScore: 50,
        riskScore: 20,
        aiRiskAnalysis: "Simple administrative task-blocking minimized."
      }
    ]);

    setGoals([
      {
        id: "demo-g1",
        title: "Crack Placement Interview",
        category: "Career Development",
        targetDate: "2026-09-30",
        progress: 20,
        milestones: [
          { 
            id: "dm-g1-m1", 
            title: "Complete 100 coding challenges", 
            deadline: tomorrowStrFormatted, 
            completed: true, 
            targetWeek: "Week 1-3", 
            dailyActions: ["Resolve dynamic programming cards", "Inspect recursive call bounds"] 
          },
          { 
            id: "dm-g1-m2", 
            title: "Mock interview with industry mentors", 
            deadline: "2026-08-30", 
            completed: false, 
            targetWeek: "Week 4-7", 
            dailyActions: ["Draft system designs for distributed caches", "Review ACID compliance properties"] 
          }
        ]
      },
      {
        id: "demo-g2",
        title: "Build Portfolio Website",
        category: "Personal Brand",
        targetDate: "2026-07-20",
        progress: 50,
        milestones: [
          { 
            id: "dm-g2-m1", 
            title: "Design mockup UI/UX slides", 
            deadline: "2026-07-05", 
            completed: true, 
            targetWeek: "Week 1", 
            dailyActions: ["Select modern display typography", "Design dark ambient CSS grids"] 
          },
          { 
            id: "dm-g2-m2", 
            title: "Develop responsive React structures", 
            deadline: "2026-07-20", 
            completed: false, 
            targetWeek: "Week 2", 
            dailyActions: ["Configure lazy page triggers", "Refactor interactive widget elements"] 
          }
        ]
      }
    ]);

    setHabits([
      {
        id: "demo-h1",
        name: "Coding Practice",
        streak: 7,
        consistencyScore: 95,
        completedDays: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19", "2026-06-18", "2026-06-17", "2026-06-16"]
      },
      {
        id: "demo-h2",
        name: "Exercise",
        streak: 3,
        consistencyScore: 80,
        completedDays: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-18"]
      }
    ]);

    setHistoryLogs([
      {
        id: "demo-log-1",
        timestamp: new Date().toISOString(),
        action: "Logged In",
        details: "Session established successfully (Demo mode)"
      },
      {
        id: "demo-log-2",
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        action: "Habit Checked",
        details: "Checked off habit Coding Practice"
      },
      {
        id: "demo-log-3",
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        action: "Task Updated",
        details: "Marked task Placement Interview Preparation as IN PROGRESS"
      },
      {
        id: "demo-log-4",
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        action: "Goal Created",
        details: "Crack Placement Interview"
      },
      {
        id: "demo-log-5",
        timestamp: new Date(Date.now() - 3600000 * 31).toISOString(),
        action: "Account Created",
        details: "Nova AI premium workspace initialized"
      }
    ]);

    setView("dashboard");
  };

  // Login flow switches with active local session writes
  const handleLogin = (name: string, email: string) => {
    // Session state listening will handle setView and setUser
  };

  // Sign out flow with active local session clearances
  const handleSignout = async () => {
    setIsDemoMode(false);
    setUser(null);
    setTasks([]);
    setGoals([]);
    setHabits([]);
    setHistoryLogs([]);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Sign Out Error:", err);
    }
  };

  // User Session Redirection Router Heuristic
  useEffect(() => {
    if (user) {
      if (['landing', 'auth_signin', 'auth_signup', 'auth_forgot'].includes(view)) {
        setView("dashboard");
      }
    } else {
      if (!['landing', 'auth_signin', 'auth_signup', 'auth_forgot'].includes(view)) {
        setView("landing");
      }
    }
  }, [user, view]);

  // Sync index styles based on theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Dynamic precise clearing of old themes
    Array.from(root.classList).forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });
    root.classList.add(`theme-${themeFamily}-${theme}`);
  }, [theme, themeFamily]);

  // Layout Renders
  if (loadingSession) {
    return (
      <div className={`min-h-screen w-screen flex flex-col items-center justify-center font-sans transition-colors duration-200
        ${theme === 'dark' ? 'bg-[#050508] text-white' : 'bg-slate-50 text-slate-900'}
      `} id="mainframe-session-loader">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center col-span-1">
            <span className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <Sparkles size={16} className="absolute text-indigo-400 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-xs font-mono font-bold tracking-widest uppercase opacity-80 animate-pulse">Synchronizing Session</p>
            <p className="text-[10px] font-mono opacity-55">Connecting to Nova Mainframe...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex select-none theme-${themeFamily}-${theme}
      ${theme === 'dark' 
        ? 'bg-[#050508] text-zinc-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]' 
        : 'bg-slate-50 text-slate-900'
      }
    `} id="main-layout-root">
      
      {/* LANDING VIEW ENVELOPE (fully self-contained, elegant) */}
      {view === 'landing' && (
        <LandingPage 
          onGetStarted={() => setView(user ? "dashboard" : "auth_signin")} 
          onTryDemo={handleEnterWorkspace} 
          theme={theme}
        />
      )}

      {/* AUTH PAGES */}
      {['auth_signin', 'auth_signup', 'auth_forgot'].includes(view) && (
        <AuthPages 
          initialView={
            view === 'auth_signup' 
              ? 'signup' 
              : view === 'auth_forgot' 
                ? 'forgot' 
                : 'signin'
          }
          onAuthSuccess={({ name, email }) => handleLogin(name, email)}
          onBackToLanding={() => setView('landing')}
          theme={theme}
          expiredMessage={expiredMessage}
        />
      )}

      {/* MAIN LAYOUT CANVAS WITH SIDEBAR NAVIGATION */}
      {!['landing', 'auth_signin', 'auth_signup', 'auth_forgot'].includes(view) && (
        <>
          {/* Elegant Frosted Sidebar */}
          <Sidebar 
            currentView={view === 'save_my_week' ? 'save-week' : view} 
            setCurrentView={(nextView) => setView(nextView === 'save-week' ? 'save_my_week' : nextView)} 
            user={user} 
            profilePhoto={userProfile?.profilePhoto}
            onSignOut={handleSignout}
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* View Container Area */}
          <main className="flex-1 p-6 md:p-10 pb-24 lg:pb-10 overflow-y-auto max-w-(screen-xl) mx-auto w-full relative">
            
            {/* Top Bar Workspace Header indicators */}
            <div className="flex justify-between items-center mb-8 pb-5 border-b border-white/5 font-sans text-xs">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 cursor-pointer"
                  id="mobile-sidebar-toggle-btn"
                >
                  <LayoutGrid size={15} />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Space Node:</span>
                  <strong className="font-bold flex items-center gap-1">
                    <span>Nova Mainframe</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                  </strong>
                </div>
              </div>

              {/* Theme toggle & Quick Auth Profile label */}
              <div className="flex items-center gap-4">
                
                {/* Premium Nova Voice Assistant Trigger Button */}
                <button
                  onClick={() => setIsNovaVoiceOpen(true)}
                  className={`p-2 px-3.5 rounded-xl border hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 font-bold text-[11px] font-mono select-none
                    ${theme === 'dark' 
                      ? 'bg-gradient-to-tr from-purple-950/40 to-indigo-950/40 border-purple-500/30 text-purple-400 hover:border-purple-500 hover:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-gradient-to-tr from-purple-50/50 to-indigo-50/50 border-purple-200 text-purple-600 hover:border-purple-400 hover:text-purple-700 shadow-xs'
                    }
                  `}
                  title="Nova Voice Assistant"
                  type="button"
                  id="navbar-nova-voice-btn"
                >
                  <Mic size={13} className="text-purple-500 animate-pulse" />
                  <span>Nova Voice</span>
                </button>
                
                {/* Global Mode Switcher Button (Only Once) */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 px-3 rounded-xl border hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-bold text-[11px] font-mono select-none
                    ${theme === 'dark' 
                      ? 'bg-zinc-850 hover:bg-zinc-800 border-white/5 text-amber-400' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-amber-500 shadow-xs'
                    }
                  `}
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <>
                      <span>🌙</span>
                      <span className="text-[10px] uppercase text-zinc-300">Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <span>🌞</span>
                      <span className="text-[10px] uppercase text-slate-700">Light Mode</span>
                    </>
                  )}
                </button>

                {/* Theme Customization Dropdown */}
                <ThemeDropdown 
                  currentPreset={themeFamily} 
                  onPresetChange={handlePresetChange} 
                  theme={theme}
                />

                {/* Interactive Profile Dropdown Menu */}
                {user && (
                  <div className="relative shrink-0" id="header-profile-dropdown-envelope">
                    <button 
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98]
                        ${theme === 'dark' 
                          ? 'bg-zinc-900/80 hover:bg-zinc-900 border-white/5 text-zinc-100 hover:border-white/10' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                        }
                      `}
                      id="profile-dropdown-trigger"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-indigo-500/10">
                        <img 
                          src={userProfile?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=4f46e5`} 
                          alt="User Profile Pic" 
                          className="w-full h-full object-cover animate-fade-in"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-bold tracking-tight text-[11px] font-mono max-w-[110px] truncate">{user.name}</span>
                      <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileMenuOpen && (
                      <>
                        {/* Backdrop blocker to easily toggle close */}
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setProfileMenuOpen(false)}
                        />
                        <div 
                          className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 backdrop-blur-2xl shadow-xl z-50 animate-fade-in duration-200 origin-top-right
                            ${theme === 'dark' 
                              ? 'bg-zinc-950/95 border-white/10 text-zinc-200 shadow-black/70' 
                              : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
                            }
                          `}
                          id="profile-dropdown-menu"
                        >
                          {/* User Info Capsule */}
                          <div className="px-3 py-2.5 mb-1.5 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                              <img 
                                src={userProfile?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=4f46e5`} 
                                alt="user avatar dropdown" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <p className={`text-xs font-bold leading-none mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {user.name}
                              </p>
                              <p className="text-[9px] font-mono text-zinc-500 truncate leading-none">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`border-t mb-1.5 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`} />
                          
                          {/* Menu Options */}
                          <div className="space-y-0.5">
                            <button
                              onClick={() => {
                                setProfileMenuOpen(false);
                                setView('settings');
                                setTimeout(() => {
                                  document.getElementById('profile-settings-bento-parent')?.scrollIntoView({ behavior: 'smooth' });
                                }, 150);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs font-semibold font-mono transition-colors duration-150 cursor-pointer
                                ${theme === 'dark' ? 'hover:bg-white/5 text-zinc-350 hover:text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                              <span>👤</span>
                              <span>My Profile</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileMenuOpen(false);
                                setView('settings');
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs font-semibold font-mono transition-colors duration-150 cursor-pointer
                                ${theme === 'dark' ? 'hover:bg-white/5 text-zinc-350 hover:text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                              <span>⚙️</span>
                              <span>Settings</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileMenuOpen(false);
                                toggleTheme();
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs font-semibold font-mono transition-colors duration-150 cursor-pointer
                                ${theme === 'dark' ? 'hover:bg-white/5 text-zinc-350 hover:text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                              <span>🎨</span>
                              <span>Theme</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileMenuOpen(false);
                                setView('settings');
                                setTimeout(() => {
                                  document.getElementById('settings-notifications-form')?.scrollIntoView({ behavior: 'smooth' });
                                }, 150);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs font-semibold font-mono transition-colors duration-150 cursor-pointer
                                ${theme === 'dark' ? 'hover:bg-white/5 text-zinc-350 hover:text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                              <span>🔔</span>
                              <span>Notification preferences</span>
                            </button>
                          </div>

                          <div className={`border-t my-1.5 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`} />
                          
                          {/* Sign Out Button */}
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              handleSignout();
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-500 transition-colors duration-200 cursor-pointer
                              ${theme === 'dark' ? 'hover:bg-rose-500/10 text-rose-400' : 'hover:bg-rose-50'}
                            `}
                            id="header-profile-logout-btn"
                          >
                            <LogOut size={13} />
                            <span>Logout from Nova</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* Demo Mode Indicator Banner */}
            {isDemoMode && (
              <div 
                className={`mb-6 p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg animate-fade-in
                  ${theme === 'dark' 
                    ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200 shadow-indigo-950/20' 
                    : 'bg-indigo-50/50 border-indigo-200 text-indigo-950 shadow-indigo-100/50'
                  }
                `}
                id="demo-mode-indicator-banner"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className={`p-2 rounded-xl shrink-0 w-fit ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold font-mono tracking-wider uppercase px-2 py-0.5 rounded-md
                        ${theme === 'dark' ? 'bg-indigo-500/25 text-indigo-200' : 'bg-indigo-200 text-indigo-900'}
                      `}>
                        Preview Mode Active
                      </span>
                      <span className={`text-[10px] font-semibold font-mono ${theme === 'dark' ? 'text-indigo-400/80' : 'text-indigo-700'}`}>
                        You are exploring Nova AI in Demo Mode.
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed font-semibold ${theme === 'dark' ? 'text-indigo-300/80' : 'text-indigo-900/70'}`}>
                      Create an account to save your tasks, goals, schedules, and AI insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                  <button
                    onClick={() => {
                      setIsDemoMode(false);
                      setUser(null);
                      setView('auth_signup');
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-indigo-500/20 text-center inline-flex items-center justify-center font-mono"
                    id="demo-upgrade-signup-btn"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => {
                      setIsDemoMode(false);
                      setUser(null);
                      setView('auth_signin');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer text-center inline-flex items-center justify-center font-mono
                      ${theme === 'dark' 
                        ? 'border-white/10 hover:bg-white/5 text-white' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800 bg-white shadow-sm'
                      }
                    `}
                    id="demo-upgrade-signin-btn"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* VIEWS SELECTION BOX CASCADE */}
            <div className="animate-fade-in duration-300" id="current-viewport-wrapper">
              
              {view === 'dashboard' && (
                <DashboardView 
                  user={user} 
                  tasks={tasks} 
                  goals={goals} 
                  habits={habits}
                  scheduleSuggestions={scheduleSuggestions}
                  onTriggerSaveMyWeek={() => {
                    setView('save_my_week');
                    handleGenerateSavePlan();
                  }}
                  onAddTaskClick={() => setView('tasks')}
                  onQuickPrioritize={handleGenerateSmartSchedule}
                  onNavigateToTab={(nextView) => setView(nextView === 'save-week' ? 'save_my_week' : nextView)}
                  isLoadingPriorities={isGeneratingSchedule}
                  theme={theme}
                />
              )}

              {view === 'tasks' && (
                <TaskManagementView 
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onRunBreakdown={handleDecomposeTaskItem}
                  theme={theme}
                />
              )}

              {view === 'calendar' && (
                <CalendarView 
                  tasks={tasks}
                  goals={goals}
                  theme={theme}
                />
              )}

              {view === 'goals' && (
                <GoalTrackerView 
                  goals={goals}
                  onAddGoal={handleAddGoal}
                  onToggleMilestone={handleToggleMilestone}
                  onDeleteGoal={handleDeleteGoal}
                  isGeneratingMilestones={false}
                  theme={theme}
                />
              )}

              {view === 'habits' && (
                <HabitTrackerView 
                  habits={habits}
                  onToggleHabitDay={handleToggleHabitDay}
                  onBootstrapHabits={handleBootstrapHabits}
                  theme={theme}
                />
              )}

              {view === 'planner' && (
                <AIPlannerView 
                  tasks={tasks}
                  activeBreakdown={activeBreakdown}
                  onTriggerBreakdown={handleTriggerBreakdown}
                  isGeneratingBreakdown={isGeneratingBreakdown}
                  scheduleSuggestions={scheduleSuggestions}
                  onGenerateSmartSchedule={handleGenerateSmartSchedule}
                  isGeneratingSchedule={isGeneratingSchedule}
                  theme={theme}
                />
              )}

              {view === 'save_my_week' && (
                <SaveMyWeekView 
                  recoveryPlan={recoveryPlan}
                  onGeneratePlan={handleGenerateSavePlan}
                  isGeneratingPlan={isGeneratingPlan}
                  theme={theme}
                />
              )}

              {(view === 'insights' || view === 'history') && (
                <HistoryAndInsights 
                  tasks={tasks}
                  goals={goals}
                  habits={habits}
                  historyLogs={historyLogs}
                  theme={theme}
                />
              )}

              {view === 'settings' && (
                <SettingsView 
                  user={user}
                  userProfile={userProfile}
                  onUpdateUser={handleUpdateUser}
                  onUpdateUserPreferences={handleUpdateUserPreferences}
                  onUpdateUserProfile={handleUpdateUserProfileData}
                  theme={theme}
                  themeFamily={themeFamily}
                  onPresetChange={handlePresetChange}
                  toggleTheme={toggleTheme}
                  emails={emails}
                  onTriggerSimulation={handleTriggerSimulation}
                  onClearEmails={handleClearEmails}
                  onDeleteEmail={handleDeleteEmail}
                  isDemoMode={isDemoMode}
                />
              )}

            </div>

            {/* Premium Workspace Footer */}
            <Footer theme={theme} />

            {/* Bottom Floating Interactive Chat & Voice Assistant Node */}
            <ChatAssistant 
              messages={messages}
              chatSessions={chatSessions}
              activeChatId={activeChatId}
              onSendMessage={handleSendMessage}
              onApplySuggestedAction={handleApplySuggestedAction}
              onSelectChatSession={handleSelectChatSession}
              onDeleteChatSession={handleDeleteChatSession}
              onStartNewChat={handleStartNewChat}
              isSendingMessage={isSendingMessage}
              theme={theme}
              onTriggerVoice={() => setIsNovaVoiceOpen(true)}
            />

            {/* Centralized Voice Assistant Overlay Visualizer */}
            <NovaVoice
              isOpen={isNovaVoiceOpen}
              onClose={() => setIsNovaVoiceOpen(false)}
              tasks={tasks}
              goals={goals}
              currentView={view}
              onNavigate={(v) => setView(v)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onAddGoal={handleAddGoal}
              onExecuteSaveMyWeek={handleGenerateSavePlan}
              onAddChatMessage={handleAddChatMessage}
              theme={theme}
            />

          </main>
        </>
      )}

    </div>
  );
}
