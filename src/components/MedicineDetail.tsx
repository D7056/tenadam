import "../css/popup.css";
import { useEffect, useRef, useState } from "react";
import Lightbox from "./Lightbox";
import { useTranslation } from "react-i18next";

type Medicine = {
  title: string;
  description?: string;
  image?: string;
  dosages?: string[];
  dealerName?: string;
};

type OrderInfo = {
  quantity: number;
  dosage: string;
};

type Props = {
  medicine: Medicine;
  close: () => void;
  onAddToCart: (item: OrderInfo) => void;
  onBuyNow: (item: OrderInfo) => void;
};

export default function MedicineDetail({
  medicine,
  close,
  onAddToCart,
  onBuyNow,
}: Props) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dosage, setDosage] = useState(medicine.dosages?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);


  useEffect(() => {
    const adjust = () => {
      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container) return;
      const containerRect = container.getBoundingClientRect();
      const titleEl = container.querySelector<HTMLElement>(".popup-title");
      const titleH = titleEl ? titleEl.getBoundingClientRect().height : 0;
      const footerEl = container.querySelector<HTMLElement>(".popup-actions");
      const footerH = footerEl ? footerEl.getBoundingClientRect().height : 0;
      const reserve = 160;
      const available = Math.max(
        120,
        containerRect.height - titleH - footerH - reserve,
      );
      const naturalH = img.naturalHeight || img.getBoundingClientRect().height;
      const cap = Math.min(available, window.innerHeight * 0.8);
      if (naturalH > cap) {
        img.style.maxHeight = `${cap}px`;
      } else {
        img.style.maxHeight = "";
      }
    };
    adjust();

    const img = imgRef.current;
    const onLoad = () => adjust();
    if (img) {
      img.addEventListener("load", onLoad);
    }
    window.addEventListener("resize", adjust);
    return () => {
      if (img) img.removeEventListener("load", onLoad);
      window.removeEventListener("resize", adjust);
    };
  }, []);

  const clickOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) close();
  };

  const handleAddToCart = () => {
    onAddToCart({ quantity, dosage });
    close();
  };

  const handleBuy = () => {
    onBuyNow({ quantity, dosage });
    close();
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <div
        className="popup-overlay"
        ref={overlayRef}
        onClick={clickOverlay}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="popup-container"
          ref={containerRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inner-popup">
            <button
              className="popup-close"
              onClick={close}
              aria-label={t("common.closeDialog")}
            >
              ✕
            </button>
            <h3 className="popup-title">{medicine.title}</h3>
            {medicine.dealerName && (
              <p className="popup-dealer">
                {t("medicine.soldBy", { dealer: medicine.dealerName })}
              </p>
            )}
            <div className="popup-body">
              {medicine.image && (
                <div style={{ marginBottom: 8 }}>
                  <img
                    ref={imgRef}
                    src={medicine.image}
                    alt={medicine.title}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      cursor: "zoom-in",
                    }}
                    onClick={openLightbox}
                  />
                  <Lightbox
                    open={lightboxOpen}
                    src={medicine.image}
                    alt={medicine.title}
                    onClose={closeLightbox}
                  />
                </div>
              )}
              <p>{medicine.description}</p>
              <div className="row">
                <label className="col-sm-5 col-md-6">
                  {t("medicine.dosage")}
                </label>
                <div className="col-sm-7 col-md-6">
                  <select
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  >
                    {(medicine.dosages ?? [""]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row">
                <label className="col-sm-5 col-md-6">
                  {t("medicine.quantity")}
                </label>
                <div className="col-sm-7 col-md-6">
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value || 1)))
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className="popup-actions"
              style={{ display: "flex", gap: 8, justifyContent: "center" }}
            >
              <button className="btns" onClick={handleAddToCart}>
                {t("medicine.addToCart")}
              </button>
              <button className="btns" onClick={handleBuy}>
                {t("medicine.buyNow")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
