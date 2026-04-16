"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Camera,
  Trash2,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");

  const SETTINGS_TABS = [
    { id: "general", label: "General Info", icon: User },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "payments", label: "Settlements", icon: CreditCard },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-pulse">
           <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4"></div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[3rem] border border-white/5 bg-slate-900/40 p-10 text-center relative overflow-hidden backdrop-blur-3xl shadow-2xl">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-indigo-600 to-blue-700"></div>
            
            <div className="relative pt-8 space-y-6">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden relative">
                   <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random&size=200`} alt={user.username} className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-1 right-1 p-2.5 bg-white text-slate-950 rounded-full shadow-lg border-2 border-slate-950 hover:bg-slate-200 transition-all scale-0 group-hover:scale-100 origin-bottom-left">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">{user.username}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Premium Member</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-left space-y-0.5">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Balance</p>
                  <p className="text-lg font-black text-white">₹ {parseFloat(user.balance || "0").toLocaleString()}</p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full h-14 flex items-center justify-center gap-3 bg-red-600/10 border border-red-500/20 text-red-400 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-[10px]"
              >
                <LogOut className="w-4 h-4" /> Secure Logout
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 space-y-3 backdrop-blur-3xl">
             <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-2 mb-4">Account Navigator</h4>
             {SETTINGS_TABS.map(tab => {
               const Icon = tab.icon;
               const isActive = activeSettingsTab === tab.id;
               return (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                      isActive ? "bg-white text-slate-950 shadow-xl shadow-slate-900/40" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                    )}
                 >
                   <div className="flex items-center gap-4">
                     <Icon className={cn("w-5 h-5", isActive ? "text-slate-950" : "text-slate-600")} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                   </div>
                   <ChevronRight className={cn("w-4 h-4", isActive ? "text-slate-950" : "opacity-0 group-hover:opacity-100")} />
                 </button>
               );
             })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="rounded-[3.5rem] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl shadow-2xl min-h-[600px]">
            
            {activeSettingsTab === "general" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Account Information</h1>
                   <p className="text-sm text-slate-500 font-medium">Manage your public profile and base credentials.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Unique Username</label>
                    <div className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 flex items-center text-sm font-bold text-slate-400">
                      @{user.username}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Email Address</label>
                    <div className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 flex items-center text-sm font-bold text-slate-400 italic">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                      <input 
                        type="text" 
                        placeholder="+91 00000 00000"
                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button className="px-8 h-14 bg-white text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg active:scale-95">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeSettingsTab === "security" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Security Shield</h1>
                   <p className="text-sm text-slate-500 font-medium">Configure advanced protection for your funds and data.</p>
                </div>

                <div className="space-y-6">
                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex gap-5">
                         <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                            <Lock className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-black text-white uppercase tracking-wider">Account Password</p>
                            <p className="text-[10px] font-medium text-slate-500">Last changed 4 months ago</p>
                         </div>
                      </div>
                      <button className="text-[10px] font-black uppercase text-cyan-400 hover:text-white transition-colors tracking-widest bg-cyan-500/10 px-4 py-2 rounded-xl">Update</button>
                   </div>

                   <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex gap-5">
                         <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <Smartphone className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-black text-white uppercase tracking-wider">Two-Factor (2FA)</p>
                            <p className="text-[10px] font-medium text-slate-500">Recommended for balance over ₹50,000</p>
                         </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-slate-800 transition-colors duration-200 ease-in-out">
                         <span className="translate-x-1 translate-y-1 inline-block h-4 w-4 transform rounded-full bg-slate-600 transition duration-200 ease-in-out"></span>
                      </div>
                   </div>

                   <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
                      <div className="flex items-center gap-3 text-amber-500">
                         <AlertTriangle className="w-5 h-5" />
                         <span className="text-xs font-black uppercase tracking-widest">Active Sessions</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase">
                        We detect 2 other devices currently logged into your account. If this wasn&apos;t you, change your password immediately and logout all sessions.
                      </p>
                      <button className="text-[9px] font-black uppercase text-red-400 hover:underline">Revoke All Sessions</button>
                   </div>
                </div>
              </div>
            )}

            {activeSettingsTab === "payments" && (
               <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 italic">
                  <CreditCard className="w-16 h-16 text-slate-700" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700">Settlement configurations <br />Loading soon...</p>
               </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
