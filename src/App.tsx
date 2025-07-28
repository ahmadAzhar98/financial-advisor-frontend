import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/pages/Login"
import SignupPage from "@/pages/Signup"
// import ChatPage from "@/pages/Chat"
import Chat_Page from "@/pages/Chats"


function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={< LoginPage />} />
          <Route path="/register" element={< SignupPage />} />
          <Route path="/chat" element={< Chat_Page />} />
        </Routes>
      </Router>
    )
}
export default App
