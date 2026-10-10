export default function PostNoticeCheckbox({ checked, onChange, disabled }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-gray-700 dark:border-theme-border dark:bg-theme-subtle dark:text-theme-secondary">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled}
        className="h-5 w-5 shrink-0 accent-blue-600 disabled:cursor-not-allowed dark:accent-theme-primary" />
      공지사항으로 등록
      {checked && <span className="ml-auto shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-theme-warning-border dark:bg-theme-warning-bg dark:text-theme-warning">공지</span>}
    </label>
  );
}
