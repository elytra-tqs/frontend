import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { AuthForm } from "../components/auth/AuthForm";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const { login } = useAuth();

  async function onSubmit(values: FormValues) {
    await login(values.username, values.password);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500">Enter your credentials to sign in</p>
          </div>
          <AuthForm
            onSubmit={onSubmit}
            formSchema={formSchema}
            defaultValues={{
              username: "",
              password: "",
            }}
            submitButtonText="Sign In"
            loadingButtonText="Signing in..."
          />
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <img
          src="/Electric car-rafiki.svg"
          alt="Authentication"
          className="w-full h-full object-contain p-8"
        />
      </div>
    </div>
  );
} 