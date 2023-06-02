import getUserInfo from "../utilities/decodeJwt";
import { grabResearch, allFaculty, editResearch } from "../api";
import { useEffect, useState } from "react";
import { Button, Form, Dropdown, FormControl } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function EditResearch() {
  const [user, setUser] = useState({});
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [initialCount, setCount] = useState(0)
  const [description, setDescription] = useState("");
  const [helpWanted, setHelpWanted] = useState(false);
  const [error, setError] = useState("");
  const [inactive, setActive] = useState(true);
  const [facultyList, populateFacultyList] = useState([{ id: "", name: "" }]);
  const [filter, setFilter] = useState("");
  const [researchInfo, setInfo] = useState({});
  const [data, setData] = useState({
    name: "",
    description: "",
    openApplicants: false,
    applicantsAmount: researchInfo.applicantsAmount|| 0,
    faculty: [], // Initialize to empty array
    publications: ""
  });
  const navigate = useNavigate();
  const { resId } = useParams();

  const charCount = descriptionCount;
  const charCountClass = descriptionCount > 2500 ? "text-danger" : "text-muted";
  
  useEffect(() => {
    const user = getUserInfo();
  
    if (!user) {
      navigate("/login");
    } else {
      grabResearch(resId).then((response) => {
        const responseData = response.data;
        const researchOwner = responseData.owner;
        
        /**
         * Checking if the currently logged in user is the owner of the research
         * if not, re-direct to the login
         */
        if (user.id !== researchOwner) {
          navigate("/login");
        }
        setUser(user);
        setInfo(responseData);
      }).catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 404) {
          navigate("/404");
        }
      });
    }
  
    console.log(researchInfo);
  }, []);

  useEffect(() => {
    if (Object.keys(researchInfo).length > 0) {
      setData({
        name: researchInfo.name,
        description: researchInfo.description,
        openApplicants: researchInfo.openApplicants,
        applicantsAmount: researchInfo.applicantsAmount,
        faculty: researchInfo.faculty,
        publications: researchInfo.publications,
      });
      console.log(researchInfo);
      getAllFaculty();
    }
  }, [researchInfo]);

  useEffect(() => {
    console.log(data)
    if (researchInfo && researchInfo.description) {
      setDescriptionCount(researchInfo.description.length);
    }
  },[])

  useEffect(() => {
    if (researchInfo && researchInfo.openApplicants) {
      setHelpWanted(true);
    }
  }, [researchInfo]);

  useEffect(() => {
    if(researchInfo && researchInfo.applicantsAmmount){
      setCount(researchInfo.applicantsAmmount)
    }
  }, [researchInfo])

  const handleChange = ({ currentTarget: input }) => {
    const { name, value } = input;
    const updatedValue =
      name === "applicantsAmount" && value !== "" ? parseInt(value, 10) : value;
    setData({ ...data, [name]: updatedValue });
    console.log(data)
    setActive(false);
  };

  const handleFacultySelect = (selectedFacultyId) => {
    if (data.faculty.includes(selectedFacultyId)) {
      setData({
        ...data,
        faculty: data.faculty.filter((id) => id !== selectedFacultyId),
      });
    } else {
      setData({
        ...data,
        faculty: [...data.faculty, selectedFacultyId],
      });
    }
    setActive(false);
  };

  const filterFaculties = (e) => {
    console.log(e);
    setFilter(e.target.value);
  };

  function countDescriptionCharacters(event) {
    const newDescriptionLength = event.target.value.length;
    const newDescription = event.target.value
    setDescriptionCount(newDescriptionLength);
    setData({ ...data, description: newDescription });
    console.log(data)
    setActive(false);
  }

  const acceptHelp = () => {
    var isNeeded = helpWanted;
    if (isNeeded === false) {
      isNeeded = true;
      setHelpWanted(isNeeded);
      setData({ ...data, openApplicants: isNeeded });
      setActive(false);
    } else {
      isNeeded = false;
      const setZero = parseInt(0, 10)
      setHelpWanted(isNeeded);
      setData({ ...data, openApplicants: isNeeded, applicantsAmount: setZero });
      console.log(data)
      setActive(false);
    }
  }

  const getAllFaculty = async () => {
    try {
      // Grab all faculty from MongoDb except for the current user
      const response = await allFaculty();
      const faculties = response.data.filter(faculty => faculty._id !== user.id);
      const responseList = faculties.map((faculty) => ({
        id: faculty._id,
        name: faculty.name,
      }));
      populateFacultyList(responseList);
    } catch {
      console.log("error in creating list");
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
        const response = await editResearch(resId, data)
        console.log(response)
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
    return (
      <>
        <h1>Edit <i>{data.name}</i></h1>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="name"
              name="name"
              defaultValue={data.name}
              onChange={handleChange}
              placeholder="Enter a unique title"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              type="description"
              name="description"
              defaultValue={data.description}
              placeholder="Tell us about your research in 2500 characters or less"
              onChange={countDescriptionCharacters}
            />
            <Form.Text className={charCountClass}>
              {charCount}/2500
            </Form.Text>
          </Form.Group>
  
          <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Label>References/Publications</Form.Label>
            <Form.Control
              type="name"
              name="publications"
              defaultValue={data.publications}
              onChange={handleChange}
              placeholder="Enter Reference Link"
            />
          </Form.Group>
  
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Text>Click this if you want student applicants</Form.Text>
            <Form.Check
              type="checkbox"
              label="Accepting Students?"
              onChange={acceptHelp}
              checked={data.openApplicants}
            />
          </Form.Group>
  
          {helpWanted && (
            <Form.Group
              className="mb-3"
              controlId="fromBasicNumberInput"
            >
              <Form.Control
                type="number"
                name="applicantsAmount"
                placeholder="How many students?"
                pattern="[0-9]*"
                min = {0}
                max = {20}
                required
                onChange={handleChange}
                defaultValue={initialCount}
              />
            </Form.Group>
          )}
  
          <Form.Text>Select the assisting faculty</Form.Text>
          {data.faculty &&
            data.faculty.map((facultyId) => {
              const faculty = facultyList.find((f) => f.id === facultyId);
              return <Form.Text key={facultyId}>{faculty && faculty.name}</Form.Text>;
            })}
          <Dropdown autoClose={false}>
            <Dropdown.Toggle variant="dark">
              Select Faculty
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <FormControl
                type="text"
                placeholder="Filter by name"
                className="mx-3 my-2 w-auto"
                value={filter}
                onChange={filterFaculties}
              />
              {facultyList
                .filter((faculty) =>
                  faculty.name
                    .toLowerCase()
                    .includes(filter.toLowerCase())
                )
                .map((faculty) => (
                  <Dropdown.Item
                    key={faculty.id}
                    value={faculty.id}
                    onClick={() => handleFacultySelect(faculty.id)}
                    active={
                      data.faculty && data.faculty.includes(faculty.id)
                    }
                    className={
                      data.faculty.includes(faculty.id) ? 'active' : ''
                    }
                    >
                    {faculty.name}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form>
          {error && <div className="error">{error}</div>}
          <Button
            variant="dark"
            type="submit"
            disabled={inactive}
            onClick={handleSubmit}
            >
            Save Changes
          </Button>
        </>
      );
    }