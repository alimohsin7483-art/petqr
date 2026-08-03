import { listSystemSettings } from "@/services/admin/admin.service";
import { SystemSettingForm } from "@/components/admin/system-setting-form";

export default async function AdminSettingsPage() {
  const settings = await listSystemSettings();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">System settings</h1>

      <div className="mb-8 flex flex-col gap-3">
        {settings.map((s) => (
          <div key={s.id} className="rounded-tag border border-line bg-white/50 p-5">
            <SystemSettingForm initialKey={s.key} initialValue={JSON.stringify(s.value)} />
          </div>
        ))}
        {settings.length === 0 && (
          <p className="text-sm text-ink/50">No settings configured yet.</p>
        )}
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Add new setting</p>
      <div className="rounded-tag border border-dashed border-line bg-white/30 p-5">
        <SystemSettingForm />
      </div>
    </div>
  );
}
