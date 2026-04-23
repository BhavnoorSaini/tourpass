import { spacing } from '@/constants/spacing';

export const FLOATING_TAB_BAR_HEIGHT = 54;

export function getFloatingTabBarBottom(safeAreaBottom: number) {
  return Math.max(safeAreaBottom, spacing.sm);
}

export function getMapOrnamentBottomOffset(safeAreaBottom: number) {
  return getFloatingTabBarBottom(safeAreaBottom) + FLOATING_TAB_BAR_HEIGHT;
}
