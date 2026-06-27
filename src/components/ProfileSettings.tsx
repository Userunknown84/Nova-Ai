import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  Sparkles, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  Info,
  Sliders,
  Compass,
  FileCheck2
} from "lucide-react";
import { UserProfile, UserPreferences } from "../types";
import { PREDEFINED_AVATARS, DEFAULT_AVATAR, AvatarItem } from "../lib/avatarData";
import { uploadProfileImage, removeProfileImage } from "../lib/firebase";

interface ProfileSettingsProps {
  userProfile: UserProfile | null;
  onUpdateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  theme: 'light' | 'dark';
}

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney"
];

const PRODUCTIVE_TIMES = [
  { value: "Early Bird", label: "Early Bird (5am - 9am)" },
  { value: "Morning Peak", label: "Morning Peak (9am - 1pm)" },
  { value: "Afternoon Focus", label: "Afternoon Focus (1pm - 5pm)" },
  { value: "Night Owl", label: "Night Owl (9pm - 1am)" },
  { value: "Flexible", label: "Flexible Hours" }
];

const WORK_STYLES = [
  { value: "Pomodoro Focus", label: "Pomodoro (25/5 intervals)" },
  { value: "Deep Work Sprints", label: "Deep Work Sprints (90 min)" },
  { value: "Time Blocking", label: "Day Time Blocking" },
  { value: "Ultradian Rhythm", label: "Ultradian Rhythms (90/20)" },
  { value: "Kanban Flow", label: "Task Kanban Pull" }
];

export default function ProfileSettings({
  userProfile,
  onUpdateUserProfile,
  theme
}: ProfileSettingsProps) {
  // Input fields state
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [timezone, setTimezone] = useState(userProfile?.timezone || "America/Los_Angeles");
  const [productiveTime, setProductiveTime] = useState(userProfile?.productiveTime || "Morning Peak");
  const [workStyle, setWorkStyle] = useState(userProfile?.workStyle || "Deep Work Sprints");
  const [focusGoals, setFocusGoals] = useState(userProfile?.focusGoals || "");

  // Avatar Management
  const [selectedCategory, setSelectedCategory] = useState<"Male" | "Female" | "Professional" | "Student" | "Minimal" | "AI Style">("Minimal");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync initial profile values
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setBio(userProfile.bio || "");
      setTimezone(userProfile.timezone || "America/Los_Angeles");
      setProductiveTime(userProfile.productiveTime || "Morning Peak");
      setWorkStyle(userProfile.workStyle || "Deep Work Sprints");
      setFocusGoals(userProfile.focusGoals || "");
    }
  }, [userProfile]);

  // Handle Text Profile save
  const handleSaveTextChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage("Saving profile telemetry...");
      await onUpdateUserProfile({
        fullName,
        bio,
        timezone,
        productiveTime,
        workStyle,
        focusGoals
      });
      setStatusMessage("Profile details updated successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setUploadError("Could not save profile text credentials.");
    }
  };

  // Predefined Avatar instant one-click picker
  const handleSelectPredefinedAvatar = async (avatarUrl: string) => {
    try {
      setStatusMessage("Syncing selected avatar...");
      await onUpdateUserProfile({
        profilePhoto: avatarUrl
      });
      setStatusMessage("Avatar updated successfully.");
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      setStatusMessage("Failed to update avatar.");
    }
  };

  // Custom File Validator (JPG, JPEG, PNG, WEBP, <= 5MB)
  const validateAndUploadFile = async (file: File) => {
    setUploadError(null);
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type)) {
      setUploadError("Invalid image format. Supported: JPG, JPEG, PNG, WEBP.");
      return;
    }
    // Size check (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("Image file exceeds the 5 MB size constraint.");
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage("Uploading and hashing original pixels...");
      
      // If there is an existing profilePhoto in storage, clean it up
      if (userProfile?.profilePhoto && userProfile.profilePhoto.includes("firebasestorage.googleapis.com")) {
        await removeProfileImage(userProfile.uid, userProfile.profilePhoto);
      }

      const downloadUrl = await uploadProfileImage(userProfile?.uid || "guest", file);
      await onUpdateUserProfile({ profilePhoto: downloadUrl });
      
      setStatusMessage("Profile photo deployed and loaded.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setUploadError("Failed to store custom photo in Firebase Storage.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Remove Photo Action
  const handleRemovePhoto = async () => {
    try {
      setStatusMessage("Refactoring profile photo nodes...");
      if (userProfile?.profilePhoto && userProfile.profilePhoto.includes("firebasestorage.googleapis.com")) {
        await removeProfileImage(userProfile.uid, userProfile.profilePhoto);
      }
      await onUpdateUserProfile({ profilePhoto: "" });
      setStatusMessage("Profile image resource cleared.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setUploadError("Could not remove photo securely.");
    }
  };

  const currentAvatar = userProfile?.profilePhoto || DEFAULT_AVATAR;

  // Filter predefined avatars by category
  const filteredAvatars = PREDEFINED_AVATARS.filter(a => a.category === selectedCategory);

  const categories: ("Minimal" | "Male" | "Female" | "Professional" | "Student" | "AI Style")[] = [
    "Minimal",
    "Male",
    "Female",
    "Professional",
    "Student",
    "AI Style"
  ];

  return (
    <div className="space-y-6" id="profile-settings-bento-parent">
      
      {/* Visual Identity Section: Avatars and Uploads - Horizontal Splitting */}
      <div className={`p-6 rounded-3xl border backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-6
        ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}
      `}>
        {/* Left Side: Photo Previews and File Uploader */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r pb-6 lg:pb-0 lg:pr-6 border-white/5 space-y-4">
          <div className="text-center w-full">
            <h4 className="text-sm font-black flex items-center justify-center gap-1.5">
              <ImageIcon size={15} className="text-indigo-400" />
              <span>Identity Representation</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Select or deploy a premium visual locator for your global workspace footprint.
            </p>
          </div>

          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 shadow-lg relative overflow-hidden flex items-center justify-center">
              <img 
                src={currentAvatar} 
                alt="Active Profile Preview" 
                className="w-full h-full rounded-full object-cover bg-zinc-900"
                id="profile-rendering-current-avatar"
                referrerPolicy="no-referrer"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              )}
            </div>
            {/* Overlay indicators */}
            <div className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider
              ${userProfile?.profilePhoto ? 'bg-indigo-600 text-indigo-50' : 'bg-purple-950/80 text-purple-400 border border-purple-500/20'}
            `}>
              {userProfile?.profilePhoto ? "Custom" : "Predefined"}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full py-4 px-3 rounded-2xl border border-dashed transition-all duration-200 text-center relative cursor-pointer
              ${isDragging 
                ? 'bg-indigo-500/10 border-indigo-500/50' 
                : theme === 'dark' ? 'bg-black/30 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-300 hover:border-slate-400'
              }
            `}
            id="avatar-drop-zone-wrapper"
          >
            <input 
              type="file" 
              name="profilePhotoUpload"
              id="profilePhotoUploadInput" 
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Upload className="mx-auto text-zinc-500 mb-1.5" size={16} />
            <span className="block font-bold text-zinc-400 text-[10px]">Drag photo here or Click to select</span>
            <span className="block text-[9px] text-zinc-500 mt-1">JPG, PNG, WEBP — Limit 5 MB</span>
          </div>

          {/* Action buttons (change / remove) */}
          <div className="flex gap-2 w-full justify-center">
            {userProfile?.profilePhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                id="profile-remove-photo-button"
              >
                <Trash2 size={11} />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Predefined Avatars Grid (One-click selection) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div>
            <h4 className="text-sm font-black flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-400 animate-pulse" />
              <span>Predefined Premium Avatars</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Choose from standard collections. Select any style with a single click.
            </p>
          </div>

          {/* Categories Tab Swapper */}
          <div className="flex flex-wrap gap-1 border-b border-white/5 pb-2" id="avatar-categories-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer
                  ${selectedCategory === cat 
                    ? 'bg-indigo-500 text-white' 
                    : theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-zinc-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid list of predefined avatars */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[140px] overflow-y-auto pr-1" id="avatar-predefined-selection-grid">
            {filteredAvatars.map((avatar) => {
              const isSelected = currentAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelectPredefinedAvatar(avatar.url)}
                  title={`Select ${avatar.name}`}
                  className={`relative p-1 rounded-xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center group/item
                    ${isSelected 
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-md ring-2 ring-indigo-400' 
                      : theme === 'dark' ? 'bg-black/40 hover:bg-black/60 border border-white/5' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }
                  `}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-900"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                      <Check size={9} strokeWidth={4} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/80 text-[7px] text-white font-semibold rounded-b-xl opacity-0 group-hover/item:opacity-100 text-center transition-opacity truncate">
                    {avatar.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Errors & statuses block */}
      {uploadError && (
        <div className="p-3.5 rounded-2xl border border-rose-500/35 bg-rose-500/10 text-rose-400 font-bold text-xs flex items-center gap-2" id="avatar-telemetry-error">
          <Info size={14} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-2xl border border-indigo-500/35 bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center gap-2 animate-pulse" id="avatar-telemetry-status">
          <Loader2 size={14} className="animate-spin shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Profile details text form fields */}
      <form onSubmit={handleSaveTextChanges} className={`p-6 border rounded-3xl backdrop-blur-md space-y-6
        ${theme === 'dark' ? 'bg-[#0f0a20cb] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}
      `} id="profile-text-form">
        <div>
          <h3 className="text-sm font-black border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Sliders size={15} className="text-purple-400" />
            <span>Profile Personalization Telemetry</span>
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            Update your registered details, set timezone offsets, and adjust AI agent recommendation factors.
          </p>
        </div>

        {/* Inputs row 1: Full name and locked email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-500 font-semibold
                  ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
                `}
                placeholder="Sarah Jenkins"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>Account Email</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-800 rounded text-zinc-400">Read Only</span>
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input 
                type="email" 
                value={userProfile?.email || ""}
                disabled
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none opacity-60 cursor-not-allowed font-semibold
                  ${theme === 'dark' ? 'bg-black/45 border-white/5 text-zinc-500' : 'bg-slate-200 border-slate-300 text-slate-500'}
                `}
                title="Account email configuration cannot be altered directly"
              />
            </div>
          </div>
        </div>

        {/* Inputs row 2: Timezone & Productive Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider">Timezone Offset</label>
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors font-semibold appearance-none cursor-pointer
                  ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
                `}
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider">Productivity Preferences (Peak Hours)</label>
            <div className="relative">
              <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={productiveTime}
                onChange={(e) => setProductiveTime(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors font-semibold appearance-none cursor-pointer
                  ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
                `}
              >
                {PRODUCTIVE_TIMES.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
            </div>
          </div>
        </div>

        {/* Inputs row 3: Work style and Biography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider">Work Style Mode</label>
            <div className="relative">
              <Compass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={workStyle}
                onChange={(e) => setWorkStyle(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors font-semibold appearance-none cursor-pointer
                  ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
                `}
              >
                {WORK_STYLES.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">▼</div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-405 mb-1 text-[11px] uppercase tracking-wider">Active Workspace Goals</label>
            <div className="relative">
              <Compass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={focusGoals}
                onChange={(e) => setFocusGoals(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-500 font-semibold
                  ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
                `}
                placeholder="e.g. Crack placement interview, build AI startup"
              />
            </div>
          </div>
        </div>

        {/* Biography multiline area */}
        <div>
          <label className="block font-bold text-zinc-450 mb-1 text-[11px] uppercase tracking-wider">Bio / Coordinates Statement</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={`w-full p-3 rounded-xl border focus:outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-500 font-semibold resize-none
              ${theme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'}
            `}
            placeholder="Tell us about yourself, research, startup focus, or workflow preferences..."
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-2 shadow-lg hover:shadow-indigo-500/10
              bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500"
            id="profile-save-text-changes-btn"
          >
            <FileCheck2 size={13} />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
      
    </div>
  );
}
