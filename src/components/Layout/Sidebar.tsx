import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const linkClass =
  "block px-4 py-2 rounded hover:bg-gray-100 transition aria-[current=page]:bg-gray-200";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Books", path: "/books" },
  { name: "Borrow/Return", path: "/borrow-return" },
  { name: "Members", path: "/members", role: "admin" },
  { name: "Staff", path: "/staff", role: "admin" },
  { name: "Reports", path: "/reports", role: "admin" },
  { name: "Genres", path: "/genres", role: "admin" },
];

export default function Sidebar() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const role = user?.role || "";

  const filteredMenu = menuItems.filter(
    (item) => !item.role || item.role === role
  );

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r bg-white overflow-y-auto">
      <div className="p-4 font-semibold text-lg">Library Manager</div>
      <nav className="space-y-1 p-2">
        {filteredMenu.map((item) => (
          <NavLink key={item.name} to={item.path} className={linkClass}>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
