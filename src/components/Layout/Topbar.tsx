import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white border-b shadow flex items-center justify-between px-6 z-50">
      <div className="font-semibold text-lg">Library Manager</div>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black"
      >
        Logout
      </button>
    </header>
  );
}
