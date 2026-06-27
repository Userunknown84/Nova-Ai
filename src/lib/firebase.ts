import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Task, Goal, Habit, HistoryLog, ChatSession, ChatMessage, UserPreferences, UserProfile, SentEmail } from "../types";

// Firebase Applet Configuration (synchronized with firebase-applet-config.json)
const firebaseConfig = {
  projectId: "gen-lang-client-0271167813",
  appId: "1:460270492745:web:35458b39f5ea917812b398",
  apiKey: "AIzaSyBljD_9WJGPozcELX0JwxNIdFnYJzV8yg0",
  authDomain: "gen-lang-client-0271167813.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-ea88abdc-5634-4519-a6a5-2e5c871f2277",
  storageBucket: "gen-lang-client-0271167813.firebasestorage.app",
  messagingSenderId: "460270492745",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

// Google Auth Scopes
googleProvider.addScope("profile");
googleProvider.addScope("email");

// --- USER PROFILE OPERATIONS ---

/**
 * Sync user profile in Firestore
 */
export async function syncUserProfile(
  user: FirebaseUser, 
  fullName?: string, 
  provider: "email" | "google" = "email"
): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (!userSnap.exists()) {
    // Create new profile doc
    const profile: UserProfile = {
      uid: user.uid,
      fullName: fullName || user.displayName || user.email?.split("@")[0] || "Nova User",
      email: user.email || "",
      authProvider: provider,
      createdAt: now.toISOString(),
      lastLogin: now.toISOString(),
      profilePhoto: user.photoURL || "",
      role: "user",
      preferences: {
        theme: "dark",
        themeFamily: "default",
        emailNotifications: true,
        dueTaskAlerts: true,
        highRiskAlerts: true,
        weeklyReports: true,
        goalUpdates: true
      },
      sessionExpiry: sevenDaysFromNow.toISOString()
    };
    await setDoc(userRef, profile);
    return profile;
  } else {
    // Update existing profile's lastLogin and sessionExpiry
    const existingData = userSnap.data();
    const existingPrefs = existingData.preferences || {};
    const updatedData: UserProfile = {
      ...existingData,
      uid: user.uid,
      email: user.email || existingData.email || "",
      authProvider: existingData.authProvider || provider,
      createdAt: existingData.createdAt || now.toISOString(),
      lastLogin: now.toISOString(),
      fullName: fullName || existingData.fullName || user.displayName || "Nova User",
      profilePhoto: user.photoURL || existingData.profilePhoto || "",
      role: existingData.role || "user",
      preferences: {
        theme: existingPrefs.theme || "dark",
        themeFamily: existingPrefs.themeFamily || "default",
        emailNotifications: existingPrefs.emailNotifications !== undefined ? existingPrefs.emailNotifications : true,
        dueTaskAlerts: existingPrefs.dueTaskAlerts !== undefined ? existingPrefs.dueTaskAlerts : true,
        highRiskAlerts: existingPrefs.highRiskAlerts !== undefined ? existingPrefs.highRiskAlerts : true,
        weeklyReports: existingPrefs.weeklyReports !== undefined ? existingPrefs.weeklyReports : true,
        goalUpdates: existingPrefs.goalUpdates !== undefined ? existingPrefs.goalUpdates : true,
      },
      sessionExpiry: sevenDaysFromNow.toISOString()
    } as UserProfile;
    await setDoc(userRef, updatedData, { merge: true });
    return updatedData;
  }
}

// --- TASK OPERATIONS ---

export async function fetchUserTasks(userId: string): Promise<Task[]> {
  const q = query(collection(db, "tasks"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const fetchedTasks: Task[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    fetchedTasks.push({
      id: docSnap.id,
      title: data.title || "",
      description: data.description || "",
      deadline: data.deadline || "",
      priority: data.priority || "medium",
      category: data.category || "Personal",
      estimatedTime: data.estimatedTime || 1,
      status: data.status || "todo",
      priorityScore: data.priorityScore,
      urgencyScore: data.urgencyScore,
      importanceScore: data.importanceScore,
      riskScore: data.riskScore,
      aiRiskAnalysis: data.aiRiskAnalysis
    });
  });
  return fetchedTasks;
}

export async function saveUserTask(userId: string, task: Omit<Task, "id"> & { id?: string }): Promise<string> {
  if (task.id && !task.id.startsWith("t-temp-") && !task.id.includes("Date.now()")) {
    // If it has a real id, update/set it
    const docRef = doc(db, "tasks", task.id);
    await setDoc(docRef, { ...task, userId }, { merge: true });
    return task.id;
  } else {
    // Create new
    const colRef = collection(db, "tasks");
    const docSnap = await addDoc(colRef, { ...task, userId });
    return docSnap.id;
  }
}

export async function updateUserTask(userId: string, taskId: string, updatedFields: Partial<Task>): Promise<void> {
  const docRef = doc(db, "tasks", taskId);
  await setDoc(docRef, { ...updatedFields, userId }, { merge: true });
}

export async function deleteUserTask(userId: string, taskId: string): Promise<void> {
  const docRef = doc(db, "tasks", taskId);
  await deleteDoc(docRef);
}

// --- GOAL OPERATIONS ---

export async function fetchUserGoals(userId: string): Promise<Goal[]> {
  const q = query(collection(db, "goals"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const fetchedGoals: Goal[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    fetchedGoals.push({
      id: docSnap.id,
      title: data.title || "",
      category: data.category || "",
      targetDate: data.targetDate || "",
      progress: data.progress || 0,
      milestones: data.milestones || []
    });
  });
  return fetchedGoals;
}

export async function saveUserGoal(userId: string, goal: Omit<Goal, "id"> & { id?: string }): Promise<string> {
  if (goal.id && !goal.id.startsWith("g-temp-") && !goal.id.includes("Date.now()")) {
    const docRef = doc(db, "goals", goal.id);
    await setDoc(docRef, { ...goal, userId }, { merge: true });
    return goal.id;
  } else {
    const colRef = collection(db, "goals");
    const docSnap = await addDoc(colRef, { ...goal, userId });
    return docSnap.id;
  }
}

export async function updateUserGoal(userId: string, goalId: string, updatedFields: Partial<Goal>): Promise<void> {
  const docRef = doc(db, "goals", goalId);
  await setDoc(docRef, { ...updatedFields, userId }, { merge: true });
}

export async function deleteUserGoal(userId: string, goalId: string): Promise<void> {
  const docRef = doc(db, "goals", goalId);
  await deleteDoc(docRef);
}

// --- HABIT OPERATIONS ---

export async function fetchUserHabits(userId: string): Promise<Habit[]> {
  const q = query(collection(db, "habits"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const fetchedHabits: Habit[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    fetchedHabits.push({
      id: docSnap.id,
      name: data.name || "",
      streak: data.streak || 0,
      consistencyScore: data.consistencyScore || 0,
      completedDays: data.completedDays || []
    });
  });
  return fetchedHabits;
}

export async function saveUserHabit(userId: string, habit: Omit<Habit, "id"> & { id?: string }): Promise<string> {
  if (habit.id && !habit.id.startsWith("h-temp-") && !habit.id.includes("Date.now()")) {
    const docRef = doc(db, "habits", habit.id);
    await setDoc(docRef, { ...habit, userId }, { merge: true });
    return habit.id;
  } else {
    const colRef = collection(db, "habits");
    const docSnap = await addDoc(colRef, { ...habit, userId });
    return docSnap.id;
  }
}

export async function updateUserHabit(userId: string, habitId: string, updatedFields: Partial<Habit>): Promise<void> {
  const docRef = doc(db, "habits", habitId);
  await setDoc(docRef, { ...updatedFields, userId }, { merge: true });
}

export async function deleteUserHabit(userId: string, habitId: string): Promise<void> {
  const docRef = doc(db, "habits", habitId);
  await deleteDoc(docRef);
}

// --- HISTORY LOG OPERATIONS ---

export async function fetchUserHistory(userId: string): Promise<HistoryLog[]> {
  const q = query(collection(db, "history"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const fetchedHistory: HistoryLog[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    fetchedHistory.push({
      id: docSnap.id,
      timestamp: data.timestamp || new Date().toISOString(),
      action: data.action || "",
      details: data.details || ""
    });
  });
  // Sort descending by timestamp (newest first)
  fetchedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return fetchedHistory;
}

export async function saveUserHistoryLog(userId: string, action: string, details: string): Promise<string> {
  const colRef = collection(db, "history");
  const docSnap = await addDoc(colRef, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  return docSnap.id;
}


// --- SEED OR BULK SETUP FOR NEW USERS ---

export async function seedDefaultUserData(userId: string): Promise<{ tasks: Task[], goals: Goal[], habits: Habit[] }> {
  // Check if user already has data. If yes, don't seed.
  const existingTasks = await fetchUserTasks(userId);
  const existingGoals = await fetchUserGoals(userId);
  const existingHabits = await fetchUserHabits(userId);

  if (existingTasks.length > 0 || existingGoals.length > 0 || existingHabits.length > 0) {
    return {
      tasks: existingTasks,
      goals: existingGoals,
      habits: existingHabits
    };
  }

  // Pre-seed premium starter pack data
  const defaultTasks: Omit<Task, "id">[] = [
    {
      title: "Complete Stanford ML Lecture 4 Draft",
      description: "Analyze backpropagation algorithm bounds and write mathematical summary footnotes.",
      deadline: "2026-06-23",
      priority: "high",
      category: "Study",
      estimatedTime: 4,
      status: "inprogress",
      priorityScore: 92,
      urgencyScore: 96,
      importanceScore: 88,
      riskScore: 82,
      aiRiskAnalysis: "High risk of overlap with Angels startup pitch timeline tomorrow."
    },
    {
      title: "Review Angel Seed round Term Sheets",
      description: "Consult mentors on liquidating control boundaries and dilution ratios.",
      deadline: "2026-06-24",
      priority: "high",
      category: "Startup",
      estimatedTime: 3,
      status: "todo",
      priorityScore: 85,
      urgencyScore: 80,
      importanceScore: 90,
      riskScore: 68,
      aiRiskAnalysis: "Presents high significance. Clear focus zone scheduled."
    },
    {
      title: "Synthesize Financial Ledger Q2 Records",
      description: "Compile startup cash runway charts and check hosting spending coordinates.",
      deadline: "2026-06-25",
      priority: "medium",
      category: "Finance",
      estimatedTime: 2.5,
      status: "todo",
      priorityScore: 65,
      urgencyScore: 60,
      importanceScore: 70,
      riskScore: 40,
      aiRiskAnalysis: "Sloppy logging detected, scheduling protection zone."
    },
    {
      title: "Perform 5K HIIT Sprint session",
      description: "Run cardio interval clusters to buffer stress build-ups.",
      deadline: "2026-06-22",
      priority: "low",
      category: "Health",
      estimatedTime: 1,
      status: "completed"
    }
  ];

  const defaultGoals: Omit<Goal, "id">[] = [
    {
      title: "Raise Angel Pre-Seed for Startup",
      category: "Startup Development",
      targetDate: "2026-09-30",
      progress: 33,
      milestones: [
        { id: "g1-m1", title: "Complete pitch deck draft & visual frames", deadline: "2026-07-15", completed: true, targetWeek: "Week 1-3", dailyActions: ["Audit competitor CSS templates", "Export vector banners"] },
        { id: "g1-m2", title: "Conduct Stanford Mentor sync reviews", deadline: "2026-08-15", completed: false, targetWeek: "Week 4-7", dailyActions: ["Contact biochem instructors", "Schedule calendar block"] },
        { id: "g1-m3", title: "Apply at Silicon Capital accelerator", deadline: "2026-09-15", completed: false, targetWeek: "Week 8-11", dailyActions: ["Record video pitch segment", "Compile legal runway briefs"] }
      ]
    },
    {
      title: "Score GPA 3.9 Academic Honours",
      category: "Academic Coursework",
      targetDate: "2026-12-15",
      progress: 0,
      milestones: [
        { id: "g2-m1", title: "Submit Machine learning term papers", deadline: "2026-10-15", completed: false, targetWeek: "Week 1-4", dailyActions: ["Refactor Python algorithms", "Export LaTeX formulas"] },
        { id: "g2-m2", title: "Ace Advanced statistics midterms", deadline: "2026-11-15", completed: false, targetWeek: "Week 5-8", dailyActions: ["Revise binomial cards", "Run simulator checks"] }
      ]
    }
  ];

  const defaultHabits: Omit<Habit, "id">[] = [
    {
      name: "Coding",
      streak: 5,
      consistencyScore: 92,
      completedDays: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19", "2026-06-18", "2026-06-15"]
    },
    {
      name: "Exercise",
      streak: 2,
      consistencyScore: 78,
      completedDays: ["2026-06-22", "2026-06-21", "2026-06-18", "2026-06-15"]
    },
    {
      name: "Reading",
      streak: 1,
      consistencyScore: 85,
      completedDays: ["2026-06-22", "2026-06-20", "2026-06-18", "2026-06-16"]
    }
  ];

  const batch = writeBatch(db);
  const tasksCol = collection(db, "tasks");
  const goalsCol = collection(db, "goals");
  const habitsCol = collection(db, "habits");

  const seededTasks: Task[] = [];
  const seededGoals: Goal[] = [];
  const seededHabits: Habit[] = [];

  for (const t of defaultTasks) {
    const docRef = doc(tasksCol);
    batch.set(docRef, { ...t, userId });
    seededTasks.push({ id: docRef.id, ...t });
  }

  for (const g of defaultGoals) {
    const docRef = doc(goalsCol);
    batch.set(docRef, { ...g, userId });
    seededGoals.push({ id: docRef.id, ...g });
  }

  for (const h of defaultHabits) {
    const docRef = doc(habitsCol);
    batch.set(docRef, { ...h, userId });
    seededHabits.push({ id: docRef.id, ...h });
  }

  await batch.commit();

  return {
    tasks: seededTasks,
    goals: seededGoals,
    habits: seededHabits
  };
}

// --- CHAT OPERATIONS FOR CHATBOT HISTORY ---

export async function fetchUserChats(userId: string): Promise<ChatSession[]> {
  const colRef = collection(db, "users", userId, "chats");
  const querySnapshot = await getDocs(colRef);
  const chats: ChatSession[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    chats.push({
      id: docSnap.id,
      message: data.message || "",
      sender: data.sender || "user",
      timestamp: data.timestamp || new Date().toISOString(),
      messages: data.messages || []
    });
  });
  // Sort descending by timestamp
  chats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return chats;
}

export async function saveUserChatSession(userId: string, chatSession: ChatSession): Promise<void> {
  const docRef = doc(db, "users", userId, "chats", chatSession.id);
  await setDoc(docRef, {
    message: chatSession.message,
    sender: chatSession.sender,
    timestamp: chatSession.timestamp,
    messages: chatSession.messages
  }, { merge: true });
}

export async function deleteUserChatSession(userId: string, chatId: string): Promise<void> {
  const docRef = doc(db, "users", userId, "chats", chatId);
  await deleteDoc(docRef);
}

export async function updateUserThemePreference(userId: string, themeMode: 'light' | 'dark', themeFamily: 'default' | 'cyberpunk' | 'purple' | 'emerald' | 'sunset'): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    preferences: {
      theme: themeMode,
      themeFamily: themeFamily
    }
  }, { merge: true });
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    preferences: preferences
  }, { merge: true });
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, profileData, { merge: true });
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const imageRef = ref(storage, `users/${userId}/profileImage_${Date.now()}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
}

export async function removeProfileImage(userId: string, imageUrl: string): Promise<void> {
  try {
    // Attempt to extract reference from URL, or use a default path if not a firebase storage url
    if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
      const decodedUrl = decodeURIComponent(imageUrl);
      const parts = decodedUrl.split("/o/");
      if (parts.length > 1) {
        const filePath = parts[1].split("?")[0];
        const imageRef = ref(storage, filePath);
        await deleteObject(imageRef);
        return;
      }
    }
  } catch (e) {
    console.warn("Could not delete image from storage:", e);
  }
}

// --- EMAIL OPERATIONS ---

export async function fetchUserEmails(userId: string): Promise<SentEmail[]> {
  const colRef = collection(db, "users", userId, "emails");
  const querySnapshot = await getDocs(colRef);
  const emails: SentEmail[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    emails.push({
      id: docSnap.id,
      recipient: data.recipient || "",
      subject: data.subject || "",
      body: data.body || "",
      type: data.type || "due_alert",
      sentAt: data.sentAt || new Date().toISOString(),
      status: data.status || "delivered",
      metadata: data.metadata || null
    });
  });
  // Sort descending by sentAt
  emails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  return emails;
}

export async function saveUserEmail(userId: string, email: Omit<SentEmail, "id"> & { id?: string }): Promise<string> {
  const emailId = email.id || `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const docRef = doc(db, "users", userId, "emails", emailId);
  const updatedEmail = {
    ...email,
    id: emailId,
    sentAt: email.sentAt || new Date().toISOString(),
    status: email.status || "delivered"
  };
  await setDoc(docRef, updatedEmail, { merge: true });
  return emailId;
}

export async function deleteUserEmail(userId: string, emailId: string): Promise<void> {
  const docRef = doc(db, "users", userId, "emails", emailId);
  await deleteDoc(docRef);
}

