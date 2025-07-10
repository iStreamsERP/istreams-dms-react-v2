// components/AnalysisSummary.jsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";

export default function AnalysisSummary({
  analysisSummary,
  setIsAnalysisModalOpen
}) {
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="ghost"
          onClick={() => setIsAnalysisModalOpen(true)}
          className="text-cyan-600 dark:text-cyan-300"
        >
          <SquarePen className="mr-2" />
          Edit Analysis
        </Button>
        <Button>Create as Document</Button>
      </div>
      
      {analysisSummary.length > 0 ? (
        <div className="space-y-4">
          {analysisSummary.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700"
            >
              <div className="mt-1 w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full mr-3"></div>
              <p>{item}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
          <h4 className="text-lg font-medium mb-2">
            No Analysis Generated
          </h4>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            Click the button below to generate analysis summary
          </p>
          <Button onClick={() => setIsAnalysisModalOpen(true)}>
            Generate Summary
          </Button>
        </div>
      )}
    </div>
  );
}