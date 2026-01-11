import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar fixed at the top */}
      <Topbar />

      <div className="flex pt-16">
        {/* Sidebar fixed on the left */}
        <Sidebar />

        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
