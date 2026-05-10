import { Link } from "react-router";
import { useEffect } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

const Footer = () => {
  const { settings, fetchPublicSettings } = useSettingsStore();

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  return (
    <footer className="w-full mt-12">
      {/* Main Footer */}
      <div className="bg-[hsl(0,0%,18%)] text-white">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            {/* Brand */}
            <div>
              <span className="text-2xl font-bold">
                {settings?.storeName || (
                  <>
                    tech<span className="text-primary">store</span>
                    <span className="text-primary text-lg font-normal">50</span>
                  </>
                )}
              </span>

              <p className="mt-3 text-sm text-white/60">
                {settings?.storeDescription ?? "Rri i lidhur me TechStore50"}
              </p>

              <div className="flex items-center gap-3 mt-4">
                {settings?.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  >
                    f
                  </a>
                )}

                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  >
                    📷
                  </a>
                )}

                {settings?.tiktok && (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  >
                    𝕏
                  </a>
                )}
              </div>

              <div className="mt-4 space-y-1 text-xs text-white/50">
                <p>KUSHTET E PËRDORIMIT – TECHSTORE</p>
                <p>Politika e Privatësisë</p>
                <p>Çmimi më i mirë i garantuar</p>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-semibold mb-4">Llogaria</h3>

              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link
                    to="/cart"
                    className="hover:text-primary transition-colors"
                  >
                    Shporta ime
                  </Link>
                </li>

                <li>
                  <Link
                    to="/account"
                    className="hover:text-primary transition-colors"
                  >
                    Porositë
                  </Link>
                </li>

                <li>
                  <Link
                    to="/wishlist"
                    className="hover:text-primary transition-colors"
                  >
                    Lista e dëshirave
                  </Link>
                </li>

                <li>
                  <Link
                    to="/account"
                    className="hover:text-primary transition-colors"
                  >
                    Llogaria ime
                  </Link>
                </li>
              </ul>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold mb-4">Pyetje të shpeshta</h3>

              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Për TechStore50
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pagesat
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Çështje teknike
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Transporti
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Porositë
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Kontakti</h3>

              <ul className="space-y-2 text-sm text-white/70">
                {settings?.storeEmail ? (
                  <li>{settings.storeEmail}</li>
                ) : (
                  <li>contact@techstore50.com</li>
                )}

                {settings?.storePhone && <li>{settings.storePhone}</li>}

                {settings?.city && settings?.state && (
                  <li>
                    {settings.city}, {settings.state}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[hsl(0,0%,13%)] py-4">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-8 text-center text-xs text-white/40">
          © {settings?.storeName || "TechStore50"} – Të gjitha të drejtat e
          rezervuara.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
