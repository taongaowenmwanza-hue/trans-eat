export interface Town {
  id: string;
  name: string;
  coords: [number, number];
}

export const TOWNS: Town[] = [
  { id: 'lusaka', name: 'Lusaka', coords: [28.3228, -15.3875] },
  { id: 'kabwe', name: 'Kabwe', coords: [28.4464, -14.4469] },
  { id: 'kapiri', name: 'Kapiri Mposhi', coords: [28.6801, -13.9694] },
  { id: 'ndola', name: 'Ndola', coords: [28.6366, -12.9587] },
  { id: 'kitwe', name: 'Kitwe', coords: [28.2132, -12.8024] },
  { id: 'livingstone', name: 'Livingstone', coords: [25.8567, -17.8419] },
];

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function nearestTown(coords: [number, number]): Town {
  return TOWNS.reduce((closest, town) =>
    haversineKm(coords, town.coords) < haversineKm(coords, closest.coords) ? town : closest,
  TOWNS[0]);
}