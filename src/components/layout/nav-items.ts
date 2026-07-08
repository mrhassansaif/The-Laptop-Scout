import {
  CheckSquare,
  LayoutDashboard,
  Laptop,
  MapPin,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/laptops/add", label: "Add", icon: Laptop },
  { href: "/visits", label: "Visits", icon: MapPin },
  { href: "/checklist", label: "Guide", icon: CheckSquare },
] as const;
