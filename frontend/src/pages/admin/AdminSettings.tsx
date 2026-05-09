import {
  Save,
  Store,
  Truck,
  Search,
  Share2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useAdminStore } from "@/stores/adminStore";

// ─── Styles ────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground transition-colors";

const labelClass = "block text-sm font-medium mb-1 text-foreground";

// ─── Section wrapper ────────────────────────────────────────────────────────────

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
    <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

// ─── Feedback banner ────────────────────────────────────────────────────────────

const Feedback = ({ ok, msg }: { ok: boolean; msg: string }) => (
  <div
    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
      ok
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-red-50 text-red-700 border border-red-200"
    }`}
  >
    {ok ? (
      <CheckCircle className="h-4 w-4 shrink-0" />
    ) : (
      <AlertCircle className="h-4 w-4 shrink-0" />
    )}
    {msg}
  </div>
);

// ─── Form shape ─────────────────────────────────────────────────────────────────

interface SettingsForm {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeDescription: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  shippingPrice: string;
  freeShippingThreshold: string;
  deliveryTime: string;
  metaTitle: string;
  metaDescription: string;
  facebook: string;
  instagram: string;
  tiktok: string;
}

const defaultForm: SettingsForm = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  storeDescription: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  shippingPrice: "0",
  freeShippingThreshold: "",
  deliveryTime: "1-3 ditë pune",
  metaTitle: "",
  metaDescription: "",
  facebook: "",
  instagram: "",
  tiktok: "",
};

// ─── Component ──────────────────────────────────────────────────────────────────

const AdminSettings = () => {
  const { getToken } = useAuth();
  const { createAdminSettings, updateAdminSettings, fetchAdminSettings } =
    useAdminStore();

  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [isExisting, setIsExisting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  // ── Load existing settings on mount ──────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const { fetchAdminSettings } = useAdminStore.getState();
        const data = await fetchAdminSettings(token);

        if (data?.id) {
          setIsExisting(true);
          setForm({
            storeName: data.storeName ?? "",
            storeEmail: data.storeEmail ?? "",
            storePhone: data.storePhone ?? "",
            storeDescription: data.storeDescription ?? "",
            street: data.street ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            zipCode: data.zipCode ?? "",
            shippingPrice:
              data.shippingPrice !== undefined
                ? String(data.shippingPrice)
                : "0",
            freeShippingThreshold:
              data.freeShippingThreshold != null
                ? String(data.freeShippingThreshold)
                : "",
            deliveryTime: data.deliveryTime ?? "1-3 ditë pune",
            metaTitle: data.metaTitle ?? "",
            metaDescription: data.metaDescription ?? "",
            facebook: data.facebook ?? "",
            instagram: data.instagram ?? "",
            tiktok: data.tiktok ?? "",
          });
        }
      } catch (err) {
        console.error("Could not load settings:", err);
      } finally {
        setIsFetching(false);
      }
    };

    load();
  }, [getToken]);

  // ── Field change helper ───────────────────────────────────────────────────────

  const set =
    (field: keyof SettingsForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Build payload ─────────────────────────────────────────────────────────────

  const buildPayload = () => ({
    storeName: form.storeName || undefined,
    storeEmail: form.storeEmail || undefined,
    storePhone: form.storePhone || undefined,
    storeDescription: form.storeDescription || undefined,
    street: form.street || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    zipCode: form.zipCode || undefined,
    shippingPrice:
      form.shippingPrice !== "" ? parseFloat(form.shippingPrice) : 0,
    freeShippingThreshold:
      form.freeShippingThreshold !== ""
        ? parseFloat(form.freeShippingThreshold)
        : null,
    deliveryTime: form.deliveryTime || undefined,
    metaTitle: form.metaTitle || undefined,
    metaDescription: form.metaDescription || undefined,
    facebook: form.facebook || undefined,
    instagram: form.instagram || undefined,
    tiktok: form.tiktok || undefined,
  });

  // ── Save handler ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return;

    setIsSaving(true);
    setFeedback(null);

    const action = isExisting ? updateAdminSettings : createAdminSettings;
    const result = await action(token, buildPayload());

    if (result.ok) {
      setIsExisting(true);
      setFeedback({ ok: true, msg: "Ndryshimet u ruajtën me sukses!" });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ ok: false, msg: result.error });
    }

    setIsSaving(false);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="max-w-2xl space-y-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-border p-6 animate-pulse"
          >
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="space-y-3">
              <div className="h-9 bg-muted rounded" />
              <div className="h-9 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-6">
      {/* ── Store Info ─────────────────────────────────────────────────────────── */}
      <Section icon={Store} title="Informatat e dyqanit">
        <div>
          <label className={labelClass}>Emri i dyqanit</label>
          <input
            type="text"
            value={form.storeName}
            onChange={set("storeName")}
            placeholder="TechStore50"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email kontakti</label>
            <input
              type="email"
              value={form.storeEmail}
              onChange={set("storeEmail")}
              placeholder="contact@techstore50.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefon kontakti</label>
            <input
              type="tel"
              value={form.storePhone}
              onChange={set("storePhone")}
              placeholder="+383 44 000 000"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Përshkrimi</label>
          <textarea
            rows={3}
            value={form.storeDescription}
            onChange={set("storeDescription")}
            placeholder="Dyqani online më i madh për teknologji"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className={labelClass}>Adresa</label>
          <input
            type="text"
            value={form.street}
            onChange={set("street")}
            placeholder="Rruga"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Qyteti</label>
            <input
              type="text"
              value={form.city}
              onChange={set("city")}
              placeholder="Prishtinë"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Shteti</label>
            <input
              type="text"
              value={form.state}
              onChange={set("state")}
              placeholder="Kosovo"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kodi postar</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={set("zipCode")}
              placeholder="10000"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* ── Shipping ───────────────────────────────────────────────────────────── */}
      <Section icon={Truck} title="Transporti">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Çmimi i transportit (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.shippingPrice}
              onChange={set("shippingPrice")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Transport falas mbi (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.freeShippingThreshold}
              onChange={set("freeShippingThreshold")}
              placeholder="p.sh. 50"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Koha e dërgesës</label>
          <input
            type="text"
            value={form.deliveryTime}
            onChange={set("deliveryTime")}
            placeholder="1-3 ditë pune"
            className={inputClass}
          />
        </div>
      </Section>

      {/* ── SEO ────────────────────────────────────────────────────────────────── */}
      <Section icon={Search} title="SEO">
        <div>
          <label className={labelClass}>Titulli meta</label>
          <input
            type="text"
            value={form.metaTitle}
            onChange={set("metaTitle")}
            placeholder="TechStore50 – Teknologji online"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Përshkrimi meta</label>
          <textarea
            rows={2}
            value={form.metaDescription}
            onChange={set("metaDescription")}
            placeholder="Përshkrim i shkurtër për motorët e kërkimit..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </Section>

      {/* ── Social ─────────────────────────────────────────────────────────────── */}
      <Section icon={Share2} title="Rrjetet sociale">
        <div>
          <label className={labelClass}>Facebook</label>
          <input
            type="url"
            value={form.facebook}
            onChange={set("facebook")}
            placeholder="https://facebook.com/techstore50"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input
            type="url"
            value={form.instagram}
            onChange={set("instagram")}
            placeholder="https://instagram.com/techstore50"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>TikTok</label>
          <input
            type="url"
            value={form.tiktok}
            onChange={set("tiktok")}
            placeholder="https://tiktok.com/@techstore50"
            className={inputClass}
          />
        </div>
      </Section>

      {/* ── Feedback ───────────────────────────────────────────────────────────── */}
      {feedback && <Feedback ok={feedback.ok} msg={feedback.msg} />}

      {/* ── Save button ────────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSaving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
      </button>
    </div>
  );
};

export default AdminSettings;
