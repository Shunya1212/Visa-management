import React, {useState, useEffect}from 'react'
import {Link } from 'react-router-dom';
import axios from 'axios';

function AfterVisaExtension({studentId}) {
  const [complete_date, setcomplete_date] = useState()
  const [message, setmessage] = useState()
  useEffect(() => {
    if (studentId) {
      const fetchReservation = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/Request_visa_extension/?student__student_id=${studentId}`);     
          if(!response.data[0]){
            setmessage("Sorry, IAC is not confirmed yet. Please wait.")
          }
          else {
            setcomplete_date(response.data[0].complete_date);
            if(response.data[0].is_completed){
              setmessage("Your letter is completed in ")
            }
            else if(response.data[0].complete_date){
              setmessage("Please come to pick up the letter in : ")
            }
            else {
              setmessage("IAC is not confirmed completed date, please wait.")
            }
          }
        } catch (error) {
          console.log('Error feching request data: ', error);
        }
      };
      fetchReservation();
    }
  }, [studentId]);

    return (
        <div className='ContentArea'>
          <div className='Content-Extension-After justify-center flex flex-col'> {/* flex-rowからflex-colに変更 */}
            <div style={{ marginBottom: '30px' }}>{message}{complete_date}</div>
            <Link to="/home" className="link-style">Back to Home</Link>
          </div>
        </div>
      )
      
}

export default AfterVisaExtension