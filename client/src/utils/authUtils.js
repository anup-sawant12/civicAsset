/**
 * Helper to determine dashboard path based on role
 * @param {string} role
 * @returns {string}
 */
export function getRoleDashboardPath(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'OFFICER':
      return '/officer/dashboard';
    case 'FIELD_WORKER':
      return '/worker/dashboard';
    case 'CITIZEN':
      return '/citizen/dashboard';
    default:
      return '/login';
  }
}

export default {
  getRoleDashboardPath,
};
