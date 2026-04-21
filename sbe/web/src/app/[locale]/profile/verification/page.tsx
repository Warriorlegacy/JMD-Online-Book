"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { CheckCircle2, AlertCircle, Clock, Upload, FileText, User, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function VerificationPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "pending" | "verified" | "rejected">("idle");
  const [kycDocs, setKycDocs] = useState<{ dob: string; address: string }>({ dob: "", address: "" });
  const [files, setFiles] = useState<{ idCard: File | null; addressProof: File | null }>({ idCard: null, addressProof: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/kyc/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatus(data.status);
      if (data.documents) {
        setKycDocs({
          dob: data.documents.dob || "",
          address: data.documents.address || "",
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDetailsSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/kyc/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kycDocs),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save details");
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentsSubmit = async () => {
    if (!files.idCard || !files.addressProof) {
      setError("Please upload both required documents");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("idCard", files.idCard);
      formData.append("addressProof", files.addressProof);

      const res = await fetch("/api/kyc/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload documents");
      }
      setStatus("pending");
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="rounded-[3.5rem] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">KYC Verification</h1>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Verify your identity to unlock all features</p>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/5">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              status === "verified" ? "bg-emerald-500" : status === "rejected" ? "bg-red-500" : "bg-amber-500"
            )} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {status === "verified" ? "Verified" : status === "rejected" ? "Rejected" : status === "pending" ? "Pending Review" : "Not Started"}
            </span>
          </div>
        </div>

        {status === "verified" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Identity Verified</h2>
            <p className="text-slate-500 font-medium max-w-sm">Your account is fully verified. You can now deposit and withdraw without any limits.</p>
          </div>
        )}

        {status === "rejected" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Verification Rejected</h2>
            <p className="text-slate-500 font-medium max-w-sm">Your documents were not accepted. Please review the requirements and try uploading again.</p>
            <Button onClick={() => setStep(1)} className="bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-8">
              Restart Process
            </Button>
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Under Review</h2>
            <p className="text-slate-500 font-medium max-w-sm">Our compliance team is reviewing your documents. This usually takes 24-48 hours.</p>
          </div>
        )}

        {status !== "verified" && status !== "pending" && status !== "rejected" && (
          <div className="space-y-12">
            {/* Stepper */}
            <div className="flex items-center justify-between max-w-md mx-auto mb-16">
               {[1, 2].map((s) => (
                 <React.Fragment key={s}>
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500",
                     step >= s ? "bg-white text-slate-950 shadow-lg" : "bg-slate-800 text-slate-600"
                   )}>
                     {s === 1 ? <User className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                   </div>
                   {s === 1 && (
                     <div className={cn(
                       "flex-1 h-1 mx-4 transition-all duration-500",
                       step > 1 ? "bg-white" : "bg-slate-800"
                     )} />
                   )}
                 </React.Fragment>
               ))}
            </div>

            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6 max-w-lg mx-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={kycDocs.dob}
                      onChange={(e) => setKycDocs(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Permanent Address</label>
                    <textarea 
                      value={kycDocs.address}
                      onChange={(e) => setKycDocs(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-all"
                      placeholder="Street, City, State, Zip Code..."
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleDetailsSubmit}
                    disabled={loading}
                    className="bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-12 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Continue to Documents"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Government ID</span>
                    </div>
                    <div 
                      className={cn(
                        "h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer",
                        files.idCard ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      onClick={() => document.getElementById('id-upload')?.click()}
                    >
                      {files.idCard ? (
                        <div className="text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="text-[10px] font-bold text-emerald-500 truncate max-w-xs px-4">{files.idCard.name}</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <Upload className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upload ID/Passport</p>
                        </div>
                      )}
                      <input 
                        id="id-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setFiles(prev => ({ ...prev, idCard: e.target.files?.[0] || null }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Address Proof</span>
                    </div>
                    <div 
                      className={cn(
                        "h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer",
                        files.addressProof ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      onClick={() => document.getElementById('address-upload')?.click()}
                    >
                      {files.addressProof ? (
                        <div className="text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <p className="text-[10px] font-bold text-emerald-500 truncate max-w-xs px-4">{files.addressProof.name}</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <Upload className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upload Utility Bill</p>
                        </div>
                      )}
                      <input 
                        id="address-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setFiles(prev => ({ ...prev, addressProof: e.target.files?.[0] || null }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => setStep(1)}
                    className="bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-8 transition-all active:scale-95"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleDocumentsSubmit}
                    disabled={loading}
                    className="bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-12 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Uploading..." : "Submit Verification"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
