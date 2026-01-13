import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Navbar, Nav } from 'react-bootstrap';

function App() {
  // STATE VARIABLES
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '', description: '', assignee: '', priority: 'Low', status: 'Open'
  });

  // --- 1. LOGIN SYSTEM (Fake/Simple) ---
  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    if (username) {
      localStorage.setItem('user', username);
      setUser(username);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // --- 2. FETCH DATA FROM SERVER ---
  useEffect(() => {
    if (user) {
      axios.get('https://bug-tracker-app-98cs.onrender.com/api/tickets')
        .then(res => setTickets(res.data))
        .catch(err => console.log(err));
    }
  }, [user]);

  // --- 3. SAVE NEW TICKET ---
  const handleSubmit = () => {
    axios.post('https://bug-tracker-app-98cs.onrender.com/api/tickets', newTicket)
      .then(() => {
        setShowModal(false);
        // Refresh list
        return axios.get('https://bug-tracker-app-98cs.onrender.com/api/tickets');
      })
      .then(res => setTickets(res.data))
      .catch(err => console.log(err));
  };

  // --- 4. DELETE TICKET ---
  const handleDelete = (id) => {
    axios.delete(`https://bug-tracker-app-98cs.onrender.com0/api/tickets/${id}`)
      .then(() => {
         // Refresh list
         return axios.get('hhttps://bug-tracker-app-98cs.onrender.com/api/tickets');
      })
      .then(res => setTickets(res.data));
  };

  // --- SEARCH FILTER ---
  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.assignee && ticket.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- LOGIN PAGE RENDER ---
  if (!user) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
        <Card style={{ width: '400px' }} className="p-4 shadow border-0">
          <div className="text-center mb-4">
             <h1 style={{ fontSize: '3rem' }}>🐞</h1>
             <h3>Bug Tracker</h3>
             <p className="text-muted">Enter your name to access the system</p>
          </div>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Control name="username" placeholder="Your Name (e.g. Shashank)" required size="lg" />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 btn-lg">Login</Button>
          </Form>
        </Card>
      </Container>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  return (
    <>
      <Navbar bg="primary" variant="dark" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand>🐞 Bug Tracker System</Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <span className="text-white me-3">Welcome, <strong>{user}</strong></span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <Form.Control 
              type="text" 
              placeholder="🔍 Search tickets by title or assignee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm"
            />
          </Col>
          <Col md={4} className="text-end">
            <Button onClick={() => setShowModal(true)} variant="success" className="shadow-sm">+ Create Ticket</Button>
          </Col>
        </Row>

        <Row>
          {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
            <Col md={4} className="mb-4" key={ticket.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg={ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'success'}>
                      {ticket.priority}
                    </Badge>
                    <Badge bg={ticket.status === 'Resolved' ? 'success' : 'secondary'}>{ticket.status}</Badge>
                  </div>
                  <Card.Title>{ticket.title}</Card.Title>
                  <Card.Text className="text-muted small">{ticket.description}</Card.Text>
                  <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                    <small className="text-muted fw-bold">👤 {ticket.assignee || 'Unassigned'}</small>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(ticket.id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )) : <div className="text-center text-muted">No tickets found.</div>}
        </Row>

        {/* MODAL FORM */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Add New Bug Ticket</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Issue Title</Form.Label>
                <Form.Control onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} placeholder="e.g. Homepage crashes" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Assign To</Form.Label>
                <Form.Control onChange={(e) => setNewTicket({...newTicket, assignee: e.target.value})} placeholder="e.g. Developer Name" />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Label>Status</Form.Label>
                  <Form.Select onChange={(e) => setNewTicket({...newTicket, status: e.target.value})}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </Form.Select>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Ticket</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default App;
