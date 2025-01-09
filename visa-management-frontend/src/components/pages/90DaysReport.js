import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";

function NotificationCard({ color, title, description }) {
  return (
    <div className={`notification-card ${color}`}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ); 
}

const Button = styled.button`
  background-color: ${props => theme[props.theme && theme[props.theme] ? props.theme : 'blue'].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 10px auto; /* 上下のマージンを指定し、左右のマージンを自動に設定して中央揃え */
  cursor: pointer;
  transition: ease background-color 250ms;
  width: 50%; /* 横幅を50%に指定 */
  display: block; /* ブロック要素として表示 */
  &:hover {
    background-color: ${props => theme[props.theme && theme[props.theme] ? props.theme : 'blue'].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593",
  },
  pink: {
    default: "#e91e63",
    hover: "#ad1457",
  },
};


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

// function ExplainCard({ title, description}) {
//   return (
//     <div className="service-card">
//       <h3>{title}</h3>
//       <p>{description}</p>
//     </div>
//   );
// }

function Report({studentId}) {
  const [students, setStudents] = useState([]);
  const [reportDate, setreportDate] = useState('');
  const [reportStatus, setReportStatus] = useState(false);
  const [userData, setUserData] = useState(null);

  let navigate = useNavigate();

  function handleClick(path) {
    navigate(path);
  }

  const plans = [
    
    {
      className: 'pack-1',
      action: '90 days report',
      title: 'Action',
      advantages: [
        'Step 1: Bring passport to immigration office',
        'Step 2: Submit passport to officer',,
        'Step 3: Update your profile in this system'
      ],
      duration: 'month',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Steps for 90 days report',
    },
    
    {
      className: 'pack-2',
      action: '90 days service',
      title: 'Service',
      advantages: [
        '150 coins earned by IAC activity',
        'IAC submit report for you',
      ],
      duration: 'month',
      highlightText: 'Paid',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Join IAC activity and earn coins for visa service',
    },
  ];


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

          const userResponse = await axios.get(`http://127.0.0.1:8000/api/user/${studentId}/`);
          const userData = userResponse.data; // userDataを新たに取得
          setUserData(userData);
          // setVisaExtensionStatus(userData.visa_extension_status); // ここでステータスを設定
          setReportStatus(userData.report_status);

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
          color={reportStatus ? "green" : "lighblue"} // report が True なら緑、False なら赤
          title={`Next 90 days report in ${reportDate} days`}
          description={reportStatus ? "IAC will submit the report for you" : "Submit 90 days by yourself"}
        />
      </div>
      <section className="pricing-section">
        <div className="card-wrapper">
          {plans.map((plan, index) => (
            <div className="card" key={index}>
              {plan.highlightText && <div className="popular">{plan.highlightText}</div>}
              {/* <br></br> */}
              <h3 className="title">{plan.title}</h3>
              <div className="action">{plan.action}</div>
              <br></br>
              <p className="duration">{plan.titleDescription}</p>
              <br></br>
              <ul className="advantages">
                {plan.advantages.map((advantage, idx) => (
                  <li key={idx}>✔ {advantage}</li>
                ))}
              </ul>
              <br></br>
              { (
                <Button
                 onClick={() => {
                    let newPath = "";
                    if (plan.title === "Service"){
                      newPath = "/token";
                    } else {
                      newPath = "/van_reservation";
                    }
                    handleClick(newPath);
                  }}
                >
                  {plan.title === "Service" ? "next" : "reseve a van"}
                </Button>
              )}
            </div>
            
          ))}
        </div>
      <br></br>
    </section>
      {/* <div className="service-row">
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
       </div>   */}
      </div>  
  );
}

export default Report;
