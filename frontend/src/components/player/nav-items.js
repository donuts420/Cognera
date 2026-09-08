// Primary destinations for the player experience. Shared by the desktop
// sidebar and the mobile tab bar so they stay in sync. `icon` is a name in
// <Icon> (src/components/Icon.jsx).
export const NAV_ITEMS = [
  { key: 'home', to: '/', end: true, icon: 'home', label: 'player.nav.home' },
  { key: 'games', to: '/games', icon: 'grid', label: 'player.nav.games' },
  { key: 'daily', to: '/daily', icon: 'sun', label: 'player.nav.daily' },
  { key: 'profile', to: '/profile', icon: 'user', label: 'player.nav.profile' },
];
