import { useEffect } from "react";
import "../css/popup.css";

type Props = {
  open: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
};

export default function Lightbox({ open, src, alt = "", onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="lightbox-close"
        aria-label="Close image"
        onClick={onClose}
      >
        ✕
      </button>
      <img className="lightbox-img" src={src} alt={alt} />
    </div>
  );
}
