export type MenuItem = {
  id: string;
  name: string;
  href?: string;
  icon: React.ReactNode;
  isAvailable?: boolean;
  requiredPermission?: string;
  children?: MenuItem[];
};