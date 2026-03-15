import { Card } from "../ui/card";

export function WideBanner({ src }: { src: string }) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-black/25 p-0">
      <div className="relative h-28 w-full md:h-36">
        <img
        src={src}
        alt="Banner"
        className="absolute inset-0 h-full w-full object-cover opacity-85"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/placeholderposter.webp";
        }}
      />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.65),rgba(0,0,0,0.15),rgba(0,0,0,0.65))]" />
      </div>
    </Card>
  );
}

