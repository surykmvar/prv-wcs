import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Mail } from "lucide-react";
import { FoundersNoteLetter } from "./FoundersNoteLetter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const FoundersNoteToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="text-center">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="group border-woices-violet/30 hover:border-woices-violet hover:bg-woices-violet/5 transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2 text-woices-violet group-hover:scale-110 transition-transform duration-300" />
                <span className="text-foreground font-medium">Read the Founder's Note</span>
                <ChevronDown className={`w-4 h-4 ml-2 text-woices-violet transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="pt-8">
            <FoundersNoteLetter />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};