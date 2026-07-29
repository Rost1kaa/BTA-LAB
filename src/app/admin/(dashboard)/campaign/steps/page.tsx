"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateCampaignStep } from "@/lib/actions/campaign-details";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Layers, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "ეტაპი 1: განაცხადი", desc: "განაცხადების მიღება აქტიურია" },
  { id: 2, title: "ეტაპი 2: განხილვა", desc: "შემოსული განაცხადების განხილვის პროცესი" },
  { id: 3, title: "ეტაპი 3: შერჩევა", desc: "ფინალისტების შერჩევა და ინტერვიუები" },
  { id: 4, title: "ეტაპი 4: დაფინანსება", desc: "გამარჯვებულების გამოვლენა და დაფინანსება" },
];

export default function CampaignStepsAdminPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from("campaign_details") as any)
          .select("current_step")
          .eq("id", 1)
          .single();

        if (error) throw error;
        if (data?.current_step) {
          setCurrentStep(data.current_step);
        }
      } catch (err) {
        toast.error("Failed to load campaign step.");
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await updateCampaignStep(currentStep);

      setSuccess(true);
      router.refresh();
      toast.success("ეტაპი წარმატებით განახლდა!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error("შეცდომა: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-fg-tertiary)]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            კამპანიის ეტაპების მართვა
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Change the active campaign progress step to control the green progress bar on the landing page
          </p>
        </div>
      </div>

      {/* Step Selector Card */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-6">
        {/* Info bar */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border-primary)] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center">
            <Layers size={18} className="text-[var(--color-fg-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--color-fg-tertiary)]">
            აირჩიეთ მიმდინარე ეტაპი — მთავარ გვერდზე მწვანე პროგრესის ხაზი ავტომატურად განახლდება:
          </p>
        </div>

        {/* Step Options */}
        <div className="grid gap-3">
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center justify-between w-full p-4 rounded-xl border cursor-pointer transition-all text-left ${
                currentStep === step.id
                  ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
                  : "border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] bg-[var(--color-bg-surface)]"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Radio indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    currentStep === step.id
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-[var(--color-border-primary)]"
                  }`}
                >
                  {currentStep === step.id && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-fg-primary)]">{step.title}</div>
                  <div className="text-xs text-[var(--color-fg-tertiary)]">{step.desc}</div>
                </div>
              </div>
              {currentStep === step.id && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                  აქტიური
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-primary)]">
          {success ? (
            <span className="inline-flex items-center gap-2 text-emerald-500 font-medium text-sm">
              <CheckCircle2 size={16} /> ეტაპი განახლდა!
            </span>
          ) : (
            <div />
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "ინახება..." : "ეტაპის შენახვა"}
          </button>
        </div>
      </div>

      {/* Info notice */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-600">
          ეს პარამეტრი აკონტროლებს მთავარ გვერდზე არსებულ მწვანე პროგრეს ზოლს. 
          მაგალითად, თუ აირჩევთ „ეტაპი 2: განხილვა“, პროგრესის ზოლი გვიჩვენებს 33%-ს (1 დასრულებული ეტაპი 4-დან).
        </p>
      </div>
    </div>
  );
}
