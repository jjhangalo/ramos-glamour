import Image from "next/image";
import Link from "next/link";

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
                <th className="px-5 py-3 font-medium">Avatar</th>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Telefone</th>
                <th className="px-5 py-3 font-medium">WhatsApp</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Registo</th>
                <th className="px-5 py-3 font-medium">Acções</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100">
                  <td className="px-5 py-4">
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
                    {client.full_name || client.display_name || "Sem nome"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {client.email || "Sem email"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {client.phone || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {client.whatsapp || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {client.is_active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/clientes/${client.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Ver detalhe
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
