import { formatDuration, formatMinutesAsTime, parseTimeToMinutes } from "../utils/time.js";

export function calculateWorkday({ loginTime, mealLogout, mealLogin, requiredHours, requiredMinutes }) {
  const login = parseTimeToMinutes(loginTime);
  const lunchOut = parseTimeToMinutes(mealLogout);
  const lunchIn = parseTimeToMinutes(mealLogin);
  const workMinutes = Number(requiredHours || 0) * 60 + Number(requiredMinutes || 0);

  const errors = [];
  if (login === null) errors.push("Enter a valid login time.");
  if (!workMinutes || workMinutes <= 0) errors.push("Enter required work time.");

  let mealMinutes = 0;
  if (mealLogout || mealLogin) {
    if (lunchOut === null || lunchIn === null) {
      errors.push("Enter both meal logout and meal login times.");
    } else {
      mealMinutes = lunchIn - lunchOut;
      if (mealMinutes < 0) mealMinutes += 24 * 60;
      if (mealMinutes > 4 * 60) errors.push("Meal break looks longer than 4 hours.");
    }
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const logoutMinutes = login + workMinutes + mealMinutes;

  return {
    ok: true,
    loginTime,
    mealDuration: mealMinutes,
    requiredDuration: workMinutes,
    logoutTime: formatMinutesAsTime(logoutMinutes),
    totalElapsed: workMinutes + mealMinutes,
    rows: [
      ["Login time", loginTime],
      ["Meal duration", formatDuration(mealMinutes)],
      ["Required work", formatDuration(workMinutes)],
      ["Total elapsed", formatDuration(workMinutes + mealMinutes)],
      ["Estimated logout", formatMinutesAsTime(logoutMinutes)],
    ],
  };
}
