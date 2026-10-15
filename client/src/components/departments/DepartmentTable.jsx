import { Edit2, Building, Users, Layers, Power } from 'lucide-react';

export function DepartmentTable({ departments, loading, onEditDepartment, onToggleStatus }) {
  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading municipal departments...</p>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No departments found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No departments registered yet. Click &quot;+ Add Department&quot; to configure your municipal divisions.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-5 py-3.5">Department</th>
              <th scope="col" className="px-5 py-3.5">Description</th>
              <th scope="col" className="px-5 py-3.5">Assigned Staff</th>
              <th scope="col" className="px-5 py-3.5">Linked Assets</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {departments.map((dept) => {
              const userCount = dept._count?.users ?? 0;
              const assetCount = dept._count?.assets ?? 0;

              return (
                <tr key={dept.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-white">{dept.name}</div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-5 py-4 text-xs text-slate-400 max-w-xs truncate">
                    {dept.description || <span className="italic text-slate-600">No description</span>}
                  </td>

                  {/* Assigned Staff */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-semibold text-slate-200">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{userCount} Personnel</span>
                    </span>
                  </td>

                  {/* Linked Assets */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-semibold text-slate-200">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{assetCount} Assets</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {dept.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        INACTIVE
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditDepartment(dept)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium transition-colors cursor-pointer"
                        title="Edit department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onToggleStatus(dept)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          dept.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                        title={dept.isActive ? 'Deactivate department' : 'Activate department'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{dept.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DepartmentTable;
