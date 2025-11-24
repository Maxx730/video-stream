import { useEffect, useState } from "react";

export const isDev = () => {
    return window.location.origin.indexOf("live.clam-tube") < 0;
}

export const useIsMobile = (query = "(max-width: 768px)") => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined" || !("matchMedia" in window)) return;

        const mql = window.matchMedia(query);
        const onChange = () => setIsMobile(mql.matches);

        onChange();
        mql.addEventListener?.("change", onChange);

        return () => {
            mql.removeEventListener?.("change", onChange);
        };
    }, [query]);
    return isMobile;
}