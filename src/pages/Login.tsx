import { LoginForm } from "@/components/login-form"
import logo from "@/assets/wealth_wise.jpg"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
      <img src={logo} alt="Wealth Wise Logo" className="mb-6 w-full h-auto" />
        <LoginForm />
      </div>
    </div>
  )
}