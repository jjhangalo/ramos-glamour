import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getClients } from "@/lib/actions/clients";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";

type ClientsPageProps = {
  searchParams?: Promise<{
    estado?: "all" | "active" | "inactive";
    pesquisa?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = (await searchParams) ?? {};
  const clients = await getClients({
    status: params.estado,
    search: params.pesquisa,
    role: "client",
  });

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Clientes
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Base de clientes
        </h1>
      </div>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_220px_auto]">
        <input
          type="search"
          name="pesquisa"
          defaultValue={params.pesquisa ?? ""}
          placeholder="Pesquisar por nome ou email"
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
        />
        <select
          name="estado"
          defaultValue={params.estado ?? "all"}
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-200 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          Filtrar
        </button>
      </form>

      {clients.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="hidden px-5 py-3 md:table-cell">Avatar</th>
                <th className="px-5 py-3">Nome</th>
                <th className="hidden px-5 py-3 lg:table-cell">Email</th>
                <th className="hidden px-5 py-3 xl:table-cell">Telefone</th>
                <th className="hidden px-5 py-3 xl:table-cell">WhatsApp</th>
                <th className="px-5 py-3">Estado</th>
                <th className="hidden px-5 py-3 lg:table-cell">Registo</th>
                <th className="px-5 py-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="hidden px-5 py-4 md:table-cell">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-100 shadow-inner">
                      {client.avatar_url ? (
                        <Image
                          src={client.avatar_url}
                          alt={client.full_name || client.display_name || "Avatar"}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    <div className="max-w-[150px] truncate" title={client.full_name || client.display_name || "Sem nome"}>
                      {client.full_name || client.display_name || "Sem nome"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-600 lg:table-cell">
                    {client.email || "Sem email"}
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 xl:table-cell">
                    {client.phone || "—"}
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 xl:table-cell">
                    {client.whatsapp || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      client.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {client.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-400 lg:table-cell">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/clientes/${client.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Ajusta os filtros ou aguarda novos registos."
        />
      )}
    </PageCanvas>
  );
}
