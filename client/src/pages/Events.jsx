import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Mock data - replace with real API call
    setEvents([
      {
        id: 1,
        title: "Alumni Webinar - Career Growth",
        date: "Oct 26, 2026",
        time: "6:00 PM EST",
        location: "Online",
        attendees: 45,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
      },
      {
        id: 2,
        title: "Annual Meet & Greet",
        date: "Oct 23, 2026",
        time: "3:00 PM EST",
        location: "Campus Hall",
        attendees: 120,
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"
      },
      {
        id: 3,
        title: "Alumni Webinar - Tech Trends",
        date: "Nov 15, 2026",
        time: "7:00 PM EST",
        location: "Online",
        attendees: 60,
        image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop"
      }
    ]);
  }, []);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Upcoming Events</h2>
        <p className="text-muted">Connect with alumni and expand your network</p>
      </div>

      <div className="row g-4">
        {events.map((event) => (
          <div key={event.id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <img 
                src={event.image} 
                alt={event.title}
                className="card-img-top"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title fw-bold">{event.title}</h5>
                
                <div className="d-flex align-items-center text-muted mb-2">
                  <Calendar size={16} className="me-2" />
                  <small>{event.date}</small>
                </div>
                
                <div className="d-flex align-items-center text-muted mb-2">
                  <Clock size={16} className="me-2" />
                  <small>{event.time}</small>
                </div>
                
                <div className="d-flex align-items-center text-muted mb-2">
                  <MapPin size={16} className="me-2" />
                  <small>{event.location}</small>
                </div>
                
                <div className="d-flex align-items-center text-muted mb-3">
                  <Users size={16} className="me-2" />
                  <small>{event.attendees} attending</small>
                </div>
                
                <button className="btn btn-primary w-100">
                  Register
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-5">
          <Calendar size={64} className="text-muted mb-3" />
          <p className="text-muted">No upcoming events at the moment</p>
        </div>
      )}
    </div>
  );
};

export default Events;
