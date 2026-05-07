import { Save, Store, Truck, Search, Share2 } from "lucide-react";
import { useState } from "react";

const inputClass =
  "w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "block text-sm font-medium mb-1";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-lg border border-border p-6">
    <h2 className="font-semibold mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const AdminSettings = () => {
  const [form, setForm] = useState({
    storeName: "TechStore50",
    storeEmail: "contact@techstore50.com",
    storePhone: "",
    storeDescription: "Dyqani online më i madh për teknologji",
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
  });

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-6">
      {/* Store Info */}
      <Section icon={Store} title="Informatat e dyqanit">
        <div>
          <label className={labelClass}>Emri i dyqanit</label>
          <input
            type="text"
            value={form.storeName}
            onChange={set("storeName")}
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

      {/* Shipping */}
      <Section icon={Truck} title="Transporti">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Çmimi i transportit (€)</label>
            <input
              type="number"
              min="0"
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
            className={inputClass}
          />
        </div>
      </Section>

      {/* SEO */}
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

      {/* Social */}
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

      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90">
        <Save className="h-4 w-4" /> Ruaj ndryshimet
      </button>
    </div>
  );
};

export default AdminSettings;
