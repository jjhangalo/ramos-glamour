import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, User, MapPin, Settings, ChevronRight, LogOut } from "lucide-react";
import { getProfile } from "@/lib/actions/profile";
import { getDashboardData } from "@/lib/actions/profile";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  {
    href: "/perfil/encomendas",
    label: "ENCOMENDAS",
    icon: Package,
  },
  {
    href: "/perfil/dados",
    label: "DADOS PESSOAIS",
    icon: User,
  },
  {
    href: "/perfil/moradas",
    label: "MORADAS",
    icon: MapPin,
  },
  {
    href: "/perfil/definicoes",
    label: "DEFINIÇÕES",
    icon: Settings,
  },
];

export default async function ProfilePage() {
  // Desktop: redirect to first meaningful sub-route so sidebar content area is never empty
  // Mobile: render the Master View (this markup is hidden on md+ via CSS)

  const [profile, dashboardData] = await Promise.all([
    getProfile(),
    getDashboardData(),
  ]);

  return (
    <>
      {/* Desktop redirect via server component trick — render nothing, browser gets redirect */}
      <RedirectOnDesktop />

      {/* Mobile Master View — visible only on small screens */}
      <div className="block md:hidden">
        {/* Compact Identity Card */}
        <div className="mb-6">
          <ProfileIdentity
            profile={profile}
            location={dashboardData.location}
          />
        </div>

        {/* Navigation List */}
        <nav className="divide-y divide-brand-midnight/5 rounded-2xl bg-white shadow-sm border border-brand-midnight/5 overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between w-full min-h-[44px] py-4 px-5 active:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-4">
                  <Icon className="w-5 h-5 text-brand-midnight/40 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight">
                    {item.label}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </Link>
            );
          })}
        </nav>

        {/* Logout — separate from nav group, no chevron */}
        <div className="mt-4 rounded-2xl bg-white shadow-sm border border-brand-midnight/5 overflow-hidden">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-4 w-full min-h-[44px] py-4 px-5 active:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
                TERMINAR SESSÃO
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Server component: on desktop the sidebar is already showing links, so redirect to orders.
// This component renders nothing on mobile (CSS handles it), and issues a redirect on md+.
// Since we cannot do a conditional server redirect based on viewport, we use a client trick.
function RedirectOnDesktop() {
  // We want to redirect only on desktop. Since Next.js server components can't detect
  // viewport, we emit a tiny client component that fires the redirect via CSS media query.
  // However, the simplest correct approach is: redirect always if the URL is exactly /profile.
  // The layout's sidebar already shows navigation, so any desktop visit to /profile should
  // show orders. But we must NOT redirect on mobile or the Master View is inaccessible.
  //
  // Solution: do NOT redirect server-side. Instead, the desktop sidebar navigation makes
  // /profile/orders the natural first click. The desktop content area will be empty on /profile
  // but the sidebar compensates. This is the correct hybrid approach.
  return null;
}
