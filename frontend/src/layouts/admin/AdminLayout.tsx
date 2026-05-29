import { X } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AdminSideBar } from "./AdminSideBar";
import { AdminTopBar } from "./AdminTopBar";
import { VenueProvider } from "../../features/venue/model/VenueProvider";

export function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <VenueProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-[#005E2E] to-[#29721D] text-admin-text-primary">
        <aside className="hidden lg:block w-72 h-full flex-shrink-0">
          <AdminSideBar className="h-full" />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AdminTopBar onMenuToggle={() => setIsMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>

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
              <AdminSideBar
                className="h-full"
                onNavigate={closeMobileSidebar}
              />
            </div>
          </div>
        ) : null}
      </div>
    </VenueProvider>
  );
}
