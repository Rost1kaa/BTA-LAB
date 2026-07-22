"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Trash2, Eye, EyeOff, Languages } from "lucide-react";
import { createServicePackage, deleteServicePackage, updateServicePackage } from "@/lib/actions/services";
import toast from "react-hot-toast";
import type { ServicePackage } from "@/types/supabase";

function textValue(value: string | null | undefined) {
  return typeof value === "string" ? value : "";
}

export default function ServicesAdminPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ka" | "en">("ka");

  const [form, setForm] = useState({
    section: "website",
    name_ka: "",
    name_en: "",
    price: "",
    price_suffix_ka: "",
    price_suffix_en: "",
    custom_price_label_ka: "ინდივიდუალური",
    custom_price_label_en: "Custom",
    billing_label_ka: "",
    billing_label_en: "",
    description_ka: "",
    description_en: "",
    ideal_for_ka: "",
    ideal_for_en: "",
    features_ka: "",
    features_en: "",
    delivery_time_ka: "",
    delivery_time_en: "",
    cta_label_ka: "პაკეტის არჩევა",
    cta_label_en: "Choose Package",
    highlighted: false,
    custom_price: false,
    price_explanation: "",
    price_explanation_ka: "",
    price_explanation_en: "",
    published: true,
    display_order: 0,
  });

  const loadPackages = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("service_packages")
        .select("*")
        .order("section")
        .order("display_order");
      setPackages(data || []);
    } catch {
      toast.error("Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPackages();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPackages]);

  function resetForm() {
    setForm({
      section: "website",
      name_ka: "",
      name_en: "",
      price: "",
      price_suffix_ka: "",
      price_suffix_en: "",
      custom_price_label_ka: "ინდივიდუალური",
      custom_price_label_en: "Custom",
      billing_label_ka: "",
      billing_label_en: "",
      description_ka: "",
      description_en: "",
      ideal_for_ka: "",
      ideal_for_en: "",
      features_ka: "",
      features_en: "",
      delivery_time_ka: "",
      delivery_time_en: "",
      cta_label_ka: "პაკეტის არჩევა",
      cta_label_en: "Choose Package",
      highlighted: false,
      custom_price: false,
      price_explanation: "",
      price_explanation_ka: "",
      price_explanation_en: "",
      published: true,
      display_order: packages.filter((p) => p.section === form.section).length,
    });
    setEditingId(null);
    setActiveLocale("ka");
  }

  function editPkg(pkg: ServicePackage) {
    setForm({
      section: pkg.section,
      name_ka: textValue(pkg.name_ka),
      name_en: textValue(pkg.name_en) || pkg.name,
      price: pkg.price,
      price_suffix_ka: textValue(pkg.price_suffix_ka),
      price_suffix_en: textValue(pkg.price_suffix_en),
      custom_price_label_ka: textValue(pkg.custom_price_label_ka) || (pkg.custom_price ? "ინდივიდუალური" : ""),
      custom_price_label_en: textValue(pkg.custom_price_label_en) || (pkg.custom_price ? "Custom" : ""),
      billing_label_ka: textValue(pkg.billing_label_ka),
      billing_label_en: textValue(pkg.billing_label_en) || textValue(pkg.billing_label),
      description_ka: textValue(pkg.description_ka),
      description_en: textValue(pkg.description_en) || textValue(pkg.description),
      ideal_for_ka: textValue(pkg.ideal_for_ka),
      ideal_for_en: textValue(pkg.ideal_for_en) || textValue(pkg.ideal_for),
      features_ka: (pkg.features_ka || []).join("\n"),
      features_en: (pkg.features_en || pkg.features || []).join("\n"),
      delivery_time_ka: textValue(pkg.delivery_time_ka),
      delivery_time_en: textValue(pkg.delivery_time_en) || textValue(pkg.delivery_time),
      cta_label_ka: textValue(pkg.cta_label_ka) || textValue(pkg.cta_ka),
      cta_label_en: textValue(pkg.cta_label_en) || textValue(pkg.cta_en) || pkg.cta,
      highlighted: pkg.highlighted,
      custom_price: pkg.custom_price,
      price_explanation: pkg.price_explanation || "",
      price_explanation_ka: textValue(pkg.price_explanation_ka),
      price_explanation_en: pkg.price_explanation_en || pkg.price_explanation || "",
      published: pkg.published,
      display_order: pkg.display_order,
    });
    setEditingId(pkg.id);
    setActiveLocale("ka");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name_ka.trim() && !form.name_en.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    const payload = {
      section: form.section as "website" | "social-media" | "addons",
      name: form.name_en.trim() || form.name_ka.trim(),
      name_ka: form.name_ka.trim(),
      name_en: form.name_en.trim(),
      price: form.price.trim(),
      price_suffix_ka: form.price_suffix_ka.trim(),
      price_suffix_en: form.price_suffix_en.trim(),
      custom_price_label_ka: form.custom_price_label_ka.trim(),
      custom_price_label_en: form.custom_price_label_en.trim(),
      billing_label: form.billing_label_en.trim(),
      billing_label_ka: form.billing_label_ka.trim(),
      billing_label_en: form.billing_label_en.trim(),
      description: form.description_en.trim(),
      description_ka: form.description_ka.trim(),
      description_en: form.description_en.trim(),
      ideal_for: form.ideal_for_en.trim(),
      ideal_for_ka: form.ideal_for_ka.trim(),
      ideal_for_en: form.ideal_for_en.trim(),
      features: form.features_en.split("\n").filter((f) => f.trim()).map((f) => f.trim()),
      features_ka: form.features_ka.split("\n").filter((f) => f.trim()).map((f) => f.trim()),
      features_en: form.features_en.split("\n").filter((f) => f.trim()).map((f) => f.trim()),
      delivery_time: form.delivery_time_en.trim(),
      delivery_time_ka: form.delivery_time_ka.trim(),
      delivery_time_en: form.delivery_time_en.trim(),
      cta: form.cta_label_en.trim(),
      cta_label_ka: form.cta_label_ka.trim(),
      cta_label_en: form.cta_label_en.trim(),
      highlighted: form.highlighted,
      custom_price: form.custom_price,
      price_explanation: form.price_explanation_en.trim() || form.price_explanation.trim(),
      price_explanation_ka: form.price_explanation_ka.trim(),
      price_explanation_en: form.price_explanation_en.trim() || form.price_explanation.trim(),
      icon_name: "",
      published: form.published,
      display_order: form.display_order,
    };

    try {
      const result = editingId
        ? await updateServicePackage(editingId, payload)
        : await createServicePackage(payload);

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingId ? "Package updated!" : "Package created!");
        resetForm();
        loadPackages();
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const result = await deleteServicePackage(id);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success("Package deleted.");
        setDeleteConfirm(null);
        await loadPackages();
      }
    } catch {
      toast.error("Package could not be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-6 w-6 border-2 border-[var(--color-fg-tertiary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
          Services & Pricing
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
          Manage service packages and pricing
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
            {editingId ? "Edit Package" : "Add Package"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-primary)]">
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label htmlFor="service-section" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Section</label>
            <select id="service-section" name="section" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none appearance-none">
              <option value="website">Website</option>
              <option value="social-media">Social Media</option>
              <option value="addons">Add-ons</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="service-price" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Price</label>
            <input id="service-price" name="price" type="text" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all"
              placeholder="$199 or CUSTOM" />
          </div>
          <div className="space-y-2">
            <label htmlFor="service-display-order" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Display Order</label>
            <input id="service-display-order" type="number" min="0" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: Number.parseInt(e.target.value, 10) || 0 }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
          </div>
        </div>

        <div className="border-t border-[var(--color-border-primary)] pt-5 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-[var(--color-fg-tertiary)]" />
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">Bilingual content</h3>
                <p className="text-xs text-[var(--color-fg-tertiary)]/70">Georgian fields are first and publish separately from English fields.</p>
              </div>
            </div>
            <div className="inline-flex rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-overlay)] p-1" role="tablist" aria-label="Service package language">
              {(["ka", "en"] as const).map((locale) => (
                <button
                  key={locale}
                  type="button"
                  role="tab"
                  aria-selected={activeLocale === locale}
                  onClick={() => setActiveLocale(locale)}
                  className={`h-9 rounded-lg px-4 text-xs font-semibold transition-colors ${
                    activeLocale === locale
                      ? "bg-[var(--color-bg-surface)] text-[var(--color-fg-primary)] shadow-sm"
                      : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]"
                  }`}
                >
                  {locale === "ka" ? "Georgian" : "English"}
                </button>
              ))}
            </div>
          </div>

          {activeLocale === "ka" ? (
            <div className="space-y-4" role="tabpanel" aria-label="Georgian service package fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-name-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name - Georgian</label>
                  <input id="service-name-ka" name="name_ka" type="text" value={form.name_ka} onChange={(e) => setForm((p) => ({ ...p, name_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-billing-label-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Billing label - Georgian</label>
                  <input id="service-billing-label-ka" name="billing_label_ka" type="text" value={form.billing_label_ka} onChange={(e) => setForm((p) => ({ ...p, billing_label_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-description-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Description - Georgian</label>
                  <textarea id="service-description-ka" value={form.description_ka} onChange={(e) => setForm((p) => ({ ...p, description_ka: e.target.value }))} rows={4}
                    className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 resize-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-ideal-for-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Ideal for - Georgian</label>
                  <textarea id="service-ideal-for-ka" value={form.ideal_for_ka} onChange={(e) => setForm((p) => ({ ...p, ideal_for_ka: e.target.value }))} rows={4}
                    className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 resize-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="service-features-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Features - Georgian, one per line</label>
                <textarea id="service-features-ka" name="features_ka" value={form.features_ka} onChange={(e) => setForm((p) => ({ ...p, features_ka: e.target.value }))} rows={5}
                  className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all resize-none font-mono" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-price-suffix-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Price suffix - Georgian</label>
                  <input id="service-price-suffix-ka" type="text" value={form.price_suffix_ka} onChange={(e) => setForm((p) => ({ ...p, price_suffix_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-custom-price-label-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Custom price label - Georgian</label>
                  <input id="service-custom-price-label-ka" type="text" value={form.custom_price_label_ka} onChange={(e) => setForm((p) => ({ ...p, custom_price_label_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-delivery-time-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Delivery time - Georgian</label>
                  <input id="service-delivery-time-ka" name="delivery_time_ka" type="text" value={form.delivery_time_ka} onChange={(e) => setForm((p) => ({ ...p, delivery_time_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-cta-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">CTA label - Georgian</label>
                  <input id="service-cta-ka" type="text" value={form.cta_label_ka} onChange={(e) => setForm((p) => ({ ...p, cta_label_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-price-explanation-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Price explanation - Georgian</label>
                  <input id="service-price-explanation-ka" type="text" value={form.price_explanation_ka} onChange={(e) => setForm((p) => ({ ...p, price_explanation_ka: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4" role="tabpanel" aria-label="English service package fields">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-name-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name - English</label>
                  <input id="service-name-en" name="name_en" type="text" value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-billing-label-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Billing label - English</label>
                  <input id="service-billing-label-en" name="billing_label_en" type="text" value={form.billing_label_en} onChange={(e) => setForm((p) => ({ ...p, billing_label_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-description-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Description - English</label>
                  <textarea id="service-description-en" value={form.description_en} onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))} rows={4}
                    className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 resize-none" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-ideal-for-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Ideal for - English</label>
                  <textarea id="service-ideal-for-en" value={form.ideal_for_en} onChange={(e) => setForm((p) => ({ ...p, ideal_for_en: e.target.value }))} rows={4}
                    className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30 resize-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="service-features-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Features - English, one per line</label>
                <textarea id="service-features-en" name="features_en" value={form.features_en} onChange={(e) => setForm((p) => ({ ...p, features_en: e.target.value }))} rows={5}
                  className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all resize-none font-mono" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-price-suffix-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Price suffix - English</label>
                  <input id="service-price-suffix-en" type="text" value={form.price_suffix_en} onChange={(e) => setForm((p) => ({ ...p, price_suffix_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-custom-price-label-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Custom price label - English</label>
                  <input id="service-custom-price-label-en" type="text" value={form.custom_price_label_en} onChange={(e) => setForm((p) => ({ ...p, custom_price_label_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="service-delivery-time-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Delivery time - English</label>
                  <input id="service-delivery-time-en" name="delivery_time_en" type="text" value={form.delivery_time_en} onChange={(e) => setForm((p) => ({ ...p, delivery_time_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-cta-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">CTA label - English</label>
                  <input id="service-cta-en" type="text" value={form.cta_label_en} onChange={(e) => setForm((p) => ({ ...p, cta_label_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service-price-explanation-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Price explanation - English</label>
                  <input id="service-price-explanation-en" type="text" value={form.price_explanation_en} onChange={(e) => setForm((p) => ({ ...p, price_explanation_en: e.target.value }))}
                    className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.highlighted} onChange={(e) => setForm((p) => ({ ...p, highlighted: e.target.checked }))} />
            <span className="text-sm text-[var(--color-fg-primary)]">Highlighted</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.custom_price} onChange={(e) => setForm((p) => ({ ...p, custom_price: e.target.checked }))} />
            <span className="text-sm text-[var(--color-fg-primary)]">Custom Price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
            <span className="text-sm text-[var(--color-fg-primary)]">Published</span>
          </label>
        </div>

        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm">
          <Save size={16} />
          {saving ? "Saving..." : editingId ? "Update Package" : "Add Package"}
        </button>
      </form>

      {/* Packages List */}
      {(["website", "social-media", "addons"] as const).map((section) => {
        const sectionPackages = packages.filter((p) => p.section === section);
        if (sectionPackages.length === 0) return null;

        return (
          <div key={section} className="mb-8">
            <h3 className="text-sm font-semibold text-[var(--color-fg-primary)] capitalize mb-4">
              {section === "website" ? "Website Development" : section === "social-media" ? "Social Media" : "Add-ons"}
            </h3>
            <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden md:table-cell">Price</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-primary)]">
                  {sectionPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-[var(--color-overlay)]/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-fg-primary)]">{pkg.name}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-[var(--color-fg-tertiary)]/70">{pkg.price}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {pkg.published ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500"><Eye size={12} /> Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-500"><EyeOff size={12} /> Hidden</span>
                        )}
                      </td>
                      <td className="relative px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => editPkg(pkg)} aria-label={`Edit ${pkg.name}`} className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-all">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(pkg.id)} aria-label={`Delete ${pkg.name}`} className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {deleteConfirm === pkg.id && (
                          <div className="absolute right-0 mt-2 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-red-500/20 shadow-lg z-10 min-w-[280px]">
                            <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-1">Delete &ldquo;{pkg.name}&rdquo;?</p>
                            <p className="text-xs text-[var(--color-fg-tertiary)]/70 mb-3">This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleDelete(pkg.id)} disabled={deleting} className="flex-1 h-9 bg-red-500 text-white text-xs font-medium rounded-xl disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
                              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 h-9 bg-[var(--color-overlay)] text-xs rounded-xl">Cancel</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

