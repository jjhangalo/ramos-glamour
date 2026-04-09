import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getClients } from "@/lib/actions/clients";

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
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Clientes
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Base de clientes
        </h1>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.2fr_220px_auto]">
        <input
          type="search"
          name="pesquisa"
          defaultValue={params.pesquisa ?? ""}
          placeholder="Pesquisar por nome ou email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
        <select
          name="estado"
          defaultValue={params.estado ?? "all"}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Filtrar
        </button>
      </form>

      {clients.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="hidden px-5 py-3 font-medium md:table-cell">Avatar</th>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Email</th>
                <th className="hidden px-5 py-3 font-medium xl:table-cell">Telefone</th>
                <th className="hidden px-5 py-3 font-medium xl:table-cell">WhatsApp</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Registo</th>
                <th className="px-5 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100">
                  <td className="hidden px-5 py-4 md:table-cell">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                      {client.avatar_url ? (
                        <Image
                          src={client.avatar_url}
                          alt={client.full_name || client.display_name || "Avatar"}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-950">
                    <div className="max-w-[150px] truncate" title={client.full_name || client.display_name || "Sem nome"}>
                      {client.full_name || client.display_name || "Sem nome"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 lg:table-cell">
                    {client.email || "Sem email"}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 xl:table-cell">
                    {client.phone || "—"}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 xl:table-cell">
                    {client.whatsapp || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {client.is_active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 lg:table-cell">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/clientes/${client.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
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
    </div>
  );
}
