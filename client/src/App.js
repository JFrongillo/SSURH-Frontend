import React from "react"
import { createContext, useState, useEffect } from "react"
import {Route, Routes, useLocation, Navigate} from "react-router-dom"
import getUserInfo from "./utilities/decodeJwt"

import Navbar from "./components/navbar"
import Footer from "./components/footer"
import NotFound from "./pages/NotFound"

import Login from "./pages/Login"
import SignUp from "./pages/Signup"
import Verify from "./pages/Verify"
import User from "./pages/User"
import Recover from "./pages/Recover"


import CreateResearch from "./pages/CreateResearch"
import EditResearch from "./pages/EditResearch"

import FacultyList from "./pages/FacultyList"
import ResearchList from "./pages/ResearchList"
import HomePage from "./pages/HomePage"
import Professor from "./pages/Professor"
import Research from "./pages/Research"
import Applicants from "./pages/Applicants"

export const UserContext = createContext();

export default function App() {
  const location = useLocation();

  const showHeaderFooter = location.pathname !== "/login" 
                        && location.pathname !== "/signup"
                        && location.pathname !== "/recover"
                        && !/^\/verify\/[a-zA-Z0-9-_]+$/.test(location.pathname)
                        && location.pathname !== "/404"

  const showFooter = location.pathname === "/"
        

  const [user, setUser] = useState();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);


  return (
    <div>
      {showHeaderFooter && <Navbar />}
      <div>
        <UserContext.Provider value = {user}>
          <Routes>
            {/* Add general routes in here /research, /faculty */}
            <Route exact path="/" element={<HomePage />} />
            <Route exact path = "/faculty" element = {<FacultyList/>}/>
            <Route exact path = "/research" element = {<ResearchList/>}/>
            
            {/** Logging in and Signing up */}
            <Route exact path="/login" element = {<Login />} />
            <Route exact path="/signup" element = {<SignUp/>}/>
            <Route exact path="/recover" element = {<Recover/>}/>
            <Route exact path= "/verify/:token" element = {<Verify/>}/>

            {/**User console */}
            <Route exact path= "/user" element = {<User/>}/>
            <Route exact path="/create" element = {<CreateResearch/>}/>
            <Route exact path= "/edit/:resId" element = {<EditResearch/>}/>

            {/** Research and faculty paths */}
            <Route exact path= "professor/:id"element={<Professor />}/>
            <Route exact path= "research/:id"element={<Research />}/>
            <Route exact path= "research/:id/applicants" element={<Applicants/>}/>

            <Route path="*" element={<Navigate to="/404" />} />
            <Route exact path="/404" element={<NotFound />} />
          </Routes>
        </UserContext.Provider>
      </div>
      {(showFooter && showHeaderFooter) && <Footer />}
    </div>
  );
}


