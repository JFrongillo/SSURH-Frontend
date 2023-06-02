import { useEffect, useState } from "react"
import { allResearch } from "../api"
import  Image  from "react-bootstrap/Image"

import "./ResearchList.scss"


export default function ResearchList(){
    const [research,getResearch] = useState([])
    
    useEffect(() => {
        const fetchResearchNames = async() =>{
            const response = await allResearch()
            const researches = response.data
            getResearch(researches)
        }
        fetchResearchNames()
    }, [])

    return (
        <>
            <div className = "page-description">
            <Image className="image" src="/pexels-thisisengineering-3913031.jpg" />
            <div className="text">
                <h1>Research list</h1>
                <p>
                This is a list of all of the research on the Salem State Research Hub. 
                Click on the names to open the research.
                </p>
            </div>
            </div>
            <div className="research-container-list">
            <div>
                <h1>Our Previous Research</h1>
                <p>This is a list of the various research that we have done at Salem State University.</p>
                {research.map(e => {
                return(
                    <div key={e._id}><a href={`/research/${e._id}`}>{e.name}</a></div> 
                )
                })}
            </div>
                <div className="open-research-container">
                    <div>
                    <h1>Ongoing Research</h1>
                    <p>For the aspiring student researchers! Connect with our professors now!</p>
                    {research.filter(x => x.openApplicants).map(x => {
                    return(
                        <div key={x._id}><a href={`/research/${x._id}`}>{x.name}</a></div>
                    )
                    })}
                    </div>
                </div>
            </div>
        </>
    )
}