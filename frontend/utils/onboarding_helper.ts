export function shouldShowOnboarding(
  watchlistUris: string[] | null,
  userDismissed: boolean,
): boolean {
  if (userDismissed) return false;
  if (!watchlistUris || watchlistUris.length === 0) return true;
  return false;
}
