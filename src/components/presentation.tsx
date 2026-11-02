"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type PhonePose = "portrait" | "turning" | "landscape";

const PresentationContext = createContext<PhonePose>("portrait");

export function usePhonePose() {
  return useContext(PresentationContext);
}

export function PresentationStage({
  fighting,
  children,
}: {
  fighting: boolean;
  children: React.ReactNode;
}) {
  const [pose, setPose] = useState<PhonePose>("portrait");

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 840px)");
    if (!wide.matches || !fighting) {
      setPose("portrait");
      return;
    }
    setPose("turning");
    const id = window.setTimeout(() => setPose("landscape"), 820);
    return () => window.clearTimeout(id);
  }, [fighting]);

  return (
    <PresentationContext.Provider value={pose}>
      <div className="presentation-stage">
        <div className="phone" data-pose={pose}>
          <span className="phone-button" aria-hidden="true" />
          <div className="phone-screen">
            <span className="phone-notch" aria-hidden="true" />
            {children}
          </div>
        </div>
      </div>
    </PresentationContext.Provider>
  );
}
