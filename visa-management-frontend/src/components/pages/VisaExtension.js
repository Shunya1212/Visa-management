import React from "react";
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import {useState} from 'react'
import styled from "styled-components";
import axios from 'axios';
import Popup from '../popups/Popup';
// import { PricingTable, PricingColumn, PricingButton } from 'react-pricing-table';


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

// const CardWrapper = styled.div`
//   display: flex;
//   justify-content: center; /* 横方向に中央揃え */
//   align-items: center;     /* 縦方向に中央揃え */
//   flex-wrap: wrap;         /* 必要に応じてカードが折り返す */
//   gap: 15%;
//   margin-top: 20px;
// `;

// const Card = styled.div`
//   width: 300px;
//   padding: 20px;
//   border-radius: 10px;
//   border: 2px solid #ddd;
//   background-color: white;
//   box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
//   text-align: center;
//   position: relative;
  
  
  
//   @media (max-width: 768px) {
//     width: 250px; /* モバイルでは幅を小さく */
//   }

//   &:hover {
//     box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
//   }

// .popular {
//   position: absolute;
//   top: 10px;
//   left: 10px;
//   background-color: #ff6347;
//   color: white;
//   padding: 5px 10px;
//   font-size: 14px;
//   font-weight: bold;
//   border-radius: 5px;
// }

// h3 {
//   font-size: 24px;
//   margin-bottom: 15px;
// }

// .action {
//   font-size: 36px;
//   font-weight: bold;
//   color: #3f51b5;
// }

// .duration {
//   font-size: 16px;
//   color: #555;
// }

// .advantages {
//   list-style: none;
//   padding: 0;
//   margin-bottom: 20px;
//   text-align: left;

//   li {
//     margin-bottom: 10px;
//     font-size: 16px;
//   }
// }
// `;

function VisaExtension({studentId}) {
  const navigate = useNavigate(); 
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [students, setStudents] = useState([{}]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('');
  const [popupRedirectPath, setPopupRedirectPath] = useState('');
  
  const handlePopupClose = () => {
    setShowPopup(false); // ポップアップを非表示にする
  };

  const plans = [
    {
      className: 'pack-1',
      action: 'Request visa letter',
      // action: 'Download form',
      title: 'Step 1',
      advantages: [
        'IAC will prepare the letter',
        'Notify in email after issued',
      ],
      duration: 'month',
      // highlightText: 'Popular',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Request IAC to issue the visa extension letter',
    },
    {
      className: 'pack-2',
      action: 'Download visa form',
      title: 'Step 2',
      advantages: [
        'Fields are auto filled',
        'Saved as PDF in your device',
      ],
      duration: 'month',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Download auto-filled form for visa extension',
    },
    {
      className: 'pack-3',
      action: 'Reservation for a van',
      title: 'Step 3',
      advantages: [
        'You can reserve a van free',
        'IAC will bring you to immigration office',
      ],
      duration: 'month',
      guarantee: '14 days money back guarantee',
      titleDescription: 'Reserve a van for visa extension',
    },
  ];
  const handleRequestClick = async () => {
    console.log('Requesting visa extension letter...');

    try {
      const Student_response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
      const studentData = Student_response.data[0];

      const visaExpireDateString = studentData.visa_expire_date;

      const visa_expire_date = new Date(Date.parse(visaExpireDateString));

      // const visa_expire_date = new Date(students.visa_expire_date)
      const currentDate = new Date();
      const daysDifference = Math.floor((visa_expire_date - currentDate) / (1000 * 3600 * 24));

      if (daysDifference > 30) {
        // alert("Too early to apply, try again before 30 days");
        setPopupMessage('Too early to apply, try again before 30 days.');
        setPopupButtonText('Close');
        setPopupRedirectPath('');
        setShowPopup(true);
        setIsButtonDisabled(true); // ボタンを無効化
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/Request_visa_extension/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student: studentId, is_requested: true })
      });

      if (response.ok) {
        // navigate('visa_extension_status');
        setPopupMessage('Requested succesfully, continue to step 2.');
        setPopupButtonText('Close');
        setPopupRedirectPath('');
        setShowPopup(true);
      } else {
        // throw new Error('Request failed with status: ' + response.status);
        const errorData = await response.json();
        console.error('Reservation error:', errorData.error);
        setPopupMessage('Request was failed');
        setPopupButtonText('Close');
        setPopupRedirectPath('');
        setShowPopup(true);
        // navigate('visa_extension_status');
        return;
      }
    } catch (error) {
      console.error('Error sending visa extension request:', error);
    }
  };

  const handleReserveClick = () => {
    navigate('/van_reservation')
  }

  // ダウンロードボタンがクリックされたときに呼ばれる関数
  const handleDownloadClick = (studentId) => {
    // データベースから情報を取得してフォームに自動入力する処理をここに記述
    console.log('Downloading filled form...');
    const url = `http://127.0.0.1:8000/generate_pdf/${studentId}/`; 
    
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((blob) => {
        // ダウンロード用のURLを作成
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'visa_extension_form.pdf'); // ダウンロードするファイルの名前
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link); // DOMからリンクを削除
      })
      .catch((error) => {
        console.error('Download error:', error);
      });
  };

  const renderButtonLabel = (step) => {
    if (step === "Step 1") {
      return "Request";
    } else if (step === "Step 2") {
      return "Download";
    } else if (step === "Step 3") {
      return "Next";
    } else {
      return "Next";
    }
  };

  return (
<div className='ContentArea'>
<section className="pricing-section">
      
        <div className="header">
          <h2>Here is how to prepare for visa extension</h2>
          <br></br>
          {/* <p>Check both boxes and follow the instructions.</p> */}
        </div>

        <div className="card3-wrapper">
          {plans.map((plan, index) => (
            <div className="card3" key={index}>
              {plan.highlightText && <div className="popular">{plan.highlightText}</div>}
              <h3>{plan.title}</h3>
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
                  if (plan.title === "Step 2") {
                    handleDownloadClick(studentId); // Step 2のときにダウンロード処理を実行
                  } else if ((plan.title === "Step 1")){
                    handleRequestClick(); // Step 1のときにリクエスト処理を実行
                  }
                  else if ((plan.title === "Step 3")){
                    handleReserveClick(); // Step 1のときにリクエスト処理を実行
                  }
                }}
              >
                {renderButtonLabel(plan.title)}
              </Button>
            </div>
          ))}
        </div>
      
    </section>
    
    {showPopup && <Popup 
    message={popupMessage} // 動的なメッセージ
    buttonText={popupButtonText} // 動的なボタンテキスト
    redirectPath={popupRedirectPath} // 動的な遷移パス
    onClose={handlePopupClose}
    />}

    </div>
  );
};

export default VisaExtension;

