import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { ActivityItem } from "@/types/models";

const ActivityPulse = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const { data: activities } = useApi<ActivityItem[]>("/api/activities", []);

  useEffect(() => {
    if (activities.length <= 1) {
      return undefined;
    }
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [activities.length]);

  const activity = activities[index];

  if (!activity) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 activity-pulse">
      <div className="bg-card border border-border rounded-lg px-4 py-2.5 shadow-lg max-w-xs">
        <div
          className={`transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <p className="text-xs text-muted-foreground font-body">{activity.timestamp}</p>
          <p className="text-sm font-body mt-0.5">{activity.text}</p>
          {activity.actorName ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              By {activity.actorName}{activity.actorRole ? ` (${activity.actorRole})` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ActivityPulse;
