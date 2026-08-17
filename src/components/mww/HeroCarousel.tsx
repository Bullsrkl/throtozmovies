import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  accent: string;
}

const fallback: Banner[] = [
  {
    id: "f1",
    title: "One Ecosystem. Endless Earning.",
    subtitle: "Shop, pay and grow — sab kuch ek hi app me.",
    image_url: null,
    cta_text: "Explore",
    cta_link: "/offers",
    accent: "gold",
  },
  {
    id: "f2",
    title: "3 Smart Wallets",
    subtitle: "Earning, MVS Pay aur MVS Points — ek dashboard me.",
    image_url: null,
    cta_text: "View Wallets",
    cta_link: "/wallet",
    accent: "blue",
  },
];

export function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>(fallback);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_banners")
      .select("id,title,subtitle,image_url,cta_text,cta_link,accent")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length) setBanners(data as Banner[]);
      });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const banner = banners[index % banners.length];

  return (
    <div className="space-y-2">
      <div className="glass-card relative h-40 overflow-hidden p-5">
        {banner.image_url && (
          <img
            src={banner.image_url}
            alt={banner.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
          style={{ background: "hsl(42 70% 56% / 0.25)" }}
        />
        <div className="relative flex h-full flex-col justify-center">
          <h3 className="font-display text-xl font-extrabold leading-snug text-foreground">
            {banner.title}
          </h3>
          {banner.subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <Link
              to={banner.cta_link || "/home"}
              className="mt-3 w-fit rounded-full gold-surface px-4 py-1.5 text-xs font-bold text-primary-foreground press"
            >
              {banner.cta_text}
            </Link>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.id}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index % banners.length ? "w-6 bg-primary" : "w-1.5 bg-white/25"
            )}
          />
        ))}
      </div>
    </div>
  );
}
