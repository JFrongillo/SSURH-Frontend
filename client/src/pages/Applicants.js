import getUserInfo from "../utilities/decodeJwt";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { accept, deny, grabResearch, grabStudentByObjectID } from "../api";
import { useParams } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

import "./Applcants.scss"

export default function Applicants(){

    const [user, setUser] = useState({})
    const [students, setStudents] = useState([{}])
    const [title, setTitle] = useState("")
    const [applications, setApplcations] = useState([])
    const [acceptedStudents, setAcceptedStudents] = useState([]);
    const {id} = useParams()
    const navigate = useNavigate()

    useEffect(() =>{
        const user = getUserInfo()
        if (!user) {
            navigate("/login");
          } else {
            grabResearch(id).then((response) => {
              const responseData = response.data;
              const researchOwner = responseData.owner;
              const students = responseData.students
              const title = responseData.name
              console.log(students)

              /**
               * Checking if the currently logged in user is the owner of the research
               * if not, re-direct to the login
               */
              if (user.id !== researchOwner) {
                navigate("/login");
              }
              setUser(user);
              setStudents(students)
              setTitle(title)
            }).catch((error) => {
              console.log(error);
              if (error.response && error.response.status === 404) {
                navigate("/404");
              }
            });
          }
    },[])

    useEffect(() => {
        const fetchStudentData = async() =>{
            const apps = await Promise.all(students.map(async (student) =>{
                const response = await grabStudentByObjectID(student.studentId)
                const studentData = response.data
                return {
                    applicationId: student._id,
                    stuObjId: studentData._id,
                    name: studentData.name, 
                    email: studentData.email, 
                    stuID: studentData.stuID, 
                    gpa: studentData.gpa, 
                    status: studentData.status, 
                    isAccepted: student.isAccepted ? 'Accepted' : 'Pending Review',
                    acceptedSwitch: student.isAccepted, 
                    resume: studentData.resume, 
                    reason: student.reason
                }
            }))
            setApplcations(apps)
        }
        if(students.length > 0){
            fetchStudentData()
        }
    }, [students])

    function getFilenameFromUrl(url) {
        const parts = url.split("/");
        return parts[parts.length - 1];
    }


    const handleAccept = async(applicationId) =>{
        try {
            const response = await accept(id, applicationId);
            console.log(response)
            const updatedApps = applications.map((app) => {
              if (app.applicationId === applicationId) {
                app.acceptedSwitch = true;
                app.isAccepted = "Accepted";
              }
              return app;
            });
            setApplcations(updatedApps);
          } catch (error) {
            console.log(error);
          }
    }

    const handleDenial = async(applicationId) =>{
        try{
            await deny(id, applicationId);
            setApplcations(applications.filter(app => app.applicationId !== applicationId));
          } catch(error) {
            console.log(error)
          }
    }

    return(
        <>  
            <div>
                <h1 style={{textAlign: 'center'}}>Student applicants for: {title}</h1>
                <div className="application-cards-container">
                    {applications && applications.map(application => {
                        return(
                            <div key={application.applicationId} className="application-card">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{application.name}</Card.Title>
                                        <Card.Subtitle>{application.email}</Card.Subtitle>
                                        <Card.Text>
                                            <strong>Student ID:</strong> {application.stuID}<br />
                                            <strong>GPA:</strong> {application.gpa}<br />
                                            <strong>Status:</strong> {application.status}<br />
                                            <strong>Resume:</strong> <a href={application.resume} target="_blank" rel="noopener noreferrer">{getFilenameFromUrl(application.resume)}</a><br />
                                            <strong>Application Status:</strong> {application.isAccepted} <br/>
                                            <strong>Application Reason: </strong>
                                            <div className = "reason-box">
                                                <p>{application.reason}</p>
                                            </div>
                                            {application.acceptedSwitch ? (
                                                <Button variant="outline-danger" onClick={() => handleDenial(application.applicationId)}>Remove</Button>
                                            ) : (
                                                <>
                                                    <Button variant="outline-success" onClick={() => handleAccept(application.applicationId)}>Accept</Button>
                                                    <Button variant="outline-danger" onClick={() => handleDenial(application.applicationId)}>Deny</Button>
                                                </>
                                            )}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        )
                    })} 
                    {applications.length === 0 && 
                        <div className = "none-found">
                            <h1>No applications found.</h1>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}