const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold">Settings</h2>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div>
          <h3 className="font-heading font-semibold mb-3">General</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-heading font-medium mb-1.5">Company Name</label>
              <input defaultValue="PerfTrack Inc." className="w-full max-w-md px-3 py-2 rounded-md border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="block text-sm font-heading font-medium mb-1.5">Default Department</label>
              <input defaultValue="Engineering" className="w-full max-w-md px-3 py-2 rounded-md border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-heading font-semibold mb-3">Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm font-body">
              <input type="checkbox" defaultChecked className="rounded" />
              Email notifications for bonus announcements
            </label>
            <label className="flex items-center gap-3 text-sm font-body">
              <input type="checkbox" defaultChecked className="rounded" />
              Weekly performance report emails
            </label>
          </div>
        </div>

        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
