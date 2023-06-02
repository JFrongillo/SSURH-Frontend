//importing boostrap functions
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//importing react elements and hooks
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
//pulling the login API from our API
import { login } from '../api';

//importing styles for the page
import "./Login.scss"


export default function Login(){
    const [data, setData] = useState({email: "", password: ""})
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const { data: res } = await login(data);
          const { accessToken } = res;
          //store token in localStorage
          localStorage.setItem("accessToken", accessToken);
          navigate('/user')
        } catch (error) {
          if (
            error.response &&
            error.response.status >= 400 &&
            error.response.status <= 500
          ) {
            setError(error.response.data.message);
          }
        }
    };

    return(
        <>
            <div className = "login-background">
                <div className = "login-form">
                    <b>Salem State University Faculty Log-in</b>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>SSU Email address</Form.Label>
                            <Form.Control 
                            type="email"
                            name = "email"
                            onChange = {handleChange} 
                            placeholder="Enter SSU email" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" 
                            name = "password"
                            onChange = {handleChange}
                            placeholder="Password" />
                            <Form.Text className = "text-muted"><a href = "/recover">Forgot password?</a></Form.Text>
                        </Form.Group>
                        
                        {error && <div className = "error">{error}</div>}
                        <div className = 'login-signup'>
                            <Button variant="primary" 
                            type="submit"
                            onClick = {handleSubmit}>
                                Log-in
                            </Button>
                            <a href='/signup'>
                                <Form.Text className="text-muted">
                                Sign up!
                                </Form.Text>
                            </a>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    )
}