import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';


export default function Footer(){
    return(
        <div className = "footer">
            <Navbar bg="dark" variant="dark" >
                <Container>
                <Navbar.Brand href="/">Salem State Research Hub</Navbar.Brand>
                <Navbar.Collapse className="justify-content-end">
            </Navbar.Collapse>
                <Nav className="me-auto">
                </Nav>
            </Container>
            </Navbar>
        </div>
    )
}