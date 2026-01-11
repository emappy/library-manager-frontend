import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        navigate("/dashboard");
      } else if (user.role === "librarian") {
        navigate("/borrow-return");
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="bg-white p-8 rounded border w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Sign in to your account</h1>
        <LoginForm
          onSubmit={async (email, password) => {
            await signIn(email, password);
          }}
        />
      </div>
    </div>
  );
}
