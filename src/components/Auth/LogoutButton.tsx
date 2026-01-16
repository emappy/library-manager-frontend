import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LogoutButton() {
  const navigate = useNavigate();
  const {signOut } = useAuth();

  const handleLogout = () => {
    signOut(); 
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
