import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState} from 'react';
import { emailLookup, generateTempPassword } from '../api';


export default function Recover(){
    const [data, setData] = useState({
        email: ""
    })
    const [error, setError] = useState("")
    const [isSuccessful, setSuccess] = useState(false)

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
        console.log(data)
    };

    const handleSubmit = async(e) =>{ 
        e.preventDefault()
        try{
            const response = await emailLookup(data.email)
            const requestObject = { 
                name: response.data.name,
                userId: response.data._id,
                email: response.data.email
            }
            await generateTempPassword(requestObject)
            setSuccess(true)
        } catch (error) {
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
        <div className = "login-background">
            <div className = "login-form">
                <b>Salem State University Password Recovery</b>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Please input your SSU Faculty Email Address</Form.Label>
                        <Form.Control 
                        type="email"
                        name = "email"
                        onChange ={handleChange}
                        placeholder="Enter SSU email" />
                    </Form.Group>
                </Form>
                {isSuccessful && <p>Please check your inbox for password recovery!</p> }
                {error && <div className = "error">{error}</div>}
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Submit
                </Button>
            </div>
        </div>
    </>
    )
}