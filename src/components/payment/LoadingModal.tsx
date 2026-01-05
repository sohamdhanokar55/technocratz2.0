import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLoading } from "@/context/LoadingContext";

const LoadingModal: React.FC = () => {
  const { isLoading, message } = useLoading();

  return (
    <Dialog open={isLoading} onOpenChange={() => {}}>
      <DialogContent className="border-none bg-transparent shadow-none flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>

          {/* Message */}
          <p className="text-white text-center text-lg font-medium">
            {message || "Processing your request..."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
