export const isDev = () => {
    return window.location.origin.indexOf("live.clam-tube") < 0;
}