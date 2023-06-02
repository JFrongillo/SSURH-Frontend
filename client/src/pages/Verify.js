import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { verify } from "../api"
import "./Verify.scss"

import Alert from 'react-bootstrap/Alert';

export default function Verify(){
    const {token} = useParams()
    const [error, setError] = useState("")
    const [successful, setSuccess] = useState(false)

    useEffect(() => {
        handleVerfication()
    })

    const handleVerfication = async() => {
        try{
            await verify(token)
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

    const showSuccess = () => {
        if(successful){
            return(
                <Alert variant = "success">
                    You have successfully verified your account! Please {''} 
                    <Alert.Link href = "/login"> Login</Alert.Link> here!
                </Alert>
            )
        }
        else{
            return(
                <Alert variant = "danger">
                    The account is not successfully verified! Please contact support if you believe this is an error.
                </Alert>
            )
        }
    }

    return (
        <>
            <div className = "verify-background">
                    {showSuccess()}
            </div>
        </>
    )
}