import { UploadHeader } from "@/components";
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";

export const UploadLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Overlay Header */}
      <UploadHeader />

      {/* Main content gets full height, header overlays on top */}
      <main className="flex flex-col items-center justify-center relative">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
};
