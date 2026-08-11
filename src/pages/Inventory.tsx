import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import amoxaImg from "../assets/amoxa.png";
import medImg from "../assets/Medicine.jpeg";
import "../css/pharmacy-dashboard.css";
import "../css/form.css";
import "../css/popup.css";

type InventoryItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  dosages: string[];
  image?: string;
};

type InventoryApiResult = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  dosages: string[];
  img_url: string;
};

type FormState = {
  title: string;
  description: string;
  price: string;
  quantity: string;
  dosages: string[];
  image: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  quantity: "",
  dosages: [],
  image: "",
};

const DOSAGE_UNITS = ["mg", "mcg", "g", "ml"];

type DrugSearchResult = {
  key: string;
  name: string;
  description: string;
  dosageHint: string[];
  setId?: string;
};

type OpenFdaLabelResult = {
  id?: string;
  set_id?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
  };
  purpose?: string[];
  indications_and_usage?: string[];
  active_ingredient?: string[];
};

const OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const DRUG_IMAGE_URL = "http://127.0.0.1:8000/api/drug-image/";

function extractDescription(result: OpenFdaLabelResult): string {
  const purpose = result.purpose?.[0];
  if (purpose) {
    return purpose.replace(/^purpose\s*/i, "").trim();
  }
  const uses = result.indications_and_usage?.[0];
  if (uses) {
    return uses.replace(/^uses\s*/i, "").slice(0, 160).trim();
  }
  return "";
}

function extractDosageHint(result: OpenFdaLabelResult): string[] {
  const ingredient = result.active_ingredient?.[0];
  if (!ingredient) return [];
  const matches = ingredient.match(/\d+(\.\d+)?\s?(mg|mcg|g|ml)\b/gi);
  if (!matches) return [];
  return Array.from(
    new Set(matches.map((m) => m.replace(/\s+/g, "").toLowerCase())),
  );
}

const initialItems: InventoryItem[] = [
  {
    id: "seed-1",
    title: "Albendazol",
    description: "Broad-spectrum antiparasitic tablet.",
    price: 4.99,
    quantity: 32,
    dosages: ["200mg", "400mg", "600mg"],
    image: amoxaImg,
  },
  {
    id: "seed-2",
    title: "Amoxicillin",
    description: "Penicillin-based antibiotic capsule.",
    price: 6.5,
    quantity: 12,
    dosages: ["250mg", "500mg"],
    image: medImg,
  },
];

function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchErrored, setSearchErrored] = useState(false);
  const [searchResults, setSearchResults] = useState<DrugSearchResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [appliedResultName, setAppliedResultName] = useState<string | null>(
    null,
  );
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState(DOSAGE_UNITS[0]);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const formatEtb = (price: number) =>
    t("common.priceLabel", { price: price.toFixed(2) });

  const resetSearch = () => {
    setSearchTerm("");
    setSearching(false);
    setSearchAttempted(false);
    setSearchErrored(false);
    setSearchResults([]);
    setImageLoading(false);
    setAppliedResultName(null);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDosageAmount("");
    setDosageUnit(DOSAGE_UNITS[0]);
    resetSearch();
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      quantity: String(item.quantity),
      dosages: item.dosages,
      image: item.image ?? "",
    });
    setDosageAmount("");
    setDosageUnit(DOSAGE_UNITS[0]);
    resetSearch();
    setModalOpen(true);
  };

  const addDosage = () => {
    const amount = dosageAmount.trim();
    if (!amount) return;
    const dosage = `${amount}${dosageUnit}`;
    setForm((f) =>
      f.dosages.includes(dosage) ? f : { ...f, dosages: [...f.dosages, dosage] },
    );
    setDosageAmount("");
  };

  const removeDosage = (dosage: string) => {
    setForm((f) => ({
      ...f,
      dosages: f.dosages.filter((d) => d !== dosage),
    }));
  };

  const closeModal = () => setModalOpen(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setSearching(true);
    setSearchAttempted(true);
    setSearchErrored(false);
    setAppliedResultName(null);

    try {
      const encoded = encodeURIComponent(term);
      const url = `${OPENFDA_LABEL_URL}?search=openfda.generic_name:${encoded}*+openfda.brand_name:${encoded}*&limit=10`;
      const response = await fetch(url);

      if (!response.ok) {
        setSearchResults([]);
        setSearchErrored(response.status !== 404);
        return;
      }

      const data: { results?: OpenFdaLabelResult[] } = await response.json();
      const seen = new Set<string>();
      const results: DrugSearchResult[] = [];

      for (const result of data.results ?? []) {
        const name =
          result.openfda?.brand_name?.[0] ?? result.openfda?.generic_name?.[0];
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        results.push({
          key: result.id ?? name,
          name,
          description: extractDescription(result),
          dosageHint: extractDosageHint(result),
          setId: result.set_id,
        });

        if (results.length >= 6) break;
      }

      setSearchResults(results);
    } catch {
      setSearchResults([]);
      setSearchErrored(true);
    } finally {
      setSearching(false);
    }
  };

  const applySearchResult = (result: DrugSearchResult) => {
    setForm((f) => ({
      ...f,
      title: result.name,
      description: result.description || f.description,
      dosages: result.dosageHint.length ? result.dosageHint : f.dosages,
    }));
    setSearchResults([]);
    setSearchAttempted(false);
    setAppliedResultName(result.name);

    if (result.setId) {
      setImageLoading(true);
      fetch(`${DRUG_IMAGE_URL}?set_id=${encodeURIComponent(result.setId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { image_url?: string | null } | null) => {
          if (data?.image_url) {
            setForm((f) => ({ ...f, image: data.image_url as string }));
          }
        })
        .catch(() => {
          // Image lookup is best-effort; the Image URL field stays manually editable either way.
        })
        .finally(() => setImageLoading(false));
    }
  };

  const triggerProductImagePick = () => productImageInputRef.current?.click();

  const handleProductImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t("inventory.confirmDelete"))) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const loadMedicines = async () => {
    const response= await fetch('http://127.0.0.1:8000/api/orders/inventory/',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
        },
        

      }
    );
    if(!response.ok){
      alert(t("inventory.loadError"));
      return;
    }

    const data: { results: InventoryApiResult[] } = await response.json();
    setItems(
      data.results.map((item) => ({
        id: String(item.id),
        title: item.name,
        description: "",
        price: Number(item.price),
        quantity: item.quantity,
        dosages: item.dosages,
        image: item.img_url || undefined,
      })),
    );

  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name= form.title;
    const description=form.description.trim();
    const price= Number(form.price);
    const  quantity=Number(form.quantity);
    const  dosages =form.dosages;
    const  img_url =form.image.trim();

    const url = editingId
      ? `http://127.0.0.1:8000/api/orders/inventory/${editingId}/`
      : "http://127.0.0.1:8000/api/orders/inventory/add/";

    const response= await fetch(url,{
      method: editingId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("tenadam_auth_token")}`,
      },
      body: JSON.stringify({
        name,
        description,
        price,
        quantity,
        dosages,
        img_url,
      }),
    })

    if (!response.ok) {
      alert(t("inventory.saveError"));
      return;
    }
    
    

   
    

    

    const nextItem: InventoryItem = {
      id: editingId ?? `item-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      dosages: form.dosages,
      image: form.image.trim() || undefined,
    };

    setItems((prev) =>
      editingId
        ? prev.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...prev],
    );

    setModalOpen(false);
  };

  useEffect(() => {loadMedicines();}, []);

  return (
    <main className="pharmacy-page content-with-nav">
      <section className="pharmacy-hero">
        <p className="pharmacy-eyebrow">{t("pharmacy.dashboardEyebrow")}</p>
        <h1>{t("inventory.title")}</h1>
        <p>{t("inventory.subtitle")}</p>
      </section>
      <section className="pharmacy-section">
        <div className="inventory-toolbar">
          <Link to="/medicinedealer" className="inventory-back-link">
            <i className="material-icons">arrow_back</i>
            {t("inventory.backToOrders")}
          </Link>
          <button
            type="button"
            className="inventory-add-btn"
            onClick={openAddModal}
          >
            <i className="material-icons">add</i>
            {t("inventory.addMedicine")}
          </button>
        </div>
        {items.length === 0 ? (
          <div className="pharmacy-empty">
            <p>{t("inventory.emptyText")}</p>
          </div>
        ) : (
          <div className="inventory-list">
            {items.map((item) => (
              <div className="inventory-row" key={item.id}>
                {item.image ? (
                  <img
                    className="inventory-row-image"
                    src={item.image}
                    alt={item.title}
                  />
                ) : (
                  <div className="inventory-row-image inventory-row-image-placeholder">
                    <i className="material-icons">medication</i>
                  </div>
                )}
                <div className="inventory-row-info">
                  <strong>{item.title}</strong>
                  <span className="inventory-row-desc">
                    {item.description}
                  </span>
                  {item.dosages.length > 0 && (
                    <span className="inventory-row-dosages">
                      {item.dosages.join(" · ")}
                    </span>
                  )}
                </div>
                <div className="inventory-row-price">
                  {formatEtb(item.price)}
                </div>

                <div className="inventory-row-qty">
                  <span
                    className={`inventory-qty-badge${item.quantity === 0 ? " out" : item.quantity <= 5 ? " low" : ""}`}
                  >
                    {t("inventory.qtyInStock", { count: item.quantity })}
                  </span>
                </div>
                <div className="inventory-row-actions">
                  <button
                    type="button"
                    className="inventory-icon-btn"
                    aria-label={t("inventory.edit")}
                    onClick={() => openEditModal(item)}
                  >
                    <i className="material-icons">edit</i>
                  </button>
                  <button
                    type="button"
                    className="inventory-icon-btn delete"
                    aria-label={t("inventory.delete")}
                    onClick={() => handleDelete(item.id)}
                  >
                    <i className="material-icons">delete</i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {modalOpen && (
        <div
          className="popup-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="popup-container" onClick={(e) => e.stopPropagation()}>
            <div className="inner-popup">
              <button
                className="popup-close"
                onClick={closeModal}
                aria-label={t("common.closeDialog")}
              >
                ✕
              </button>
              <h3 className="popup-title">
                {editingId
                  ? t("inventory.editMedicine")
                  : t("inventory.addMedicine")}
              </h3>
              <div className="popup-body">
              {!editingId && (
                <div className="inventory-search-block">
                  <form className="inventory-search-form" onSubmit={handleSearch}>
                    <div className="inventory-search-input-shell">
                      <i className="material-icons">search</i>
                      <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("inventory.searchDrugPlaceholder")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="inventory-search-btn"
                      disabled={searching || !searchTerm.trim()}
                    >
                      {searching
                        ? t("inventory.searching")
                        : t("inventory.search")}
                    </button>
                  </form>
                  <p className="inventory-search-hint">
                    {t("inventory.searchHint")}
                  </p>

                  {appliedResultName && (
                    <p className="inventory-search-applied">
                      <i className="material-icons">check_circle</i>
                      {t("inventory.searchApplied", {
                        name: appliedResultName,
                      })}
                    </p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="inventory-search-results">
                      {searchResults.map((result) => (
                        <button
                          type="button"
                          key={result.key}
                          className="inventory-search-result"
                          onClick={() => applySearchResult(result)}
                        >
                          <strong>{result.name}</strong>
                          {result.description && (
                            <span>{result.description}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchAttempted &&
                    !searching &&
                    searchResults.length === 0 && (
                      <p className="inventory-search-status">
                        {searchErrored
                          ? t("inventory.searchError")
                          : t("inventory.searchNoMatches")}
                      </p>
                    )}
                </div>
              )}
              <form
                id="inventory-item-form"
                className="form"
                onSubmit={handleSubmit}
              >
                <div className="field-group">
                  <label className="field-label" htmlFor="inv-title">
                    {t("inventory.name")}
                  </label>
                  <input
                    id="inv-title"
                    value={form.title}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, title: e.target.value }));
                      setAppliedResultName(null);
                    }}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="inv-description">
                    {t("inventory.description")}
                  </label>
                  <textarea
                    id="inv-description"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="inv-price">
                    {t("inventory.price")}
                  </label>
                  <input
                    id="inv-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="inv-quantity">
                    {t("inventory.quantity")}
                  </label>
                  <input
                    id="inv-quantity"
                    type="number"
                    min={0}
                    step="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, quantity: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="inv-dosage-amount">
                    {t("inventory.dosages")}
                  </label>
                  <div className="inventory-dosage-builder">
                    <input
                      id="inv-dosage-amount"
                      type="number"
                      min={0}
                      step="any"
                      placeholder={t("inventory.dosageAmount")}
                      value={dosageAmount}
                      onChange={(e) => setDosageAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addDosage();
                        }
                      }}
                    />
                    <select
                      aria-label={t("inventory.dosageUnit")}
                      value={dosageUnit}
                      onChange={(e) => setDosageUnit(e.target.value)}
                      className="inventory-dosage-choose"
                    >
                      {DOSAGE_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="inventory-dosage-add-btn"
                      onClick={addDosage}
                      disabled={!dosageAmount.trim()}
                    >
                      {t("inventory.addDosage")}
                    </button>
                  </div>
                  {form.dosages.length > 0 ? (
                    <div className="inventory-dosage-chips">
                      {form.dosages.map((dosage) => (
                        <span className="inventory-dosage-chip" key={dosage}>
                          {dosage}
                          <button
                            type="button"
                            aria-label={t("inventory.removeDosage", {
                              dosage,
                            })}
                            onClick={() => removeDosage(dosage)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="inventory-dosage-empty">
                      {t("inventory.noDosagesYet")}
                    </p>
                  )}
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="inv-image">
                    {t("inventory.imageUrl")}
                  </label>
                  <div className="inventory-image-input-row">
                    <input
                      id="inv-image"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="inventory-upload-btn"
                      onClick={triggerProductImagePick}
                    >
                      <i className="material-icons">upload</i>
                      {t("inventory.uploadPhoto")}
                    </button>
                  </div>
                  <input
                    ref={productImageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleProductImageChange}
                  />
                  {imageLoading && (
                    <p className="inventory-image-status">
                      {t("inventory.fetchingImage")}
                    </p>
                  )}
                  {!imageLoading && form.image && (
                    <img
                      className="inventory-image-preview"
                      src={form.image}
                      alt={t("inventory.imagePreviewAlt")}
                    />
                  )}
                </div>
              </form>
              </div>


              <div className="popup-actions">
                <button
                  type="submit"
                  form="inventory-item-form"
                  className="auth-submit"
                >
                  {t("inventory.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Inventory;
