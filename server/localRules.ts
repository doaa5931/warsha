export function firstLocalUserRole(existingUsers: number): "admin" | "user" {
  return existingUsers === 0 ? "admin" : "user";
}

export function canReserveSeats(capacity: number, reserved: number, requested: number): boolean {
  return Number.isInteger(requested) && requested > 0 && reserved + requested <= capacity;
}
