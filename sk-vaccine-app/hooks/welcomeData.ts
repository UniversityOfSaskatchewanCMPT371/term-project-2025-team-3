import { useEffect, useState } from "react";

/**
 *
 * Looks at the time in 24 hours and returns the "day" message based
 * on the results
 *
 * @returns a string in the form of "Morning", "Afternoon", "Evening" or "Day"
 * "Day" is only returned if none of the others hit, this should not happen
 */
export function useDayParts(): string {
  // Defaults to "Day" as in Good Day
  const [dayPart, setDayPart] = useState<string>("Day");

  useEffect(() => {
    const getCurrentTimeInfo = () => {
      const now = new Date();
      const hours = now.getHours(); // 24-hour format (0–23)

      if (hours >= 5 && hours < 12) {
        setDayPart("Morning");
      } else if (hours >= 12 && hours < 17) {
        setDayPart("Afternoon");
      } else {
        setDayPart("Evening");
      }
    };

    getCurrentTimeInfo();
  }, []);

  return dayPart;
}
