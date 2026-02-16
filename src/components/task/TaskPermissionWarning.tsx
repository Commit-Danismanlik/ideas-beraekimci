interface TaskPermissionWarningProps {
  canCreateTask: boolean;
}

/**
 * TaskPermissionWarning Component
 * SOLID: Single Responsibility - Sadece yetki uyarısından sorumlu
 */
export const TaskPermissionWarning = ({
  canCreateTask,
}: TaskPermissionWarningProps): JSX.Element | null => {
  if (canCreateTask) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
      <p className="text-sm text-yellow-200">
        ℹ️ Görev oluşturma yetkiniz yok. Sadece mevcut görevleri görüntüleyebilirsiniz.
      </p>
    </div>
  );
};
