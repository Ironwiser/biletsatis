export type EventCard = {
  id: string;
  title: string;
  venue: string;
  city: string;
  dateText: string;
  timeText: string;
  tags: string[];
  priceText: string;
  badge?: string;
  imageSrc?: string;
};

export type TopRow = {
  rank: number;
  id: string;
  eventId: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  tag: string;
};

