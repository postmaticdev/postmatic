"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AIAgent {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
}

const aiAgents: AIAgent[] = [
  {
    id: "1",
    name: "Sulish",
    role: "Social Media Spesialist",
  },
  {
    id: "2",
    name: "Dimas",
    role: "Digital Marketing Spesialist",
  },
  {
    id: "3",
    name: "Adinda",
    role: "Admin Social Media",
  },
  {
    id: "4",
    name: "Megawati",
    role: "Marketing Manager",
  },
];

export function AiAgentBar() {
  return (
    <div className="p-6">
      {/* AI Employees Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
        AI Employees
      </h2>

      {/* AI Agent Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {aiAgents.map((agent) => (
          <AIAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

interface AIAgentCardProps {
  agent: AIAgent;
}

function AIAgentCard({ agent }: AIAgentCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push('/[businessId]/[aiagentId]/dashboard');
  };

  return (
    <Card
      className="group aspect-[3/4] w-full overflow-hidden bg-card border-border shadow-sm 
             transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-full w-full rounded-xl">
        <Image
          src="https://picsum.photos/300/400"
          alt="Placeholder Colorful"
          fill
          className="object-cover rounded-xl select-none pointer-events-none
                 transform-gpu transition-transform duration-500 ease-out will-change-transform
                 group-hover:scale-[1.06]"
          priority
        />

        {/* gradient bawah agar teks makin kontras */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 
                    bg-gradient-to-t from-black/40 to-transparent rounded-b-xl
                    opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* overlay glassmorphism */}
        <div
          className="absolute inset-x-0 bottom-0 m-3 rounded-2xl
                 bg-white/15 backdrop-blur-md border border-white/20 shadow-lg
                 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6
                 transition-all duration-300
                 group-hover:bg-white/20 group-hover:backdrop-blur-lg group-hover:border-white/30"
        >
          <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2">
            {agent.name}
          </h2>
          <p className="text-white/90 text-xs sm:text-sm md:text-base leading-snug">
            {agent.role}
          </p>
        </div>
      </div>
    </Card>
  );
}
