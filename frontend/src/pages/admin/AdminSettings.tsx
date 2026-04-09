import { Save } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="font-semibold mb-4">Informatat e dyqanit</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Emri i dyqanit
            </label>
            <input
              type="text"
              defaultValue="TechStore50"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email kontakti
            </label>
            <input
              type="email"
              defaultValue="contact@techstore50.com"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Përshkrimi</label>
            <textarea
              rows={3}
              defaultValue="Dyqani online më i madh për teknologji"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="font-semibold mb-4">Transporti</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Çmimi i transportit
            </label>
            <input
              type="text"
              defaultValue="Falas"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Koha e dërgesës
            </label>
            <input
              type="text"
              defaultValue="1-3 ditë pune"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90">
        <Save className="h-4 w-4" /> Ruaj ndryshimet
      </button>
    </div>
  );
};

export default AdminSettings;
