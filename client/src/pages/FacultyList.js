import React, { useState, useEffect } from "react";
import { allFaculty } from "../api";
import Image from 'react-bootstrap/Image'


import "./FacultyList.scss"

export default function FacultyList(){

    const [professors, setProfessors] = useState([]);

    useEffect(() => {
        const fetchProfessorNames = async () => {
            const response = await allFaculty();
            const faculties = response.data;
            setProfessors(faculties);
        }
        fetchProfessorNames();
    }, []);

    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

    return (
        <>
        <div className="description">
        <Image className="image" src="/pexels-yan-krukau-81974941.jpg" />
        <div className="text">
            <h1>Our Faculty</h1>
            <p>
            This is a list of all of the faculty on the Salem State Research Hub.
            Click on the names to open their profiles.
            </p>
        </div>
        </div>
        <div className ="prof-list">
        {professors.filter((faculty) => faculty.isVerified).sort((a, b) => collator.compare(a.name, b.name)).map((faculty, index, array) => {
            return (
            <div key={faculty._id}>
                <a href={`/professor/${faculty._id}`}>
                <p>{faculty.name}</p>
                </a>
            </div>
            );
        })}
        </div>
        </>
    );
}


