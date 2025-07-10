// components/AnalysisModal.jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ClipboardCheck } from "lucide-react";

export default function AnalysisModal({
  isOpen,
  setIsOpen,
  analysisQuestion,
  setAnalysisQuestion,
  generateAnalysisSummary,
  isGeneratingSummary
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="text-cyan-500" />
            Generate Analysis Summary
          </DialogTitle>
          <DialogDescription>
            Enter your question to generate the analysis summary
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={analysisQuestion}
            onChange={(e) => setAnalysisQuestion(e.target.value)}
            placeholder="What would you like to know about this document?"
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={generateAnalysisSummary}
              disabled={isGeneratingSummary || !analysisQuestion.trim()}
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}