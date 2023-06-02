import getUserInfo from '../utilities/decodeJwt'
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {grabUserInfo, facultyOwnedResearch} from '../api'
import {useNavigate } from "react-router-dom";

import { Button, Image, Card} from 'react-bootstrap';

import "./Professor.scss"

export default function Professor(){

    const [user, setUser] = useState({})
    const [userDetails, setUserDetails] = useState({})
    const [error, setError] = useState("")
    const [ownedResearch, setResearch] = useState([])
    const {id} = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        setUser(getUserInfo());
        fetchData(id)
      }, []);
    
    
    const fetchData = async (id) =>{
        try{
            const {data: res} = await grabUserInfo(id)
            const {data: researchRes} = await facultyOwnedResearch(id)
            setUserDetails(res)
            setResearch(researchRes)
        } catch (error){
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
              ) {
                setError(error.response.data.message);
              }
        }
    }
    
    return(
        <>
        <div className = "profile-card">
        <div className="user-image">
        {userDetails.avatar ? (
            <Image
            src={userDetails.avatar}
            className="rounded-circle"
            />
        ) : (
            <Image
            src="https://fakeimg.pl/415x396"
            className="rounded-circle"
            />
        )}
        </div>
            <Card border='0' className = "transparent-card">
                <div className="user-details ml-3">
                    <Card.Body>
                            <Card.Title >{userDetails.name}</Card.Title>
                            <Card.Title >{userDetails.title}</Card.Title>
                            <Card.Title >{userDetails.roomNumber}</Card.Title>
                            <Card.Title >{userDetails.email}</Card.Title>
                            <Card.Link href ={userDetails.linkedIn}> <Card.Title>LinkedIn</Card.Title></Card.Link>
                    </Card.Body>
                </div>
            </Card>
            <div className = "interests" >
                    <h1>Research Interests</h1>
                    <p>{userDetails.bio}</p>
            </div>
            
        </div> 
        <div className = "research-list">
            <h1>{userDetails.name}'s previous and ongoing research:</h1>
            {ownedResearch.map(data => {
                return (
                    <Button key={data._id} variant = "dark" href = {`/research/${data._id}`} className="research-button">
                        {data.name}
                    </Button>
                )
            })}
        </div>
        </>
    )
}