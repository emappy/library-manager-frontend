import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button
        onClick={() => navigate("/books?create=1")}
        className="action-btn"
      >
        Add Book
      </button>
      <button
        onClick={() => navigate("/members?create=1")}
        className="action-btn"
      >
        Add Member
      </button>
      <button
        onClick={() => navigate("/borrows?create=1")}
        className="action-btn"
      >
        New Borrow
      </button>
      <button
        onClick={() => navigate("/borrows?filter=overdue")}
        className="action-btn"
      >
        View Overdue
      </button>
    </div>
  );
}
