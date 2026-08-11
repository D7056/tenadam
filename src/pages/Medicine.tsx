import "../css/medicine.css";
import Cards from "../components/Cards";
import { CartContext } from "../context/cartContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MedicineDetail from "../components/MedicineDetail";

type MedicineListing = {
  id: string;
  dealerId: string;
  dealerName: string;
  title: string;
  description: string;
  image: string;
  price: number;
  dosages: string[];
};

type ItemApiResult = {
  id: number;
  dealer: number;
  dealer_name: string;
  name: string;
  price: string;
  quantity: number;
  dosages: string[];
  img_url: string;
};

const ITEMS_URL = "http://127.0.0.1:8000/api/orders/items/";
const PAGE_SIZE = 6;

function Medicine() {
  const { t } = useTranslation();
  const cart = useContext(CartContext);
  const navigate = useNavigate();
  const [selectedMed, setSelectedMed] = useState<MedicineListing | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [medicines, setMedicines] = useState<MedicineListing[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch(ITEMS_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        alert(t("medicine.loadError"));
        return;
      }
      const data: { results: ItemApiResult[] } = await response.json();

      setMedicines(
        data.results.map((med) => ({
          id: String(med.id),
          dealerId: String(med.dealer),
          dealerName: med.dealer_name,
          title: med.name,
          description: "",
          image: med.img_url,
          price: Number(med.price),
          dosages: med.dosages,
        })),
      );
      setCurrentPage(1);
    } catch {
      alert(t("medicine.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const addToCart = (
    med: MedicineListing,
    { quantity, dosage }: { quantity: number; dosage: string },
  ) => {
    cart?.addItem({
      id: dosage ? `${med.id}-${dosage}` : med.id,
      title: dosage ? `${med.title} (${dosage})` : med.title,
      price: med.price,
      image: med.image,
      quantity,
      dosage,
      dealerId: med.dealerId,
      dealerName: med.dealerName,
    });
  };

  const handleAddToCart = (
    med: MedicineListing,
    item: { quantity: number; dosage: string },
  ) => {
    addToCart(med, item);
  };

  const handleBuyNow = (
    med: MedicineListing,
    item: { quantity: number; dosage: string },
  ) => {
    addToCart(med, item);
    navigate("/checkout");
  };

  const openDetail = (med: MedicineListing) => setSelectedMed(med);
  const closeDetail = () => setSelectedMed(null);

  const totalPages = Math.max(1, Math.ceil(medicines.length / PAGE_SIZE));
  const pagedMedicines = medicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPreviousPage = () =>
    setCurrentPage((page) => Math.max(1, page - 1));
  const goToNextPage = () =>
    setCurrentPage((page) => Math.min(totalPages, page + 1));

  

  return (
    <>
      <form className="medicine-search-form">
        <input type="text" placeholder={t("medicine.searchPlaceholder")} />
        <button type="submit" className="medicine-search-button">
          {t("medicine.search")}
        </button>
      </form>
      {loading ? (
        <p className="medicine-status-text">{t("medicine.loading")}</p>
      ) : medicines.length === 0 ? (
        <p className="medicine-status-text">{t("medicine.emptyText")}</p>
      ) : (
        <>
          <div className="menu-container">
            {pagedMedicines.map((med) => (
              <Cards
                key={med.id}
                title={med.title}
                description={med.description}
                dealerName={med.dealerName}
                buttons={[
                  {
                    text: t("medicine.buyNow"),
                    link: undefined,
                    effects: () => openDetail(med),
                  },
                  {
                    text: t("medicine.addToCart"),
                    link: undefined,
                    effects: () =>
                      addToCart(med, {
                        quantity: 1,
                        dosage: med.dosages[0] ?? "",
                      }),
                  },
                ]}
                image={med.image}
                price={med.price}
                onClick={() => openDetail(med)}
              />
            ))}
          </div>

          <div className="medicine-pagination">
            <button
              type="button"
              className="medicine-page-btn"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <i className="material-icons">chevron_left</i>
              {t("medicine.previous")}
            </button>
            <span className="medicine-page-indicator">
              {t("medicine.pageIndicator", {
                current: currentPage,
                total: totalPages,
              })}
            </span>
            <button
              type="button"
              className="medicine-page-btn"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              {t("medicine.next")}
              <i className="material-icons">chevron_right</i>
            </button>
          </div>
        </>
      )}

      {selectedMed && (
        <MedicineDetail
          medicine={selectedMed}
          close={closeDetail}
          onAddToCart={(item) => handleAddToCart(selectedMed, item)}
          onBuyNow={(item) => handleBuyNow(selectedMed, item)}
        />
      )}
    </>
  );
}

export default Medicine;
