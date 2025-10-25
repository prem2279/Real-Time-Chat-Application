
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"
import Navbar from "./components/Navbar"
import MainPage from "./pages/MainPage"
import Signup from "./pages/Signup"
import PrivateChat from "./pages/PrivateChat"
import ChatArea from "./pages/ChatArea"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import './App.css'

function App(){
    return(
        <Router>
            <div className="App">
                <Navbar/>
                <Routes>
                    <Route path="/" element={<MainPage/>} />
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="/chatarea" element={
                        <ProtectedRoute>
                        <ChatArea/>
                        </ProtectedRoute>
                    }/>
                    <Route path="/privatechat" element={
                        <ProtectedRoute>
                            <PrivateChat/>
                        </ProtectedRoute>
                    }/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </div>
        </Router>
    )
}

export default App;