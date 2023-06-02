import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import "./HomePage.scss"

export default function HomePage(){
    return (
    <>
        <div>
            <Card>
                <Card.Img variant = "top" src="homepagebanner.jpg"/>
            </Card>
        </div>
        <div className = "title">
            <h1>Welcome to the Salem State Research Hub</h1>
            <p><b>Please slect from the options below, or look to the navbar at the top of the page.</b></p>
        </div>
        <div className = "card-selects">
            <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src="/studentinlab.png" />
                <Card.Body>
                    <Card.Title>View Our Research</Card.Title>
                    <Card.Text>
                    Our college has partaken in some interesting research. Click to see
                    what we have done in the past!
                    </Card.Text>
                    <Button variant="outline-dark" href='/research'>View Research</Button>
                </Card.Body>
            </Card>
            <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src="/pexels-ivan-samkov-5676744.jpg" />
                <Card.Body>
                    <Card.Title>Faculty</Card.Title>
                    <Card.Text>
                    Take a look at our interesting and diverse faculty and see their interests!
                    </Card.Text>
                    <Button variant="outline-dark" href='/faculty'>View Faculty</Button>
                </Card.Body>
            </Card>
        </div>  
    </>
    )
}