import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  PercentCircle,
  Shield,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavItems: NavItem[] = [
  {
    href: "/",
    label: "Painel",
    icon: LayoutDashboard,
  },
  {
    href: "/produtos",
    label: "Produtos",
    icon: Package,
  },
  {
    href: "/categorias",
    label: "Categorias",
    icon: Tag,
  },
  {
    href: "/promocoes",
    label: "Promoções",
    icon: PercentCircle,
  },
  {
    href: "/encomendas",
    label: "Encomendas",
    icon: ShoppingBag,
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/administradores",
    label: "Administradores",
    icon: Shield,
  },
];

export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const maxImageSize = 5 * 1024 * 1024;
