
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Projects from "./pages/Projects";
import Deployments from "./pages/Deployments";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./hooks/use-theme";
import ProjectGrid from "./pages/ProjectGrid";
import RawLogs from "./pages/RawLogs";
import Repos from "./pages/Repos";
import ProjectsAgGrid from "./pages/ProjectsAgGrid";
import DeploymentsAgGrid from "./pages/DeploymentsAgGrid";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/projects" element={<ProjectsAgGrid />} />
              <Route path="/deployments" element={<DeploymentsAgGrid />} />
              {/* <Route path="/raw-logs" element={<RawLogs />} />
              <Route path="/repo-stats" element={<Repos />} /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
