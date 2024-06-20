// import React, {useState, useEffect} from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function NotificationCard({ color, title, description }) {
//   return (
//     <div className={`notification-card ${color}`}>
//       <h2>{title}</h2>
//       <p>{description}</p>
//     </div>
//   ); 
// }

// function ServiceCard({ title, description, path}) {
//   let navigate = useNavigate();
  
//   function handleClick() {
//     navigate(path);
//   }
//   return (
//     <div className="service-card">
//       <h3>{title}</h3>
//       <p>{description}</p>
//       <button onClick={handleClick}>Click</button>
//     </div>
//   );
// }

// function Report({studentId}) {
//   const [students, setStudents] = useState([]);
//   const [reportDate, setreportDate] = useState('');

//   useEffect(() => {
//     if (studentId) { // studentIdが空でないことを確認
//       const fetchStudentInfo = async () => {
//         try {
//           const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
//           setStudents(response.data);
//           // const visaExpiryDate = new Date(response.data[0].visa_expire_date);
//           const ReportDate = new Date(response.data[0].report_90_days_date);
//           const today = new Date();
//           const differenceInTime1 = ReportDate.getTime() - today.getTime();
//           const differenceInDays1 = Math.ceil(differenceInTime1 / (1000 * 3600 * 24));
//           setreportDate(differenceInDays1);

//           console.log(students)
//         } catch (error) {
//           console.error('Error fetching student info:', error);
//           // エラー処理を適宜実装してください
//         }
//       };

//       fetchStudentInfo();
//     }
//   }, [studentId]);

//   return (
//     <div className='ContentArea'>
//         <NotificationCard
//           color="green"
//           // title="Next 90 days report in 90 days"
//           title={`Next 90 days report in ${reportDate} days`}
//           description="IAC will submit the report for you"
//         />
//       <div className='flex flex-row justify-center gap-16 flex-wrap'>
//         <div className='Content-Extension flex flex-col gap-40' style={{ flexBasis: '45%' }}>
//         {"Steps for report submission"}
//          <div className='Content-Extension-date'>
//           {"Step 1 : Bring passport to immigration office before or after a week of expire date"}
//           {"Step 2 : Submit your passport at Drive thru (You can reserve a Van)"}
//           {"Step 3 : Update your next report date in profile"}
//         </div>
//         </div>

//         <div className='Content-Extension flex flex-col gap-40'style={{ flexBasis: '45%' }}>
//         <ServiceCard
//           title="Van reservation"
//           description="If you need to reserve a van, click the below button"
//           path="/van_reservation"
//         />
//         </div>
//       </div>
//     </div> 
//   );
// }

// export default Report;

import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NotificationCard({ color, title, description }) {
  return (
    <div className={`notification-card ${color}`}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ); 
}

function ServiceCard({ title, description, path}) {
  let navigate = useNavigate();
  
  function handleClick() {
    navigate(path);
  }
  return (
    <div className="service-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

function ExplainCard({ title, description}) {
  return (
    <div className="service-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Report({studentId}) {
  const [students, setStudents] = useState([]);
  const [reportDate, setreportDate] = useState('');

  useEffect(() => {
    if (studentId) {
      const fetchStudentInfo = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
          setStudents(response.data);
          const ReportDate = new Date(response.data[0].report_90_days_date);
          const today = new Date();
          const differenceInTime1 = ReportDate.getTime() - today.getTime();
          const differenceInDays1 = Math.ceil(differenceInTime1 / (1000 * 3600 * 24));
          setreportDate(differenceInDays1);

          console.log(students)
        } catch (error) {
          console.error('Error fetching student info:', error);
        }
      };

      fetchStudentInfo();
    }
  }, [studentId]);

  return (
    <div className='ContentArea'>
      <div className="notification-row"> 
      <NotificationCard
          color="green"
          title={`Next 90 days report in ${reportDate} days`}
          description="IAC will submit the report for you"
        />
      </div>
      <div className="service-row">
       <ExplainCard
            title="Steps for report submission"
            description="Step 1 : Bring passport to immigration office before or after a week of expire date"
        />  
        <ExplainCard
            title="Steps for report submission"
            description="Step 2 : Submit your passport at Drive thru (You can reserve a Van)"
        /> 
        <ExplainCard
            title="Steps for report submission"
            description="Step 3 : Update your next report date in profile" 
        />         
       </div>
       <div className="service-row">
       <ServiceCard
            title="Van reservation"
            description="If you need to reserve a van, click the below button"
            path="/van_reservation"
        />
        <ServiceCard
        title="Token"
        description="Click the button below for token transaction"
        path="/token"
      />       
       </div>  
      </div>  
  );
}

export default Report;
