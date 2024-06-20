import React, { useEffect, useState } from 'react'
import {Link } from 'react-router-dom';
import axios from 'axios';

function AfterVanReservation({studentId}) {
  const [reserveState, setreserveState] = useState(false)
  const [reservation, setReservation] = useState(null)

  useEffect(() => {
    if (studentId) {
      const fetchReservation = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/Reservation/?student__student_id=${studentId}`);
          setReservation(response.data[0]);
          setreserveState(true)
          console.log(response.data[0].date)
        } catch (error) {
          console.log('Error feching reservation data: ', error);
        }
      };
      fetchReservation();
    }
  }, [studentId]);

  
    return (
      <div className='ContentArea'>
        <div className='justify-center flex flex-col'>
          {reserveState && reservation ? (
            <>
              <div className='Content-Reservation-After'>{"A Van is reserved"}</div>
              <div className='Content-Detail-Reservation-After'>
                <div style={{ marginBottom: '25px' }}>{"Date : "}{reservation.date}</div>
                <div style={{ marginBottom: '25px' }}>{"Time : "}{"9:00 AM"}</div>
                <div style={{ marginBottom: '25px' }}>{"Location : "}{"Front of building 7"}</div>
                <div style={{ marginBottom: '25px' }}>{"Reserved No : "}{reservation.reservation_number}</div>
                <div style={{ marginBottom: '25px' }}>{"Student ID : "}{reservation.student_id}</div>
                <div style={{ marginBottom: '25px' }}>{"Student Name : "}{reservation.student_firstname} {reservation.student_lastname}</div>
              </div>
            </>
          ) : (
            <div className='Content-Reservation-After'>{"A Van is not reserved"}</div>
          )}
           <div className='Content-Detail-Reservation-After'>
          <Link to="/home" className="link-style">Back to Home</Link>
          </div>
        </div>
      </div>
    );
          
}

export default AfterVanReservation