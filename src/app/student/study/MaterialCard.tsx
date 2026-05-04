import Image from "next/image";
import { Play, BookOpen, ExternalLink, Download } from "lucide-react";

type Material = {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "book";
  url: string;
  thumbnail_url: string | null;
  category: string;
};

export function MaterialCard({ material }: { material: Material }) {
  const Icon = material.type === "video" ? Play : 
               material.type === "book" ? BookOpen : 
               material.type === "pdf" ? Download : ExternalLink;

  return (
    <div className="group relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white border border-orange-100 shadow-lg shadow-orange-900/5 transition-all hover:shadow-2xl hover:scale-[1.01] active:scale-95 flex flex-row sm:flex-col">
      {/* Thumbnail Area - Compact on Mobile, Card Header on Desktop */}
      <div className="relative w-28 sm:w-full aspect-square sm:aspect-[16/10] overflow-hidden shrink-0">
        {material.thumbnail_url ? (
          <Image 
            src={material.thumbnail_url} 
            alt={material.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-orange-50 flex items-center justify-center">
            <Icon className="h-8 w-8 md:h-12 md:w-12 text-primary/20" />
          </div>
        )}
        
        {/* Type Overlay - Hidden on tiny mobile if needed, but keeping it small */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/90 backdrop-blur-md text-[7px] md:text-[9px] font-black uppercase tracking-widest text-secondary shadow-sm">
          {material.type}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between min-w-0">
        <div className="space-y-1 md:space-y-2">
          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary leading-none">
            {material.category}
          </div>
          <h3 className="text-sm md:text-xl font-black text-secondary line-clamp-1 md:line-clamp-2 italic tracking-tighter">
            {material.title}
          </h3>
          <p className="text-[10px] md:text-xs font-medium text-secondary/40 line-clamp-2 leading-relaxed hidden sm:block">
            {material.description}
          </p>
        </div>
        
        <div className="mt-3 md:mt-6">
          <a 
            href={material.url} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex h-9 md:h-12 items-center justify-center px-4 md:px-6 rounded-lg md:rounded-xl bg-secondary text-white font-black text-[10px] md:text-sm transition-all hover:bg-black group-hover:bg-primary shadow-lg shadow-secondary/10 w-fit sm:w-auto"
          >
            <Icon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            <span className="uppercase tracking-widest">
              {material.type === 'video' ? 'Watch' : material.type === 'book' ? 'Read' : 'Open'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
