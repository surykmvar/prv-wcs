import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Mail } from "lucide-react";
import { FoundersNoteLetter } from "./FoundersNoteLetter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const FoundersNoteToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-16 sm:py-20 px-4 relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-woices-violet/5 via-woices-mint/5 to-woices-violet/5 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="text-center">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="group relative border-2 border-woices-violet/40 hover:border-woices-violet bg-background/80 backdrop-blur-sm hover:bg-woices-violet/10 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-woices-violet/20 px-4 py-4 sm:px-8 sm:py-6 text-sm sm:text-lg font-medium animate-pulse-glow w-full max-w-md sm:max-w-lg"
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-woices-violet/10 to-woices-mint/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Mail className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-woices-violet group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                <span className="text-foreground font-semibold relative z-10 text-center">Read the Founder's Personal Note</span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 text-woices-violet transition-all duration-500 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="pt-12">
            <FoundersNoteLetter />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};