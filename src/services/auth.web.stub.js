/**
 * Stub for native auth modules on web
 */
module.exports = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => ({}),
  signOut: async () => {},
  logInWithPermissions: async () => ({ isCancelled: false }),
  logOut: async () => {},
  getCurrentAccessToken: async () => null,
};

