export type DrawerState = {
  isOpen: boolean;
  entityType: string | null;
  entityId: string | null;
  sourceScreen: string | null;
  drillPath: { type: string; id: string; label: string }[];
};

export const initialDrawer = (): DrawerState => ({
  isOpen: false,
  entityType: null,
  entityId: null,
  sourceScreen: null,
  drillPath: [],
});
