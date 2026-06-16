export function shouldShowReminder(
  lastUploadTimestamp: number | null,
  snoozeTimestamp: number | null,
  currentTimestamp: number,
): boolean {
  if (lastUploadTimestamp === null) {
    return false;
  }

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;

  const isStale = (currentTimestamp - lastUploadTimestamp) >= ONE_WEEK;
  if (!isStale) {
    return false;
  }

  if (snoozeTimestamp !== null) {
    const isSnoozed = (currentTimestamp - snoozeTimestamp) < ONE_DAY;
    if (isSnoozed) {
      return false;
    }
  }

  return true;
}
