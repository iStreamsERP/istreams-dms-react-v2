import { useEffect } from "react";
import { useTour } from "@reactour/tour";

const TourController = () => {
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    // Start tour when component mounts (or based on your logic)
    const shouldStartTour = !localStorage.getItem("tourCompleted");
    
    if (shouldStartTour) {
      setIsOpen(true);
      setCurrentStep(0);
      localStorage.setItem("tourCompleted", "true");
    }
  }, [setIsOpen, setCurrentStep]);

  return null; // This component doesn't render anything
};

export default TourController;