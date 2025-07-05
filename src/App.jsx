import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRouter";
import { TourProvider } from "@reactour/tour";

// Define your tour steps
const tourSteps = [
  {
    selector: "#first-element",
    content: "This is the first element to introduce",
  },
  {
    selector: ".second-element",
    content: "This is the second step in our tour",
  },
  // Add more steps as needed
];
const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TourProvider
        steps={tourSteps}
        styles={{
          popover: (base) => ({
            ...base,
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          }),
          maskArea: (base) => ({ ...base, rx: 8 }),
        }}
        onClickMask={({ setCurrentStep, currentStep, steps, setIsOpen }) => {
          if (currentStep === steps.length - 1) {
            setIsOpen(false);
          }
        }}
      >
        <RouterProvider router={router} />
      </TourProvider>
    </ThemeProvider>
  );
};

export default App;
