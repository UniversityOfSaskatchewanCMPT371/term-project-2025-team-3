import * as Network from "expo-network";
import { iWelcomeFactController } from "@/interfaces/iWelcomeFact";
import { useEffect, useRef, useState } from "react";
import logger from "@/utils/logger";

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

/**
 *
 * @returns
 */
export function useWelcomeFact(
  welcomeController: iWelcomeFactController
): string | undefined {
  const [fact, setFact] = useState<string>();
  const [rerun, setRerun] = useState<boolean>(false);

  const controllerRef = useRef(welcomeController);

  const getFact = async () => {
    const fact = await controllerRef.current.getFact();
    setRerun(fact.rerun);
    setFact(fact.fact);
  };

  useEffect(() => {
    getFact();
  }, []);

  if (rerun) {
    logger.info("Rerunning the fact get");
    getFact();
  }

  return fact;
}

export function useUpdateWelcomeFacts(
  welcomeController: iWelcomeFactController
) {
  const [isConnected, setIsConnected] = useState<boolean | undefined>(
    undefined
  );
  const [result, setResult] = useState<{
    success: boolean;
    factsUpdated: number;
  }>();
  useEffect(() => {
    let isMounted = true; // Prevent updates after unmount

    const tryUpdate = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        logger.error("No network connection");
        return; // Don't run if offline
      }

      try {
        const updateResult = await welcomeController.updateFactList();
        if (isMounted) setResult({ success: true, factsUpdated: updateResult });
      } catch (error: any) {
        logger.error(error);
        if (isMounted) setResult({ success: false, factsUpdated: 0 });
      }
    };

    tryUpdate();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, []); // Empty dependency array → Runs once when app starts

  return result;
}
