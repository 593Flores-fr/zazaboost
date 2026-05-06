import { Camera, Music2 } from "lucide-react";

export default function ReseauxPage() {
  return (
    <div className="p-8 bg-[#f5f5f5] min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Réseaux sociaux
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Prépare tes contenus Instagram &amp; TikTok
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <Camera className="w-8 h-8 text-neutral-400" />
          <Music2 className="w-8 h-8 text-neutral-600" />
        </div>
        <p className="text-neutral-600 font-medium">Disponible en V2</p>
        <p className="text-neutral-400 text-sm mt-1">
          Générateur de contenus Instagram &amp; TikTok — publication manuelle
        </p>
      </div>
    </div>
  );
}
