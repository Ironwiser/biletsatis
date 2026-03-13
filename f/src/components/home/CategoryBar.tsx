import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export type TopTab = "tumu" | "takvim";
export type Category = "tumu" | "etkinlik" | "mekan";
export type Genre = "tumu" | "house" | "techno" | "melodic" | "elektronik" | "turkce";

export function CategoryBar({
  topTab,
  onTopTabChange,
  category,
  onCategoryChange,
  genre,
  onGenreChange,
}: {
  topTab: TopTab;
  onTopTabChange: (v: TopTab) => void;
  category: Category;
  onCategoryChange: (v: Category) => void;
  genre: Genre;
  onGenreChange: (v: Genre) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={topTab} onValueChange={(v) => onTopTabChange(v as TopTab)}>
          <TabsList>
            <TabsTrigger value="tumu" className="text-white/80 hover:text-white">
              Tümü
            </TabsTrigger>
            <TabsTrigger value="takvim" className="text-white/80 hover:text-white">
              Takvim
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mx-2 hidden h-6 w-px bg-white/10 md:block" />

        {[
          ["tumu", "Tümü"],
          ["etkinlik", "Etkinlik"],
          ["mekan", "Mekan"],
        ].map(([k, label]) => {
          const active = category === (k as Category);
          return (
            <Button
              key={k}
              size="sm"
              variant={active ? "default" : "outline"}
              className={
                "h-8 rounded-full text-white/80 hover:text-white " +
                (active ? "border border-white/70" : "border border-transparent")
              }
              onClick={() => onCategoryChange(k as Category)}
            >
              {label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          ["tumu", "TÜMÜ"],
          ["house", "HOUSE"],
          ["techno", "TECHNO"],
          ["melodic", "MELODIC"],
          ["elektronik", "ELEKTRONİK"],
          ["turkce", "TÜRKÇE"],
        ].map(([k, label]) => {
          const active = genre === (k as Genre);
          return (
            <Button
              key={k}
              size="sm"
              variant={active ? "default" : "outline"}
              className={
                "h-8 rounded-full text-white/80 hover:text-white " +
                (active ? "border border-white/70" : "border border-transparent")
              }
              onClick={() => onGenreChange(k as Genre)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

