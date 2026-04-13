import { X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "../components/admin/Sidebar";
import { Topbar } from "../components/admin/Topbar";
import { FacilityProvider } from "../contexts/FacilityContext";

export function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <FacilityProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#005E2E] to-[#29721D] text-admin-text-primary">
        <aside className="fixed inset-y-0 left-0 hidden w-72 lg:block">
          <Sidebar className="h-screen" />
        </aside>

        {isMobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="absolute inset-0 bg-black/45"
              aria-label="Đóng menu"
            />

            <div className="relative z-10 h-full w-72 max-w-[80vw]">
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-[#005E2E] text-admin-text-primary"
                aria-label="Đóng sidebar"
              >
                <X size={18} />
              </button>
              <Sidebar className="h-full" onNavigate={closeMobileSidebar} />
            </div>
          </div>
        ) : null}

        <div className="lg:ml-72">
          <Topbar onMenuToggle={() => setIsMobileSidebarOpen(true)} />
          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </FacilityProvider>
  );
}
