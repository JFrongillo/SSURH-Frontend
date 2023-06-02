import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import { Link, useNavigate } from "react-router-dom";
import {grabUserInfo} from '../api'


export default function Navigaton() {
  const [user, setUser] = useState({})
  const [userDetails, setUserDetails] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserInfo();
    setUser(user);
    if (user.id) {
      setLoading(true);
      grabUserInfo(user.id)
        .then(({ data: res }) => {
          setUserDetails(res);
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          if (error.response && error.response.status >= 400 && error.response.status <= 500) {
            setError(error.response.data.message);
          }
        });
    }
  }, [user.id]);

  const handleLogout = (async) => {
    localStorage.clear();
    navigate('/')
    window.location.reload();
  }


  return (
    <Navbar bg= "dark" variant="dark" sticky = "top">
      <Container>
        <Navbar.Brand href="/">Salem State Research Hub</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/research">Research</Nav.Link>
          <Nav.Link href="/faculty">Faculty</Nav.Link>
        </Nav>
        <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {Object.keys(user).length !== 0 ? (
            <>Welcome, <a href={`/user`}>{userDetails.name || "loading!"}</a>! </>
          ) : (
            <a href="/login">Sign In</a>
          )}
        </Navbar.Text>
        {Object.keys(user).length !== 0 && (
            <Nav>
              <Nav.Link onClick={handleLogout}>log-out</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

