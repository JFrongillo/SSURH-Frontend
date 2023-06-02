import getUserInfo from "../utilities/decodeJwt";
import { createResearch, allFaculty } from "../api";
import { useEffect, useState } from "react";
import { Button, Form, Dropdown, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom"

import "./CreateResearch.scss"

export default function CreateResearch(){
    const [user,setUser] = useState({})
    const [description, setDescription] = useState("")
    const [helpWanted, setHelpWanted] = useState(false)
    const [error, setError] = useState("")
    const [inactive, setActive] = useState(true)
    const [facultyList, populateFacultyList] = useState([{id: "", name: ""}])
    const [filter, setFilter] = useState("");
    const [data, setData] = useState({name: "", 
        description: description, 
        openApplicants: helpWanted, 
        applicantsAmount: 0, 
        faculty: [], 
        publications: ""})
    const navigate = useNavigate()
    
    const charCount = description.length
    const charCountClass = charCount > 2500 ? 'text-danger' : 'text-muted'

    useEffect(() => {
        const currentUser = getUserInfo();
        if (!currentUser.id) {
          navigate("/login");
        } else {
          grabAllFaculty(currentUser);
        }
      }, [navigate]);

    const handleChange = ({currentTarget: input}) => {
        const { name, value } = input;
        const updatedValue = name === "applicantsAmount" ? parseInt(value, 10) : value; // convert to integer if name is "applicantsAmount"
        setData({ ...data, [name]: updatedValue });
        setActive(false)
        console.log(data)
    }

    const handleFacultySelect = (selectedFacultyId) => {
        console.log(selectedFacultyId);
        if (data.faculty.includes(selectedFacultyId)) {
            setData({ ...data, faculty: data.faculty.filter(id => id !== selectedFacultyId) });
        } else {
            setData({ ...data, faculty: [...data.faculty, selectedFacultyId] });
        }
        setActive(false);
    };

    const filterFaculties = (e) => {
        console.log(e)
        setFilter(e.target.value);
    };

    const grabAllFaculty = async (excludedUser) => {
        try {
          // Grab all faculty from MongoDb except for the current user
          setUser(excludedUser)
          const response = await allFaculty();
          const faculties = response.data.filter(faculty => faculty._id !== excludedUser.id);
          const responseList = faculties.map((faculty) => ({
            id: faculty._id,
            name: faculty.name,
          }));
          populateFacultyList(responseList);
        } catch {
          console.log("error in creating list");
        }
      };

    function countDescriptionCharacters(event) {
        const newDescription = event.target.value;
        setDescription(newDescription);
        setData({ ...data, description: newDescription });
        setActive(false)
        console.log(data);
    }

    const acceptHelp = () => {
        var isNeeded = helpWanted
        if(isNeeded === false){
            isNeeded = true
            setHelpWanted(isNeeded)
            setData({...data, openApplicants: isNeeded})
        } else {
            isNeeded = false
            setHelpWanted(isNeeded)
            setData({...data, openApplicants: isNeeded})
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        try{
            await createResearch(user.id, data)
            navigate("/user")
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
            <h1>Create New Research</h1>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control type="name" name ="name" onChange={handleChange} placeholder="Enter a unique title" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                as="textarea"
                rows={10}
                type="description" 
                name ="description" 
                placeholder="Tell us about your research in 2500 characters or less"
                onChange={countDescriptionCharacters} />
                <Form.Text className={charCountClass}>
                {charCount}/2500
                </Form.Text>
                </Form.Group> 

                <Form.Group className="mb-3" controlId="formBasicTitle">
                <Form.Label>Refrences/Publications</Form.Label>
                <Form.Control type="name" name ="publications" onChange={handleChange} placeholder="Enter Reference Link" />
                </Form.Group>


                <Form.Group className = "mb-3" controlId = "formBasicCheckbox">
                    <Form.Text>Click this if you want student applicants <i>(in development)</i> </Form.Text>
                    <Form.Check type="checkbox" label = "Accepting Students?" onChange ={acceptHelp}  />
                </Form.Group>

                {helpWanted && 
                <Form.Group className = "mb-3" controlId = "fromBasicNumberInput">
                    <Form.Control
                    type="number"
                    name="applicantsAmount"
                    placeholder="How many students?"
                    pattern="\d+"
                    required
                    onChange={handleChange}/>
                </Form.Group>}

                <Form.Text>Select the assisting faculty</Form.Text>
                {data.faculty.map((facultyId) => {
                const faculty = facultyList.find((f) => f.id === facultyId);
                return <Form.Text key={facultyId}>{faculty.name}</Form.Text>;
                })}
                <Dropdown autoClose={false}>
                    <Dropdown.Toggle variant="dark">Select Faculty</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <FormControl
                        type="text"
                        placeholder="Filter by name"
                        className="mx-3 my-2 w-auto"
                        value={filter}
                        onChange={filterFaculties}
                        />
                        {facultyList
                        .filter((faculty) => faculty.name.toLowerCase().includes(filter.toLowerCase()))
                        .map((faculty) => (
                            <Dropdown.Item
                            key={faculty.id}
                            value={faculty.id}
                            onClick={() => handleFacultySelect(faculty.id)}
                            active={data.faculty.includes(faculty.id)}
                            className={data.faculty.includes(faculty.id) ? 'active' : ''}
                            >
                            {faculty.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                

            </Form>
            {error && <div className = "error">{error}</div>}
            <Button variant="dark" type = "submit" disabled = {inactive} onClick = {handleSubmit}>
                        Create
            </Button>
        </>
    )
}
