interface RepositoryPermissionWarningProps {
  canCreateRepository: boolean;
  type: 'note' | 'todo';
}

/**
 * RepositoryPermissionWarning Component
 * SOLID: Single Responsibility - Sadece yetki uyarısından sorumlu
 */
export const RepositoryPermissionWarning = ({
  canCreateRepository,
  type,
}: RepositoryPermissionWarningProps): JSX.Element | null => {
  if (canCreateRepository) {
    return null;
  }

  const message =
    type === 'note'
      ? 'ℹ️ Not oluşturma yetkiniz yok. Sadece mevcut notları görüntüleyebilirsiniz.'
      : "ℹ️ To-Do oluşturma yetkiniz yok. Sadece mevcut to-do'ları görüntüleyebilirsiniz.";

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">{message}</p>
    </div>
  );
};
