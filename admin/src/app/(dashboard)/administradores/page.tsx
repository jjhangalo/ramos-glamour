import { getClients } from "@/lib/actions/clients";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminActions } from "@/components/administradores/AdminActions";

type AdminsPageProps = {
  searchParams?: Promise<{
    pesquisa?: string;
  }>;
};

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const params = (await searchParams) ?? {};
  const admins = await getClients({
    search: params.pesquisa,
    role: "admin",
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Administradores
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Gestão de acesso
        </h1>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          type="search"
          name="pesquisa"
          defaultValue={params.pesquisa ?? ""}
          placeholder="Pesquisar por nome ou email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
      </form>

      {admins.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Email</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Telefone</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-950">
                    <div className="max-w-[150px] truncate md:max-w-none" title={admin.full_name || admin.display_name || "Sem nome"}>
                      {admin.full_name || admin.display_name || "Sem nome"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 lg:table-cell">
                    {admin.email || "Sem email"}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 sm:table-cell">
                    {admin.phone || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {admin.is_active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <AdminActions userId={admin.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhum administrador encontrado"
          description="Ajusta a tua pesquisa ou promove um cliente a administrador."
        />
      )}
    </div>
  );
}
