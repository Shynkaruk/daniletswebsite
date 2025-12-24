// src/components/LayoutContainer.jsx
export default function LayoutContainer({ children, className = "" }) {
  return (
    <div className={`w-[95%] max-w-[1880px] mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}
