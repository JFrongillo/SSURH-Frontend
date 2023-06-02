import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';
import { signup } from '../api';
import "./Signup.scss"
import { useNavigate } from 'react-router-dom';


export default function SignUp(){
    const [data, setData] = useState({name: "", email: "", password: ""})
    const [error, setError] = useState("")
    const [isSuccessfull, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleChange = ({currentTarget: input}) => {
        setData({ ...data, [input.name]: input.value})
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            await signup(data)
            setSuccess(true)
        } catch(error){ 
            if(
               error.response && 
               error.response.status >= 400 &&
               error.response.status <= 500
            ){
               setError(error.response.data.message)
            }
        }
    }

    return(
        <>
            <div className = "signup-background">
                <div className = "signup-form">
                    <b>SSURH Faculty Signup</b>
                    <Form>
                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                        type="name"
                        name = "name" 
                        onChange = {handleChange}
                        placeholder="Enter name" />

                        <Form.Text className="text-muted">
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                        type="email" 
                        name = "email"
                        onChange = {handleChange}
                        placeholder="Enter email" />
                        <Form.Text className="text-muted">
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" 
                        name = "password"
                        onChange = {handleChange}
                        placeholder="Password" />
                        <Form.Text className = "text-muted">
                        Password must be between 8-16 characters
                        </Form.Text>
                    </Form.Group>
                    {error && <div className = "error">{error}</div>}
                    {isSuccessfull && <div className = "success"><p>Signup Successful, please check your inbox!</p> 
                    <p>If nothing appears in your inbox, please check your spam folder!</p></div>}
                    <Button variant="primary" type="submit" onClick = {handleSubmit}>
                        Submit
                    </Button>
                    </Form>
                </div>
            </div>
        </>
    )
}