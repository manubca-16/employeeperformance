import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, useApi } from "@/hooks/useApi";
import { BonusAnnouncement, Employee } from "@/types/models";
import { Gift } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BonusesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: announcements } = useApi<BonusAnnouncement[]>("/api/bonus-announcements", []);
  const { data: employees, refetch } = useApi<Employee[]>("/api/employees", []);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusForm, setBonusForm] = useState({
    title: "",
    amount: "",
    date: "",
    employeeId: "",
  });

  const awardedEmployees = employees.filter((e) => e.bonus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Bonuses</h2>
        {isAdmin && (
          <button
            className="bg-bonus text-bonus-foreground px-4 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
            onClick={() => setBonusOpen(true)}
          >
            Create Bonus
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-4">Active Bonus Opportunities</h3>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="border border-bonus/20 rounded-lg p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bonus/10 flex items-center justify-center shrink-0">
                  <Gift size={20} className="text-bonus" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground font-body mt-1">{a.description}</p>
                </div>
                <span className="text-bonus font-heading font-bold">INR {a.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No bonus announcements available.</p>
        )}
      </div>

      {!user || user.role !== "EMPLOYEE" ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-4">Awarded Bonuses</h3>
          <div className="space-y-3">
            {awardedEmployees.map((emp) => (
              <div key={emp._id} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-heading font-medium">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.bonus?.title}</p>
                </div>
                <span className="text-bonus font-heading font-bold">
                  INR {emp.bonus?.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Dialog open={bonusOpen} onOpenChange={setBonusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bonus</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              placeholder="Bonus title"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={bonusForm.title}
              onChange={(e) => setBonusForm({ ...bonusForm, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Amount"
                className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={bonusForm.amount}
                onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })}
              />
              <input
                type="date"
                className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={bonusForm.date}
                onChange={(e) => setBonusForm({ ...bonusForm, date: e.target.value })}
              />
            </div>
            <select
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={bonusForm.employeeId}
              onChange={(e) => setBonusForm({ ...bonusForm, employeeId: e.target.value })}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <button
              type="button"
              className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
              onClick={() => setBonusOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-bonus text-bonus-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
              onClick={async () => {
                await apiFetch("/api/bonuses", {
                  method: "POST",
                  body: JSON.stringify({
                    title: bonusForm.title,
                    amount: Number(bonusForm.amount),
                    date: bonusForm.date,
                    employeeId: bonusForm.employeeId,
                  }),
                });
                setBonusOpen(false);
                setBonusForm({ title: "", amount: "", date: "", employeeId: "" });
                await refetch();
              }}
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BonusesPage;
