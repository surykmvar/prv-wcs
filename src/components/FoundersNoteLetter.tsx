import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export const FoundersNoteLetter = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="border-woices-violet/20 bg-gradient-to-br from-woices-violet/5 to-transparent relative overflow-hidden">
        {/* Letter-style header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-woices-violet to-woices-mint opacity-30"></div>
        
        <CardContent className="p-8 sm:p-12">
          {/* Letter heading */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-woices-violet/10 flex items-center justify-center">
              <User className="w-6 h-6 text-woices-violet" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Founder's Note</h3>
              <p className="text-muted-foreground text-sm">How this idea came to life</p>
            </div>
          </div>

          {/* Letter content */}
          <div className="space-y-6 text-muted-foreground leading-relaxed font-light">
            <p className="text-lg">Dear Fellow Voice Enthusiast,</p>
            
            <p>
              I created Woices because I was frustrated with how feedback works online. Most platforms force us into brainrot content, 
              endless likes, and long threads of text. And worse, the comments section has become toxic. But human expression doesn't 
              fit into numbers or paragraphs.
            </p>
            
            <p>
              When you hear someone's voice, you don't just get information—you feel tone, energy, hesitation, excitement. That's the 
              real feedback loop, and it's something written comments will never capture.
            </p>
            
            <p>
              Woices is my attempt to bring that missing dimension back into the digital world. Platforms like Clubhouse or Airchat 
              tried, but failed—mainly because of weak monetization, lack of structure, and no clear niche. Woices is different: 
              a place where feedback isn't typed, but spoken—raw, human, emotional.
            </p>
            
            <p>
              Today, Woices starts as a simple API for voice feedback, replacing the boring, impersonal review systems like Google Reviews. 
              But the bigger vision is a social layer of authentic voices—where feedback sounds real, not robotic, and where people 
              connect through their voices across topics and thoughts. And yes—we love all accents. In the age of AI, everything is transcribable.
            </p>
            
            <p className="text-foreground font-medium italic">
              If you've ever thought, "Text doesn't capture what I mean," Woices is for you. 😉
            </p>
            
            <div className="pt-8 border-t border-woices-violet/10">
              <p className="text-foreground font-medium text-right">
                Hope you discover the power of real voice feedback here.
                <br />
                <span className="text-woices-violet">— Surya, Founder & CEO</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};