import { useEffect, useRef, useState } from "react";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { useApi } from "@/hooks/useApi";
import { formatRoleLabel } from "@/lib/roles";
import { BonusAnnouncement } from "@/types/models";

const AppHeader = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data: announcements } = useApi<BonusAnnouncement[]>("/api/bonus-announcements", []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="relative w-80">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search employees, tasks, announcements..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex items-center gap-4" ref={ref}>
        <div className="relative">
          <button
            onClick={() => setShowNotifications((current) => !current)}
            className="relative p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <Bell size={20} className="text-muted-foreground" />
            {announcements.length > 0 ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-data-red" />
            ) : null}
          </button>

          {showNotifications ? (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <h4 className="font-heading text-sm font-semibold">Notifications</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="px-3 py-2.5 border-b border-border last:border-0 hover:bg-secondary/50"
                    >
                      <p className="text-sm font-medium">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {announcement.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Posted by {announcement.createdBy?.name || "System"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center text-sidebar-foreground font-heading text-sm font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-heading font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{formatRoleLabel(user?.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
