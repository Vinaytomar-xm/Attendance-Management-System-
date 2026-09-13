export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  if (!message) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="card">
          <h2 className="text-lg mb-2">Are you sure?</h2>
          <p className="text-muted text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button className="btn btn-ghost flex-1" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-danger flex-1" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}