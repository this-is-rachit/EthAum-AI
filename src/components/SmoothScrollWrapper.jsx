import { ReactLenis } from "@studio-freight/react-lenis";

function SmoothScrollWrapper({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

export default SmoothScrollWrapper;