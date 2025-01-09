import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
// import styled from "styled-components";
// import axios from 'axios';
import Popup from '../popups/Popup';

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

function Home({ studentId }) {
  const [students, setStudents] = useState([{}]);
  const [visaExpireDate, setVisaExpireDate] = useState('');
  const [userData, setUserData] = useState(null);
  const [reportDate, setReportDate] = useState('');
  const [visaExtensionStatus, setVisaExtensionStatus] = useState(false); // visa_extensionのステータスを保持
  const [reportStatus, setReportStatus] = useState(false);
  // const [path, setPath] = useState("")
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('');
  const [popupRedirectPath, setPopupRedirectPath] = useState('');

  const handlePopupClose = () => {
    setShowPopup(false); // ポップアップを非表示にする
  };

  // const path = ""
  let navigate = useNavigate();

  function handleClick(path) {
    navigate(path);
  }

  const plans = [
    {
      className: 'pack-1',
      action: 'Visa',
      title: 'Action 1',
      advantages: [
        'Download filled the form',
        'Request visa letter',
      ],
      duration: 'month',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Click next button for visa extension',
    },
    {
      className: 'pack-2',
      action: '90 days',
      title: 'Action 2',
      advantages: [
        'Steps to submit report',
        'Pay to ask IAC to do instead of you',
      ],
      duration: 'month',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Click next button for 90 days report',
    },
    {
      className: 'pack-3',
      action: 'Visa service',
      title: 'Service 1',
      advantages: [
        '50 coins earned by IAC activity',
        'IAC extends visa for you',
      ],
      duration: 'month',
      highlightText: 'Paid',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Join IAC activity and earn coins for visa service',
    },
    {
      className: 'pack-4',
      action: '90 service',
      title: 'Service 2',
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
    const accountNumber = '6430613024';
    if (studentId) { // studentIdが空でないことを確認
      const fetchStudentInfo = async () => {
        try {
          // 学生情報の取得
          const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
          setStudents(response.data);
          const visaExpiryDate = new Date(response.data[0].visa_expire_date);
          const reportDate = new Date(response.data[0].report_90_days_date);

          const today = new Date();
          const differenceInTime = visaExpiryDate.getTime() - today.getTime();
          const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
          setVisaExpireDate(differenceInDays);

          const differenceInTime1 = reportDate.getTime() - today.getTime();
          const differenceInDays1 = Math.ceil(differenceInTime1 / (1000 * 3600 * 24));
          setReportDate(differenceInDays1);

          console.log(response.data);

          const hasEmptyFields = Object.entries(response.data[0]).some(([key, value]) => {
            // middle_name は空欄でも許可
            if (key === 'middle_name') return false;
            
            // 他のフィールドの空欄チェック
            return value === null || value === undefined || value === '';
          });
  
          if (hasEmptyFields) {
            // ポップアップを表示する
            // alert('Complete profile'); // ここをモーダル表示などに置き換え可能
            setPopupMessage('Complete your profile.');
            setPopupButtonText('Next');
            setPopupRedirectPath('/update_profile/');
            setShowPopup(true);
          }
          
          // ユーザー情報の取得
          const userResponse = await axios.get(`http://127.0.0.1:8000/api/user/${studentId}/`);
          const userData = userResponse.data; // userDataを新たに取得
          setUserData(userData);
          setVisaExtensionStatus(userData.visa_extension_status); // ここでステータスを設定
          setReportStatus(userData.report_status);
        } catch (error) {
          console.error('Error fetching student info:', error);
          // エラー処理を適宜実装してください
        }
      };

      fetchStudentInfo(); // 非同期関数の実行
    }
  }, [studentId]);

  if (!userData) {
    return <div>Loading...</div>; // userDataがロードされるまでローディング表示
  }

  return (
    <div className="ContentArea">
      <div className="notification-row">
        <NotificationCard
          color={visaExtensionStatus ? "green" : "lighblue"} // visa_extension が True なら緑、False なら赤
          title={`Visa expire in ${visaExpireDate} days`}
          description={visaExtensionStatus ? "IAC will extend visa for you" : "Extend by yourself"}
        />
        <NotificationCard
          color={reportStatus ? "green" : "lighblue"} // report が True なら緑、False なら赤
          title={`Next 90 days report in ${reportDate} days`}
          description={reportStatus ? "IAC will submit the report for you" : "Submit 90 days by yourself"}
        />
      </div>

      <section className="pricing-section">
        <div className="card-wrapper2">
          {plans.map((plan, index) => (
            <div className="card2" key={index}>
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
              <Button
                 onClick={() => {
                  let newPath = "";
                      if (plan.title === "Action 1") {
                        newPath = "/visa_extension";
                      } else if (plan.title === "Action 2") {
                        newPath = "/90_days_report";
                      } else if (plan.title === "Service 1" || plan.title === "Service 2") {
                        newPath = "/token";
                      }
                      handleClick(newPath);
                }
              }
              >
                {plan.title === "Step 2" ? "next" : "Next"}
              </Button>
            </div>
            
          ))}
        </div>
      <br></br>

    </section>
      {/* <div className="service-row">
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
      </div> */}
    {showPopup && <Popup 
    message={popupMessage} // 動的なメッセージ
    buttonText={popupButtonText} // 動的なボタンテキスト
    redirectPath={popupRedirectPath} // 動的な遷移パス
    onClose={handlePopupClose}
    />}
    </div>
  );
}

export default Home;
