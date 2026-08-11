import React, { useEffect, useRef, useState } from "react";
import "../css/popover.css";

type PopOverProps = {
  trigger: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
  placement?: "bottom" | "bottom-end" | "top" | "left" | "right";
};

function PopOver({
  trigger,
  children,
  className,
  placement = "bottom",
}: PopOverProps) {
  const [visible, setVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const placementClass = `placement-${placement}`;
  return (
    <div className={`popover-root ${className}`} ref={popoverRef}>
      <div
        className="popover-trigger"
        onClick={() => {
          setVisible((prev) => !prev);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setVisible((prev) => !prev)}
      >
        {trigger}
      </div>

      <div
        className={`popover ${visible ? "open" : "closed"} ${placementClass}`}
        aria-hidden={!visible}
      >
       
        <div className="popover-inner">{children}</div>
      </div>
    </div>
  );
}
export default PopOver;
