import { useTranslation } from "react-i18next";

function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage === "am" ? "am" : "en";

  const setLang = (lang: "en" | "am") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`lang-switcher ${className ?? ""}`} role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-switcher-btn ${current === "en" ? "active" : ""}`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-switcher-btn ${current === "am" ? "active" : ""}`}
        onClick={() => setLang("am")}
      >
        አማ
      </button>
    </div>
  );
}

export default LanguageSwitcher;
