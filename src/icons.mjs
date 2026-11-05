// Line icons, 24×24, stroke-based. Use by name in content JSON.
const P = {
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.85 12.15 8.65-8.65M17 6l2.5 2.5M14.5 8.5 16.5 10.5"/>',
  passport: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M8.8 10h6.4M12 6.8c1 1 1 5.4 0 6.4M12 6.8c-1 1-1 5.4 0 6.4M9 17h6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18M11 12.5v1.5h2v-1.5"/>',
  building: '<path d="M4 21V5.5L12 3v18M12 8h8v13M2.5 21h19M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
  family: '<circle cx="7" cy="6.5" r="2.5"/><circle cx="17" cy="6.5" r="2.5"/><circle cx="12" cy="12.5" r="2"/><path d="M3 20v-4.5A3.5 3.5 0 0 1 6.5 12H8M21 20v-4.5a3.5 3.5 0 0 0-3.5-3.5H16M8.5 20v-1.5a3.5 3.5 0 0 1 7 0V20"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7ZM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7Z"/>',
  document: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/><path d="M16 7h4v4"/>',
  plane: '<path d="M10.5 20.5 12 18l1.5 2.5M12 18V13l8 3v-2l-8-5V4.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-3v5"/>',
  truck: '<path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8"/><circle cx="6" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  factory: '<path d="M2.5 21V10l5 3.5V10l5 3.5V10l5 3.5V4h4v17H2.5Z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
  hammer: '<path d="m14 13-8.5 8.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m15 15 6-6M17.6 12.4 11.6 6.4l2.8-2.8a3 3 0 0 1 4.2 0l2.8 2.8-3.8 6Z"/>',
  warehouse: '<path d="M2.5 20V8.5L12 3.5l9.5 5V20"/><path d="M6 20v-8h12v8M6 15h12"/>',
  laptop: '<rect x="4" y="4.5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20M9.5 15.5l-.5 4M14.5 15.5l.5 4"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16.2 9.5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z"/>',
  handshake: '<path d="m11 17 2 2a1.4 1.4 0 0 0 2-2M13 15l2.5 2.5a1.4 1.4 0 0 0 2-2l-3.8-3.8a2.8 2.8 0 0 0-4 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a4 4 0 0 1 5-.5l.5.3a3 3 0 0 0 2 .4H21v8.5h-1"/><path d="m21 3-1 11M3 4l-1 10.5 6.5 6.5a1.4 1.4 0 0 0 2-2M3 4h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M19.5 10c0 5-7.5 11.5-7.5 11.5S4.5 15 4.5 10a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  phone: '<path d="M21 16.5v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.4 10.9a16 16 0 0 0 4.7 4.7l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M3 11v4c0 1.7 2.7 3 6 3 1 0 2-.1 2.8-.4"/><ellipse cx="17" cy="15" rx="4.5" ry="2.3"/><path d="M12.5 15v3c0 1.3 2 2.3 4.5 2.3s4.5-1 4.5-2.3v-3"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z"/>',
  palm: '<path d="M12 21c0-5 .5-9 1.5-12"/><path d="M13.5 9C11 6 7 6 4 8c3-.5 6 0 9.5 1ZM13.5 9c2-3 6-4 8-2-2.5-.2-5.5.5-8 2ZM13.5 9c-1-3.5 0-6 3-7-1.2 2-2 4.5-3 7ZM13.5 9c-3.5-.5-6.5 1-8 4 2.5-2 5.5-3 8-4ZM7 21h12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  flag: '<path d="M4.5 21V4M4.5 4.5c5-3 9 3 15 0v9c-6 3-10-3-15 0"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.5-1.5 1.6-2.2 3-2.2s2.5.7 3 2.2M14 10h4.5M14 13.5h3"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.8-.9.8-2.2-.1-3s-2-.9-2.9 0Z"/><path d="M12 15 9 12a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  layers: '<path d="m12 3 9.5 5-9.5 5-9.5-5L12 3Z"/><path d="m2.5 12.5 9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5"/>',
  chat: '<path d="M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.1-4.6A8.5 8.5 0 1 1 20.5 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="11" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 15v2.5"/>',
  // UI
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  arrowUp: '<path d="M7 17 17 7M8 7h9v9"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
};

export function icon(name, cls = '') {
  const body = P[name] || P.key;
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

// Decorative key drawn after the key in the Amber Key logo (trefoil bow, collar, bit).
export const keyOrnament = (cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 200 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 32h130"/><path d="M18 32v14h8v-8h7v8h8V32"/><rect x="128" y="25" width="8" height="14" rx="2"/><rect x="140" y="27" width="5" height="10" rx="1.5"/><circle cx="162" cy="21" r="11"/><circle cx="162" cy="43" r="11"/><circle cx="182" cy="32" r="11"/><circle cx="168" cy="32" r="3.5"/></svg>`;

export const ICON_NAMES = Object.keys(P);
