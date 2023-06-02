import { grabResearch, 
         grabUserInfo, 
         createStudent, 
         grabStudentBysID, 
         uploadResume, 
         apply, 
         updateStudent,
         grabStudentByObjectID} from "../api"
import { useParams } from "react-router-dom";
import {useState, useEffect} from "react"
import { Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from "buffer"

import "./Research.scss"


export default function Research(){
    const [research, setResearch] = useState({})
    const [owner, setOwnerName] = useState("")
    const [faculty, setFaculty] = useState([])
    const [students, setStudents] = useState([])
    const [application, showApplication] = useState(false)
    const [student, isStudentPulled] = useState(false)
    const [inactive, setInactive] = useState(true) 
    const [pdf, setPDF] = useState({})
    const [pdfURL, setURL] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [studentData, setData] = useState({
        objectId: "",
        name: "",
        email: "", 
        stuID: "",
        gpa: 0.0,
        status: "",
        reason: "" 
    })
    const [pdfOnFile, setPDFOnFile] = useState("")
    /**
     * Create states for students, faculty, and publications
     * Create Logic for applications
     */
    const {id} = useParams()

    useEffect(() =>{
        const gatherData = async(e) =>{
            const response = await grabResearch(e)
            setResearch(response.data)
            getOwner(response.data.owner)
            getFacultyInvolved(response.data.faculty)
            getStudentsInvolved(response.data.students)
        }
        gatherData(id)
    },[])

    function getFilenameFromUrl(url) {
        const parts = url.split("/");
        return parts[parts.length - 1];
    }

    const handleChange = ({ currentTarget: input }) => {
        const { name, value } = input;
        let updatedValue = value;
        switch(name){
            case "status":
                updatedValue = String(value);
                break 
            case "gpa":
                 updatedValue = parseFloat(value);
                 break
            default:
        }
        setData((prevData) => ({ ...prevData, [name]: updatedValue }));
        setInactive(false);
    };

    const getOwner = async(facId) =>{
        try{
            const response = await grabUserInfo(facId)
            setOwnerName(response.data.name)

        } catch (error) {
            console.log("error in pulling faculty data")
        }
    }

    const getFacultyInvolved = async (facultyIds) => {
        try {
          const namePromises = facultyIds.map((id) => grabUserInfo(id).then((response) => response.data.name));
          const names = await Promise.all(namePromises);
          const facultyString = names.join(", ");
          setFaculty(facultyString);
        } catch (error) {
          console.log(error);
        }
    };

    const getStudentsInvolved = async (stuApplicants) =>{
        try{
            const acceptedStudents = stuApplicants.filter((student) => student.isAccepted)
            const namePromises = acceptedStudents.map((student) => grabStudentByObjectID(student.studentId).then((response) => response.data.name))
            const names = await Promise.all(namePromises)
            const namesString = names.join(", ")
            setStudents(namesString)
        } catch (error) {
            console.log(error)
        }
    }
    
    const handleInterest = () =>{
        showApplication(!application)
        if(student === false){
            return
        } else {
            isStudentPulled(false)
            setData({
                objectId: "",
                name: "",
                email: "", 
                stuID: "",
                gpa: 0.0,
                status: "",
                reason: "" 
            })
        }
    }

    const handlePDFUpload = async(event) =>{
        const file = event.target.files[0];
        if (file.type === "application/pdf") {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = async () => {
            const buffer = reader.result;
            if (buffer) {
                const extension = "pdf";
                const fileName = `${uuidv4()}.${extension}`;
                const contentType = "application/pdf";
    
                setPDF({
                    buffer: Buffer.from(buffer),
                    originalname: file.name,
                    mimetype: contentType,
                    size: file.size,
                    filename: fileName,
                });

                console.log(pdf)

                setURL(URL.createObjectURL(file));
            } else {
                console.error("Failed to read file buffer");
            }
            };
        } else {
            console.error("File is not a PDF");
        }
    }

    const handleStudentLookup = async() =>{
        if (studentData.stuID.trim() === '') {
            setError("Please input a valid SSU Student ID")
            return;
        }
        const response = await grabStudentBysID(studentData.stuID)
        const studentResult = response.data
        if(studentResult !== null){
            setData({
                objectId: studentResult._id,
                name: studentResult.name, 
                email: studentResult.email,
                stuID: studentResult.stuID,
                gpa: studentResult.gpa,
                status: studentResult.status,
            })
            const resume = getFilenameFromUrl(studentResult.resume)
            setPDFOnFile(resume)
            isStudentPulled(true)
            showApplication(false)
        }
        else{
            isStudentPulled(true)
            showApplication(false)
        }
    }

    const handleApplicationSubmit = async() => {
        const application = {
            studentId: studentData.objectId,
            reason: studentData.reason
        }
        const student = { 
            name: studentData.name, 
            email: studentData.email,
            stuID: studentData.stuID,
            gpa: studentData.gpa,
            status: studentData.status,
        }
        if(student.gpa < 0.0 || student.gpa > 4.0){
            setError("GPA Must be between 0.0 and 4.0")
            setSuccess(false)
            return
        }

        const emailDomain = student.email.split('@')[1];
        if (emailDomain !== 'salemstate.edu') {
            setError("Invalid email domain. Please use your SSU email address which ends in @salemstate.edu.");
            setSuccess(false)
            return;
        }

        if(application.reason === ''){
            setError("Please fill in the box above with a reason why you are interested.")
            setSuccess(false)
        }

        if (!['Freshman', 'Sophomore', 'Junior', 'Senior'].includes(student.status)) {
            setError("Invalid student status. Please enter a status of Freshman, Sophomore, Junior, or Senior.");
            setSuccess(false)
            return;
        }

        try{
            if(application.studentId === ''){
                //assume new student and create student, 
                //upload resume if there is one, 
                //and then submit the application
                const newStudent = await createStudent(student)
                const newStudentData = newStudent.data
                application.studentId = newStudentData._id
                if(Object.keys(pdf).length !== 0){
                    await uploadResume(application.studentId,pdf)
                }
                await apply(id, application)
                setSuccess(true)
                setError("")
            }
            else {

                if (Object.keys(pdf).length !== 0) {
                    await uploadResume(application.studentId, pdf);
                }
                await updateStudent(application.studentId, student)
                await apply(id, application)
                setSuccess(true)
                setError("")
            }
        } catch (error) {
            setError("Cannot create application")
        }
    }
    

    return(
        <>
            <div className="research-container">
                <div className="title-container">
                    <h1>{research.name}</h1>
                    <h2>- {owner}</h2>
                </div>
                <div className="content-container">
                    <div className="description-container">
                        <h2>Description</h2>
                        <p>{research.description}</p>
                        <h2>Publications/References</h2>
                        <p>
                            <a href={research.publications}>{research.publications}</a>
                        </p>
                    </div>
                    <div className="assistants-container">
                        <div>
                            <h2>Assisting Faculty</h2>
                            <p>{faculty}</p>
                        </div>
                        <div>
                            {research.openApplicants ? <Button variant="dark" onClick = {handleInterest}>Apply</Button> : 
                            <>
                                <h2>Assisting Students</h2>
                                <p>{students}</p>
                            </>} 
                        </div>
                    </div>
                </div>
                <div className = "apply-container">
                    {application ?
                    <>
                        <Form>
                            <Form.Group className = "mb-3" controlId = "stuIDForm">
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control name = "stuID" type = "stuID" placeholder="s#######" onChange = {handleChange}/>
                            </Form.Group>
                        </Form> 
                        {error && <div className = "error">{error}</div>}
                        <Button variant = "dark" onClick = {handleStudentLookup}> Lookup Student</Button>
                    </>
                    : <div></div> }
                    {student ? 
                    <>
                        <Form style={{ width: "80%" }}>
                        
                            <Form.Group className = "mb-3" controlId = "formBasicName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control name = "name" type = "name" defaultValue = {studentData.name} placeholder="Enter your name" onChange = {handleChange}/>
                            </Form.Group>
                        
                            <Form.Group className = "mb-3" controlId = "formBasicEmail">
                                <Form.Label>SSU Email</Form.Label>
                                <Form.Control name = "email" type = "email" defaultValue = {studentData.email} placeholder="Enter your Salem State Email" onChange = {handleChange}/>
                            </Form.Group>
                            
                            <Form.Group className = "mb-3" controlId = "stuIDForm" >
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control name = "stuID" type = "stuID" defaultValue = {studentData.stuID} disabled/>
                            </Form.Group>
        
                            <Form.Group className="mb-3" controlId="stuIDForm">
                            <Form.Label>GPA</Form.Label>
                            <Form.Control
                                name="gpa"
                                type="number"
                                placeholder="Enter your GPA"
                                min="0.0"
                                max="4.0"
                                step="0.1"
                                value = {studentData.gpa}
                                onChange={handleChange}
                            />
                            </Form.Group>


                            <Form.Group className = "mb-3" controlId = "stuIDForm">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name = "status" type = "status" value = {studentData.status} placeholder="Select what year you are" onChange = {handleChange}>
                                    <option>Select Status</option>
                                    <option>Freshman</option>
                                    <option>Sophomore</option>
                                    <option>Junior</option>
                                    <option>Senior</option>
                                </Form.Select>
                            </Form.Group>
                            <label>
                                Upload your resume: 
                                <input type="file"  accept=".pdf" onChange={handlePDFUpload} style={{ marginLeft: "10px" }} />
                            </label>
                            <p>Previous PDF file: {pdfOnFile ? pdfOnFile: "None"}</p>
                            <Form.Group className = "mb-3" controlId = "stuReasonForm">
                                <Form.Control
                                 as = "textarea" 
                                 rows = "5" 
                                 name = "reason"
                                 type = "reason" 
                                 placeholder="What interests you about the research?"
                                 onChange = {handleChange}/>
                            </Form.Group>
                        </Form> 
                        {error && <div className = "error">{error}</div>}
                        {success && <p>You have successfully applied to {`${research.name}`}!!</p>}
                        <Button variant="dark" onClick = {handleApplicationSubmit}>Submit Application</Button>
                    </>
                    : <div></div>}
                </div>
            </div>
        </>

    )

}