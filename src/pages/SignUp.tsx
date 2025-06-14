import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { AuthForm } from "../components/auth/AuthForm";


const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  userType: z.enum(["EV_DRIVER", "STATION_OPERATOR", "ADMIN"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const { register, isAuthenticated, user, isLoading } = useAuth();

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate page
  if (isAuthenticated && user) {
    switch (user.userType) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "EV_DRIVER":
        return <Navigate to="/evdriver" replace />;
      case "STATION_OPERATOR":
        return <Navigate to="/operator" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  async function onSubmit(values: FormValues) {
    await register(values);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-gray-500">Enter your information to sign up</p>
          </div>
          <AuthForm
            onSubmit={onSubmit}
            formSchema={formSchema}
            defaultValues={{
              username: "",
              password: "",
              email: "",
              firstName: "",
              lastName: "",
              userType: "EV_DRIVER",
            }}
            submitButtonText="Sign Up"
            loadingButtonText="Creating account..."
            isSignUp={true}
          />
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <img
          src="/Electric car-rafiki (1).svg"
          alt="Authentication"
          className="w-full h-full object-contain p-8"
        />
      </div>
    </div>
  );
} 