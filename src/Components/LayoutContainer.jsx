export default function LayoutContainer({ children, className = "" }) {
  return (
    <div
      className={`
        w-full
        max-w-[1880px]
        mx-auto
        px-4 sm:px-6 lg:px-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}
