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
    <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 transition-all hover:scale-[1.02] active:scale-95">
      <div className="relative aspect-[4/3] overflow-hidden">
        {material.thumbnail_url ? (
          <Image 
            src={material.thumbnail_url} 
            alt={material.title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-zinc-100 flex items-center justify-center">
            <Icon className="h-12 w-12 text-zinc-300" />
          </div>
        )}
        
        {/* Type Overlay */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-zinc-800 shadow-sm">
          {material.type}
        </div>
      </div>

      <div className="p-6 space-y-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
          {material.category}
        </div>
        <h3 className="text-lg font-black text-zinc-800 line-clamp-1">
          {material.title}
        </h3>
        <p className="text-xs font-medium text-zinc-400 line-clamp-2 leading-relaxed">
          {material.description}
        </p>
        
        <a 
          href={material.url} 
          target="_blank" 
          rel="noreferrer"
          className="mt-4 flex h-12 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-sm transition-all hover:bg-black group-hover:bg-primary"
        >
          <Icon className="h-4 w-4 mr-2" />
          {material.type === 'video' ? 'Watch Now' : material.type === 'book' ? 'Read Now' : 'Download'}
        </a>
      </div>
    </div>
  );
}
