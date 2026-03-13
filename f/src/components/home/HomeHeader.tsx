import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import type { EventCard } from "./types";

export function HomeHeader({
  query,
  onQueryChange,
  searchItems,
  onSelectItem,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchItems: EventCard[];
  onSelectItem: (id: string) => void;
}) {
  return (
    <div className="md:grid md:grid-cols-[320px_1fr] md:items-center md:gap-4">
      <div className="mb-2 text-sm font-semibold tracking-tight text-white/80 md:mb-0">
        biletsatis
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="hidden w-full items-center md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Etkinlik, Mekan, Sanatçı veya Organizatör Ara"
                className="pl-9"
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[40vw] max-w-5xl border-white/15 bg-black/95 p-0">
          <Command className="border-none bg-transparent shadow-none">
            <CommandInput
              value={query}
              onValueChange={onQueryChange}
              placeholder="Etkinlik, Mekan, Sanatçı veya Organizatör Ara"
            />
            <CommandList>
              <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
              <CommandGroup>
                {searchItems.slice(0, 12).map((e) => (
                  <CommandItem
                    key={`search-${e.id}`}
                    value={`${e.title} ${e.venue} ${e.city}`}
                    onSelect={() => onSelectItem(e.id)}
                  >
                    <div className="flex w-full items-center gap-4">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-white/10">
                        {e.imageSrc && (
                          <img
                            src={e.imageSrc}
                            alt={e.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="truncate font-semibold">{e.title}</div>
                        <div className="truncate text-xs text-white/70">
                          {e.venue}
                        </div>
                        <div className="mt-0.5 text-xs text-white/50">
                          {e.dateText} • {e.timeText}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

