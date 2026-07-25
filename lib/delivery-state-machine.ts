export type DeliveryStatus = "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
export type UserRole = "COMPANY" | "COURIER" | "ADMIN";

/** Valid transition map: current → allowed next states */
const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  PENDING:    ["ASSIGNED", "CANCELLED"],
  ASSIGNED:   ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED:  [],
  CANCELLED:  [],
};

/** Role-based guard: who can trigger which transition */
const roleGuards: Partial<Record<DeliveryStatus, Partial<Record<DeliveryStatus, UserRole[]>>>> = {
  PENDING: {
    ASSIGNED:  ["COURIER", "ADMIN"],
    CANCELLED: ["COMPANY", "ADMIN"],
  },
  ASSIGNED: {
    IN_TRANSIT: ["COURIER", "ADMIN"],
    CANCELLED:  ["ADMIN"],
  },
  IN_TRANSIT: {
    DELIVERED: ["COURIER", "ADMIN"],
    CANCELLED: ["ADMIN"],
  },
};

export type TransitionError =
  | { code: "INVALID_TRANSITION"; from: DeliveryStatus; to: string }
  | { code: "ROLE_NOT_ALLOWED"; from: DeliveryStatus; to: DeliveryStatus; role: string }
  | { code: "TERMINAL_STATE"; status: DeliveryStatus };

/**
 * Validate a delivery status transition.
 * Returns `null` if the transition is valid, otherwise a detailed error.
 */
export function validateTransition(
  from: DeliveryStatus,
  to: string,
  role?: UserRole,
): TransitionError | null {
  const allowed = transitions[from];
  if (!allowed) {
    return { code: "TERMINAL_STATE", status: from };
  }
  if (!allowed.includes(to as DeliveryStatus)) {
    return { code: "INVALID_TRANSITION", from, to };
  }
  if (role) {
    const guards = roleGuards[from]?.[to as DeliveryStatus];
    if (guards && !guards.includes(role)) {
      return { code: "ROLE_NOT_ALLOWED", from, to: to as DeliveryStatus, role };
    }
  }
  return null;
}

/** Human-readable Turkish error messages */
export function transitionErrorToMessage(err: TransitionError): string {
  switch (err.code) {
    case "INVALID_TRANSITION":
      return `Geçersiz durum geçişi: "${translateStatus(err.from)}" → "${err.to}".`;
    case "ROLE_NOT_ALLOWED":
      return `Bu işlem için yetkiniz yok. "${translateStatus(err.from)}" → "${translateStatus(err.to)}" geçişi "${translateRole(err.role)}" rolü ile yapılamaz.`;
    case "TERMINAL_STATE":
      return `"${translateStatus(err.status)}" durumundaki bir teslimat artık değiştirilemez.`;
  }
}

function translateStatus(s: DeliveryStatus): string {
  const map: Record<DeliveryStatus, string> = {
    PENDING: "Beklemede",
    ASSIGNED: "Kurye Atandı",
    IN_TRANSIT: "Yolda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return map[s];
}

function translateRole(r: string): string {
  const map: Record<string, string> = {
    COMPANY: "Firma",
    COURIER: "Kurye",
    ADMIN: "Operasyon",
  };
  return map[r] || r;
}
