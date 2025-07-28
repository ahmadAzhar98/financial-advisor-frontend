import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("access_token");

    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-4">Threads</h2>
        <div className="space-y-2">
          <div className="cursor-pointer hover:bg-gray-700 p-2 rounded">New Chat</div>
        </div>
      </div>

      <div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
