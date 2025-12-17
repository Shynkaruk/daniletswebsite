import Head from "./Head";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Head />
      <div className="pt-[96px] md:pt-[110px]">
        <Outlet />
      </div>
    </>
  );
}
