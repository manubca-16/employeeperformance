import { useApi } from "@/hooks/useApi";
import { ActivityItem, BonusAnnouncement } from "@/types/models";
import { Megaphone } from "lucide-react";

const AnnouncementsPage = () => {
  const { data: announcements } = useApi<BonusAnnouncement[]>("/api/bonus-announcements", []);
  const { data: activities } = useApi<ActivityItem[]>("/api/activities", []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold">Announcements</h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-4">Bonus Announcements</h3>
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a._id} className="border border-border rounded-lg p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bonus/10 flex items-center justify-center shrink-0">
                  <Megaphone size={20} className="text-bonus" />
                </div>
                <div>
                  <p className="font-heading font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground font-body mt-1">{a.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Posted by {a.createdBy?.name || "System"} on {a.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            activities.map((a) => (
              <div key={a._id} className="py-2 border-b border-border last:border-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-body">{a.text}</p>
                  <p className="text-xs text-muted-foreground shrink-0">{a.timestamp}</p>
                </div>
                {a.actorName ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    By {a.actorName}{a.actorRole ? ` (${a.actorRole})` : ""}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
