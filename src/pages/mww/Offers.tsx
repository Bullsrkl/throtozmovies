import { AppLayout } from "@/components/mww/AppLayout";
import { ShoppingBag, Store, Utensils, Hotel, Plane, Settings } from "lucide-react";

const categories = [
  { label: "Products", icon: ShoppingBag },
  { label: "Services", icon: Settings },
  { label: "Merchants", icon: Store },
  { label: "Restaurants", icon: Utensils },
  { label: "Hotels", icon: Hotel },
  { label: "Travel", icon: Plane },
];

export default function Offers() {
  return (
    <AppLayout>
      <h1 className="font-display text-2xl font-extrabold">Offers & Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">Poore ecosystem ki best deals.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <div key={c.label} className="glass-card flex flex-col items-start gap-3 p-5 press">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <c.icon className="h-5 w-5 text-primary" />
            </span>
            <p className="font-display text-sm font-bold">{c.label}</p>
            <p className="text-[11px] text-muted-foreground">Coming soon</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
