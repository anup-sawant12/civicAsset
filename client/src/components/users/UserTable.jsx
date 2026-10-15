import { Edit2, ShieldAlert, UserCheck, HardHat, User } from 'lucide-react';

export function UserTable({ users, loading, onEditUser, onChangeStatus, currentUserId }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'OFFICER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserCheck className="w-3 h-3" />
            OFFICER
          </span>
        );
      case 'FIELD_WORKER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HardHat className="w-3 h-3" />
            FIELD WORKER
          </span>
        );
      case 'CITIZEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-3 h-3" />
            CITIZEN
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            INACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            SUSPENDED
          </span>
        );
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No users found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No user accounts match the current filter or search criteria.
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
              <th scope="col" className="px-5 py-3.5">Name</th>
              <th scope="col" className="px-5 py-3.5">Email / Phone</th>
              <th scope="col" className="px-5 py-3.5">Role</th>
              <th scope="col" className="px-5 py-3.5">Department</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {users.map((item) => {
              const isSelf = currentUserId === item.id;
              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-white">
                      {item.firstName} {item.lastName}
                    </div>
                    {isSelf && (
                      <span className="text-[10px] text-emerald-400 font-semibold">(Your Account)</span>
                    )}
                  </td>

                  {/* Email & Phone */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <div className="text-slate-200">{item.email}</div>
                    <div className="text-slate-500">{item.phone || 'No phone'}</div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getRoleBadge(item.role)}
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    {item.department ? (
                      <span className="text-slate-200 font-medium">
                        {item.department.name}
                        {!item.department.isActive && (
                          <span className="ml-1 text-[10px] text-rose-400">(Inactive Dept)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">None (Public)</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditUser(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-medium transition-colors cursor-pointer"
                        title="Edit user"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Quick Status Toggle Button */}
                      {!isSelf && (
                        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5">
                          {item.status !== 'ACTIVE' && (
                            <button
                              onClick={() => onChangeStatus(item, 'ACTIVE')}
                              className="px-2 py-1 rounded text-[11px] text-emerald-400 hover:bg-emerald-500/10 font-semibold transition-colors"
                              title="Activate user"
                            >
                              Activate
                            </button>
                          )}
                          {item.status !== 'INACTIVE' && (
                            <button
                              onClick={() => onChangeStatus(item, 'INACTIVE')}
                              className="px-2 py-1 rounded text-[11px] text-slate-400 hover:bg-slate-800 font-medium transition-colors"
                              title="Deactivate user"
                            >
                              Deactivate
                            </button>
                          )}
                          {item.status !== 'SUSPENDED' && (
                            <button
                              onClick={() => onChangeStatus(item, 'SUSPENDED')}
                              className="px-2 py-1 rounded text-[11px] text-rose-400 hover:bg-rose-500/10 font-medium transition-colors"
                              title="Suspend user"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
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

export default UserTable;
