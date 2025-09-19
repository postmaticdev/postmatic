"use client";

import { createContext, useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { useBusinessGetById } from "@/services/business.api";
import type { MemberRole } from "@/models/api/business/index.type";

/** ====== Tipe Permission ====== */
export interface PermissionAccess {
  dashboard: {
    overview: boolean;
  };
  business: {
    read: boolean;
    write: boolean;
  };
  businessKnowledge: {
    write: boolean;
    read: boolean;
  };
  roleKnowledge: {
    write: boolean;
    read: boolean;
  };
  rssKnowledge: {
    write: boolean;
    read: boolean;
  };
  platformKnowledge: {
    write: boolean;
    read: boolean;
  };
  productKnowledge: {
    write: boolean;
    read: boolean;
  };
  contentGenerate: {
    readHistory: boolean;
    saveDraft: boolean;
    generateContent: boolean;
  };
  contentScheduler: {
    write: boolean;
    read: boolean;
    directPost: boolean;
  };
  member: {
    read: boolean;
    invite: boolean;
    edit: boolean;
    delete: boolean;
  };
  purchase: {
    read: boolean;
    write: boolean;
  };
  settings: {
    read: boolean;
    write: boolean;
  };
}

interface PermissionRight {
  dashboard: {
    overview: MemberRole[];
  };
  business: {
    read: MemberRole[];
    write: MemberRole[];
  };
  businessKnowledge: {
    write: MemberRole[];
    read: MemberRole[];
  };
  roleKnowledge: {
    write: MemberRole[];
    read: MemberRole[];
  };
  rssKnowledge: {
    write: MemberRole[];
    read: MemberRole[];
  };
  platformKnowledge: {
    write: MemberRole[];
    read: MemberRole[];
  };
  productKnowledge: {
    write: MemberRole[];
    read: MemberRole[];
  };
  contentGenerate: {
    readHistory: MemberRole[];
    saveDraft: MemberRole[];
    generateContent: MemberRole[];
  };
  contentScheduler: {
    write: MemberRole[];
    read: MemberRole[];
    directPost: MemberRole[];
  };
  member: {
    read: MemberRole[];
    invite: MemberRole[];
    edit: MemberRole[];
    delete: MemberRole[];
  };
  purchase: {
    read: MemberRole[];
    write: MemberRole[];
  };
  settings: {
    read: MemberRole[];
    write: MemberRole[];
  };
}

/** ====== Matrix Hak Akses (strict terhadap MemberRole) ====== */
const permissionRight: PermissionRight = {
  dashboard: {
    overview: ["Owner", "Admin", "Member"],
  },
  business: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner"],
  },
  businessKnowledge: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
  roleKnowledge: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
  rssKnowledge: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
  platformKnowledge: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner"],
  },
  productKnowledge: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
  contentGenerate: {
    readHistory: ["Owner", "Admin", "Member"],
    saveDraft: ["Owner", "Admin", "Member"],
    generateContent: ["Owner", "Admin", "Member"],
  },
  contentScheduler: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin", "Member"],
    directPost: ["Owner", "Admin", "Member"],
  },
  member: {
    read: ["Owner", "Admin", "Member"],
    invite: ["Owner"],
    edit: ["Owner"],
    delete: ["Owner"],
  },
  purchase: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
  settings: {
    read: ["Owner", "Admin", "Member"],
    write: ["Owner", "Admin"],
  },
};
/** ====== Helper: buat PermissionAccess dari role ====== */
function getAccess(role: MemberRole | null): PermissionAccess {
  const has = (allowed: MemberRole[]) => !!role && allowed.includes(role);

  const {
    dashboard,
    business,
    businessKnowledge,
    roleKnowledge,
    rssKnowledge,
    platformKnowledge,
    productKnowledge,
    contentGenerate,
    contentScheduler,
    member,
    purchase,
    settings,
  } = permissionRight;

  return {
    dashboard: {
      overview: has(dashboard.overview),
    },
    business: {
      read: has(business.read),
      write: has(business.write),
    },
    businessKnowledge: {
      read: has(businessKnowledge.read),
      write: has(businessKnowledge.write),
    },
    roleKnowledge: {
      read: has(roleKnowledge.read),
      write: has(roleKnowledge.write),
    },
    rssKnowledge: {
      read: has(rssKnowledge.read),
      write: has(rssKnowledge.write),
    },
    platformKnowledge: {
      read: has(platformKnowledge.read),
      write: has(platformKnowledge.write),
    },
    productKnowledge: {
      read: has(productKnowledge.read),
      write: has(productKnowledge.write),
    },
    contentGenerate: {
      readHistory: has(contentGenerate.readHistory),
      saveDraft: has(contentGenerate.saveDraft),
      generateContent: has(contentGenerate.generateContent),
    },
    contentScheduler: {
      read: has(contentScheduler.read),
      write: has(contentScheduler.write),
      directPost: has(contentScheduler.directPost),
    },
    member: {
      read: has(member.read),
      invite: has(member.invite),
      edit: has(member.edit),
      delete: has(member.delete),
    },
    purchase: {
      read: has(purchase.read),
      write: has(purchase.write),
    },
    settings: {
      read: has(settings.read),
      write: has(settings.write),
    },
  };
}

/** ====== Context & Provider ====== */
interface RoleContextValue {
  role: MemberRole | null;
  access: PermissionAccess;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { businessId } = useParams() as { businessId: string };
  const { data, isLoading } = useBusinessGetById(businessId);

  const role: MemberRole | null = data?.data?.data?.userPosition?.role ?? null;

  const access = useMemo(() => getAccess(role), [role]);

  return (
    <RoleContext.Provider value={{ role, access, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}

/** ====== Optional: export matrix kalau butuh audit/insight di UI ====== */
export const ROLE_PERMISSION_MATRIX = permissionRight;
