import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScriptFormatter from "./pages/ScriptFormatter";
import Library from "./pages/Library";
import NarrativeEngine from "./pages/NarrativeEngine";
import NarrativeEngineGuide from "./pages/NarrativeEngineGuide";
import Characters from "./pages/Characters";
import CharacterBuilder from "./pages/CharacterBuilder";
import AstralnautStudios from "./pages/AstralnautStudios";
import ChildrenOfAquarius from "./pages/ChildrenOfAquarius";
import BattlefieldAtlantis from "./pages/BattlefieldAtlantis";
import DarkerAges from "./pages/DarkerAges";
import Episode7 from "./pages/Episode7";
import Shakespeare from "./pages/Shakespeare";
import FilmSchool from "./pages/FilmSchool";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";
import Compliance from "./pages/legal/Compliance";
import Dpa from "./pages/legal/Dpa";
import AcceptableUse from "./pages/legal/AcceptableUse";
import Patents from "./pages/legal/Patents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/script-formatter" element={<ScriptFormatter />} />
            <Route path="/script-formatter/:draftId" element={<ScriptFormatter />} />
            <Route path="/library" element={<Library />} />
            <Route path="/narrative-engine" element={<NarrativeEngine />} />
            <Route path="/narrative-engine/guide" element={<NarrativeEngineGuide />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/character-builder" element={<CharacterBuilder />} />
            <Route path="/astralnaut-studios" element={<AstralnautStudios />} />
            <Route path="/astralnaut-studios/children-of-aquarius" element={<ChildrenOfAquarius />} />
            <Route path="/astralnaut-studios/battlefield-atlantis" element={<BattlefieldAtlantis />} />
            <Route path="/astralnaut-studios/darker-ages" element={<DarkerAges />} />
            <Route path="/astralnaut-studios/episode-7" element={<Episode7 />} />
            <Route path="/shakespeare" element={<Shakespeare />} />
            <Route path="/film-school" element={<FilmSchool />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/dpa" element={<Dpa />} />
            <Route path="/acceptable-use" element={<AcceptableUse />} />
            <Route path="/patents" element={<Patents />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
