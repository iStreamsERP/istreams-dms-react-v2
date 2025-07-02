import { UploadHeader } from "@/components";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

export const UploadLayout = () => {
  return (
    <div className="relative h-screen bg-slate-100 text-2xl transition-colors dark:bg-slate-950 overflow-hidden">
      {/* Overlay Header */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <UploadHeader />
      </div>

      {/* Main content gets full height, header overlays on top */}
      <main className="relative h-full">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
};
