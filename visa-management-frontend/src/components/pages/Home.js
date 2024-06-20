import React, {useState, useEffect} from 'react';
import axios from 'axios';
// import './Home.css'; // スタイルシートをインポート
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

function Home({studentId}) {
  const [students, setStudents] = useState([]);
  const [visaExpireDate, setVisaExpireDate] = useState('');
  const [reportDate, setreportDate] = useState('');
  useEffect(() => {
    if (studentId) { // studentIdが空でないことを確認
      const fetchStudentInfo = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
          setStudents(response.data);
          const visaExpiryDate = new Date(response.data[0].visa_expire_date);
          const ReportDate = new Date(response.data[0].report_90_days_date);

          const today = new Date();
          const differenceInTime = visaExpiryDate.getTime() - today.getTime();
          const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
          setVisaExpireDate(differenceInDays);

          
          const differenceInTime1 = ReportDate.getTime() - today.getTime();
          const differenceInDays1 = Math.ceil(differenceInTime1 / (1000 * 3600 * 24));
          setreportDate(differenceInDays1);

          console.log(students)
        } catch (error) {
          console.error('Error fetching student info:', error);
          // エラー処理を適宜実装してください
        }
      };

      fetchStudentInfo();
    }
  }, [studentId]);

  return (
    <div className="ContentArea">

      <div className="notification-row">
        <NotificationCard
          color="blue"
          title={`Visa expire in ${visaExpireDate} days`}
          description="Must go to receive a passport by yourself"
        />
        <NotificationCard
          color="green"
          // title="Next 90 days report in 90 days"
          title={`Next 90 days report in ${reportDate} days`}
          description="IAC will submit the report for you"
        />
      </div>
      <div className="service-row">
        <ServiceCard
          title="Visa Extension"
          description="If you need to extend your visa, click the below button"
          path="/visa_extension"
        />
        <ServiceCard
          title="90 days report"
          description="If you need to report your 90 days, click the below button"
          path="/90_days_report"
        />
        <ServiceCard
          title="Update Profile"
          description="If you need to update your profile, click the below button"
          path="/update_profile"
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

export default Home;
