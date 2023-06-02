import getUserInfo from "../utilities/decodeJwt"
import { useState, useEffect } from "react"
import { grabUserInfo, editUserInfo, uploadAvatar, facultyOwnedResearch, deleteResearch, updatePassword } from "../api"
import {Button, Form, Image as UserImage, Accordion} from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from "buffer"

import "./User.scss"

export default function User(){
    
    const [user, setUser] = useState({})
    const [userInfo, setUserDetails] = useState({})
    const [userOwnedResearch, setOwnedResearch] = useState([])
    const [imageInactive, setImageInactive] = useState(true)
    const [passInactive, setPassInactive] = useState(true)
    const [inactive, setInactive] = useState(true)
    const [error, setError] = useState("")
    const [image, setImage] = useState({});
    const [data, setData] = useState({name: userInfo.name, title: userInfo.title, roomNumber: userInfo.roomNumber , linkedIn: userInfo.linkedIn, bio: userInfo.bio})
    const [passwordData, setPasswordData] = useState({
        password: "",
        repeatedPassword: ""
    })
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    const navigate = useNavigate()

    useEffect(() => {
        const user = getUserInfo();
        setUser(user)
        if (!user.id) {
            navigate("/login");
        } else {
            const fetchData = async (id) => {
                const { data: { _id, ...rest } } = await grabUserInfo(id);
                //what's that tricking sound!? 
                setUserDetails({ ...rest, _id });
    
                if (rest.avatar) {
                    setCurrentImageUrl(rest.avatar);
                }
    
                const response = await facultyOwnedResearch(id);
                const researchWithFacultyNames = await Promise.all(response.data.map(async (research) => {
                    const facultyNames = await fetchFacultyNames(research.faculty);
                    return { ...research, facultyNames };
                }));
                setOwnedResearch(researchWithFacultyNames);
            };
    
            fetchData(user.id);
        }
    }, []);

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
        setInactive(false)
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        console.log(passwordData)
        setPassInactive(false)
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async () => {
            const buffer = reader.result;
            if (buffer) {
            const extension = file.type.split('/')[1];
            const fileName = `${uuidv4()}.${extension}`;
            const contentType = file.type;
    
            // Resize the image using canvas
            const resizedBuffer = await resizeImage(buffer, 415, 396);
    
            setImage({
                buffer: Buffer.from(resizedBuffer),
                originalname: file.name,
                mimetype: contentType,
                size: file.size,
                filename: fileName,
            });
            const resizedPreview = await resizeImage(buffer, 415, 396);
            setCurrentImageUrl(URL.createObjectURL(new Blob([resizedPreview])));
            setImageInactive(false)
            } else {
            console.error('Failed to read file buffer');
            }
        };
    };
    

      const resizeImage = async (buffer, width, height) => {
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([buffer]));
        await new Promise((resolve) => (img.onload = resolve));
      
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
      
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
      
        return new Promise((resolve) =>
          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onloadend = () => {
              resolve(reader.result);
            };
          }, 'image/jpeg', 1)
        );
      };

      const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            const response = await editUserInfo(userInfo._id, data)
            console.log(response)
            window.location.reload()
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
    
    const handleImageSubmit = async() =>{
        try{
            console.log(image)
            await uploadAvatar(userInfo._id, image) 
            window.location.reload()
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

    const handlePasswordSubmit = async(e) => {
        console.log(passwordData)
        e.preventDefault()
        if (passwordData.password !== passwordData.repeatedPassword) {
            setError("Passwords do not match");
            return;
        }
        const confirmed = window.confirm("Are you sure you want to change your password?")
        if(confirmed){
            await updatePassword(userInfo._id, passwordData).then(() => {
                setTimeout(function() {
                    window.alert("Your password has been successfully changed");
                    localStorage.clear();
                    navigate("/login");
                  }, 10);
            }).catch((error) =>{
                if(
                    error.response && 
                    error.response.status >= 400 &&
                    error.response.status <= 500
                    ){
                    setError(error.response.data.message)
                    }
            })
        }
    }

    const fetchFacultyNames = async (assistingFacultyIds) => {
        const names = [];
    
        for (const id of assistingFacultyIds) {
            const response = await grabUserInfo(id);
            names.push(response.data.name);
        }
    
        return names;
    };
      
    useEffect(() => {
    if (userOwnedResearch) {
        const facultyIds = userOwnedResearch.flatMap((data) => data.faculty);
        fetchFacultyNames(facultyIds);
    }
    }, [userOwnedResearch]);


    const handleResearchDelete = async(resId) =>{
        const confirmed = window.confirm("Are you sure you want to delete this research? You cannot undo this change.");

        if (confirmed) {
            await deleteResearch(resId).then(() => {
                window.location.reload();
              })
              .catch((error) => {
                console.log(error);
              });
        } else {
            //DO nothing
        }
    }
    

    return(
        <> 
        <h1 style={{ textAlign:'center', marginTop: '20px' }}>{userInfo.name}'s Profile Console</h1>
        <div className = "page">
            <div className = "user-edit">
                <div className="user-image">
                    <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    {currentImageUrl ? (
                        <UserImage src={currentImageUrl} className="rounded-circle" alt="User" />
                    ) : userInfo.avatar ? (
                        <UserImage src={userInfo.avatar} className="rounded-circle" alt="User" />
                    ) : (
                        <UserImage
                        src="https://fakeimg.pl/415x396"
                        className="rounded-circle"
                        alt="User"
                        />
                    )}
                    
                    <Button 
                    variant="dark" 
                    onClick={handleImageSubmit}
                    disabled = {imageInactive}>Update Avatar</Button>
                </div>
                <div className = "edit-form">
                    <Form>
                        <Form.Group className = "mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control 
                            type = "name"
                            name = "name"
                            onChange = {handleChange}
                            defaultValue={userInfo.name}/>
                        </Form.Group>
                        <Form.Group className = "mb-3" controlId="formBasicTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                            type = "title" 
                            name = "title"
                            onChange = {handleChange}
                            defaultValue={userInfo.title}/>
                        </Form.Group>
                        <Form.Group className = "mb-3" controlId="formBasicRoomNumber">
                            <Form.Label>Room Number</Form.Label>
                            <Form.Control 
                            type = "roomNumber" 
                            name = "roomNumber"
                            onChange = {handleChange}
                            defaultValue={userInfo.roomNumber}/>
                        </Form.Group>
                        <Form.Group className = "mb-3" controlId="formBasicLinkedIn">
                            <Form.Label>LinkedIn</Form.Label>
                            <Form.Control 
                            type = "linkedIn" 
                            name = "linkedIn"
                            onChange= {handleChange}
                            defaultValue={userInfo.linkedIn}/>
                        </Form.Group>
                        <Form.Group className = "mb-3"  controlId="formBasicBio">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control 
                            as="textarea"
                            rows={5}
                            type = "bio"
                            name = "bio" 
                            onChange = {handleChange}
                            defaultValue={userInfo.bio}
                            style={{ maxWidth: '700px',maxHeight: '200px', overflowY: 'scroll' }}/>
                        </Form.Group>
                    </Form>

                    <Button variant="dark" type = "submit" disabled = {inactive} onClick = {handleSubmit}>
                        Update
                    </Button>
                   <div className = "change-password">    
                        <Form>
                            <b>Update Password</b>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Control type="password" 
                                    name = "password"
                                    value = {passwordData.password}
                                    placeholder="New Password"
                                    onChange = {handlePasswordChange} />   
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicRepeatPassword">
                                    <Form.Control type="password" 
                                    name = "repeatedPassword"
                                    placeholder="Repeat New Password"
                                    value = {passwordData.repeatedPassword}
                                    onChange ={handlePasswordChange} />
                            </Form.Group>
                        </Form>
                        {error && <div className = "error">{error}</div>}
                        <Button variant="dark" type = "submit" disabled = {passInactive} onClick = {handlePasswordSubmit}>
                        Change Password
                        </Button>
                    </div> 
                </div>
                </div>
                <div className = "research-console">
                    <Button variant= "dark" href = "/create">Create New Research</Button>


                    {userOwnedResearch ? userOwnedResearch.map(data => {
                        const assistingFaculty = data.faculty;
                        const facultyNames = data.facultyNames || [];
                        console.log(data)
                        return (
                            <div key={data._id} >
                                <Accordion defaultActiveKey={""}>
                                    <Accordion.Item className = "research-tabs">
                                        <Accordion.Header> {data.name} </Accordion.Header>
                                        <Accordion.Body className="fixed-height-accordion">
                                            <p style={{maxWidth: "450px"}}>{data.description}</p>
                                            <p>Students Requested: {data.applicantsAmmount}</p>
                                            <p>Students Applied: <a href = {`/research/${data._id}/applicants`}>{data.students.length}</a></p>
                                            {assistingFaculty ? (
                                                <p> Faculty: {facultyNames.join(', ')} </p>
                                            ) : (
                                                <p>Faculty: N/A</p>
                                            )}
                                            <div className = "options-row">
                                                <Button variant="dark" href = {`/edit/${data._id}`}> Edit </Button>
                                                <Button variant="outline-danger" onClick = {() => handleResearchDelete(data._id)}>Delete</Button>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        )
                    }) : <p>To Create New Research Please Press the Button Above!</p>}

                </div>
            </div>
        </>
    )
}