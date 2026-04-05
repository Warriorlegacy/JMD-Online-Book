"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NewTenantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    ownerEmail: "",
    ownerName: "",
    primaryColor: "#f59e0b",
    plan: "basic",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create tenant");
      }
      toast.success("Tenant created successfully!");
      router.push("/super-admin/tenants");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating tenant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SectionHeading
        eyebrow="Add New Client"
        title="Create New Tenant"
        subtitle="Set up a new white-label client with their own branding."
      />

      <Card className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Tenant Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">App Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Gaming App"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Slug (URL)</label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="my-app"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Custom Domain (optional)</label>
                <Input
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="app.mydomain.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-lg border border-white/10 bg-transparent"
                  />
                  <Input
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Owner Account</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Owner Name</label>
                <Input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Owner Email</label>
                <Input
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Subscription</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {["free", "basic", "pro", "enterprise"].map((plan) => (
                <label
                  key={plan}
                  className={`cursor-pointer rounded-2xl border p-4 text-center transition ${
                    formData.plan === plan
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={formData.plan === plan}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <p className="font-semibold capitalize text-white">{plan}</p>
                  <p className="text-xs text-slate-400">
                    {plan === "free" ? "₹0/mo" : plan === "basic" ? "₹999/mo" : plan === "pro" ? "₹2999/mo" : "Custom"}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Tenant"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}