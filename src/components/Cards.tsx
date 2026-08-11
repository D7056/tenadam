import { Link, useNavigate } from "react-router-dom";
import "../css/card.css";
import { useRef } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type CardProps = {
  title: string;
  description: string;
  buttons: {
    text: string;
    link?: string;
    effects: (() => void) | null | undefined;
  }[];
  image: string;
  price?: number;
  dealerName?: string;
  onClick?: () => void;
  hideReadMore?: boolean;
};

function Cards({
  title,
  description,
  buttons,
  image,
  price,
  dealerName,
  onClick,
  hideReadMore = false,
}: CardProps) {
  const { t } = useTranslation();
  const [color, setColor] = useState("transparent");
  const cardRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showReadMore, setShowReadMore] = useState([false, t("common.readMore")]);
  const navigate = useNavigate();
  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent parent card click (which may open the modal)
    setShowReadMore([
      !showReadMore[0],
      showReadMore[0] ? t("common.readMore") : t("common.readLess"),
    ]);
    if (!showReadMore[0]) {
      cardRef.current!.style.height = "auto";
    } else {
      cardRef.current!.style.height = "3rem";
    }
  };

  useEffect(() => {
    if (hideReadMore) return;
    const el = cardRef.current;
    if (!el) return;
    const checkOverflow = () =>
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    checkOverflow();
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [description, hideReadMore]);

  return (
    <>
      <div className="col-12 col-md-4">
        <div
          className="my-card"
          onClick={() => {

            if (onClick) return onClick();

            const firstLinked = buttons.find((b) => !!b.link)?.link;
            if (firstLinked) navigate(firstLinked);
          }}
          onMouseEnter={() =>
            setColor(
              `linear-gradient(166deg,rgba(184, 196, 214, 0) 0%, rgba(87, 199, 134, 0.15) 50%, rgba(82, 212, 78, 0.43) 100%)`,
            )
          }
          onMouseLeave={() => setColor("transparent")}
        >
          <div className="card-image-container">
            <img className="card-image" src={image} alt={title} />
            <div
              className="card-image-effect"
              style={{ background: color }}
            ></div>
          </div>
          <h2>{title}</h2>
          {dealerName && (
            <p className="card-dealer">
              {t("medicine.soldBy", { dealer: dealerName })}
            </p>
          )}
          <p ref={cardRef}>{description}</p>
          {!hideReadMore && isOverflowing && (
            <span className="read-more" onClick={(e) => handleReadMore(e)}>
              ... {showReadMore[1]}
            </span>
          )}

          <div className="card-footer">
            {typeof price === "number" && (
              <div className="card-price">
                {t("common.priceLabel", { price: price.toFixed(2) })}
              </div>
            )}
            <div className="card-buttons">
              {buttons.map((button, index) => (
                <button
                  ref={buttonRef}
                  className="card-button"
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!button.link) button.effects?.();
                  }}
                >
                  {button.link ? (
                    <Link className="card-link" to={button.link}>
                      {button.text}
                    </Link>
                  ) : (
                    <span>{button.text}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cards;
