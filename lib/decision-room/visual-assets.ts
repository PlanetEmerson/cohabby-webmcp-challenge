export const roomVisuals: Readonly<Record<string, string>> = Object.freeze({
  room_nyc_cedar: '/assets/rooms/room_nyc_cedar.webp',
  room_nyc_hudson: '/assets/rooms/room_nyc_hudson.webp',
  room_nyc_linden: '/assets/rooms/room_nyc_linden.webp',
  room_nyc_orchard: '/assets/rooms/room_nyc_orchard.webp',
  room_ams_canal: '/assets/rooms/room_ams_canal.webp',
  room_ams_harbor: '/assets/rooms/room_ams_harbor.webp',
  room_ams_tulip: '/assets/rooms/room_ams_tulip.webp',
  room_ams_courtyard: '/assets/rooms/room_ams_courtyard.webp',
  room_chi_maple: '/assets/rooms/room_chi_maple.webp',
  room_chi_lake: '/assets/rooms/room_chi_lake.webp',
  room_chi_river: '/assets/rooms/room_chi_river.webp',
  room_chi_garden: '/assets/rooms/room_chi_garden.webp',
});

export const personVisuals: Readonly<Record<string, string>> = Object.freeze({
  person_demo_maya: '/assets/people/person_demo_maya.webp',
  person_demo_jordan: '/assets/people/person_demo_jordan.webp',
  person_demo_sam: '/assets/people/person_demo_sam.webp',
  person_demo_riley: '/assets/people/person_demo_riley.webp',
  person_demo_noor: '/assets/people/person_demo_noor.webp',
  person_demo_luca: '/assets/people/person_demo_luca.webp',
  person_demo_sofie: '/assets/people/person_demo_sofie.webp',
  person_demo_daan: '/assets/people/person_demo_daan.webp',
  person_demo_amina: '/assets/people/person_demo_amina.webp',
  person_demo_theo: '/assets/people/person_demo_theo.webp',
  person_demo_morgan: '/assets/people/person_demo_morgan.webp',
  person_demo_casey: '/assets/people/person_demo_casey.webp',
});

export function roomVisualFor(roomRef: string): string {
  return roomVisuals[roomRef] ?? '/assets/brand/cohabby-app-icon.png';
}

export function personVisualFor(personRef: string): string {
  return personVisuals[personRef] ?? '/assets/brand/cohabby-app-icon.png';
}
