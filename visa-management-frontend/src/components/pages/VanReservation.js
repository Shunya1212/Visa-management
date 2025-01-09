import React ,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios'; 
import Popup from '../popups/Popup';

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
  background-color: ${props =>
    theme[props.theme && theme[props.theme] ? props.theme : 'blue'].default};
  color: white;
  padding: 3px 10px; /* 内側の余白を小さく設定 */
  border-radius: 4px; /* 角丸を少し減らす */
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 5px auto; /* マージンを小さく */
  cursor: pointer;
  transition: ease background-color 250ms;
  width: 15%; /* 横幅を小さく設定 */
  font-size: 1.0rem; /* フォントサイズを小さく */
  display: block; /* ブロック要素として表示 */
  &:hover {
    background-color: ${props =>
      theme[props.theme && theme[props.theme] ? props.theme : 'blue'].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

function VanReservation({studentId}) {
const navigate = useNavigate(); 
  
const [selectedDate, setSelectedDate] = useState(null);
const [reservableDates, setReservableDates] = useState([{ date: null, is_reservable: false }]);
const [events, setEvents] = useState([]);
const [eventState, seteventState] = useState("Available");
const [isButtonDisabled, setIsButtonDisabled] = useState(false);

const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState('');
const [popupButtonText, setPopupButtonText] = useState('');
const [popupRedirectPath, setPopupRedirectPath] = useState('');
  
  const handlePopupClose = () => {
    setShowPopup(false); // ポップアップを非表示にする
  };

useEffect(() => {
  axios.get('http://127.0.0.1:8000/Reservable_dates/')
    .then(response => {
        const availableEvents = response.data.filter(dateObj => dateObj.is_reservable).map(dateObj => ({
        title: eventState,
        start: dateObj.date,
        color: 'green', // 予約可能な日付の色を指定
        textColor: eventState === 'Available' ? 'black' : 'red',
        display: 'background' // 背景色として表示
      }));
      setReservableDates(response.data);
      setEvents(prevEvents => {
        // 既存の選択されたイベントを保持しつつ、新しい予約可能イベントを追加
        return [...prevEvents.filter(event => event.title === 'Selected'), ...availableEvents];
      });
    })
    .catch(error => console.log('Error fetching reservable dates:', error));
}, []);

const dayCellClassNames = (arg) => {
  const argDate = new Date(arg.dateStr).setHours(0, 0, 0, 0); // 日付の比較のため時間を除去
  const isDateReservable = reservableDates.some(dateObj => {
    const reservableDate = new Date(dateObj.date).setHours(0, 0, 0, 0);
    return reservableDate === argDate && dateObj.is_reservable;
  });
  console.log(isDateReservable)
  // return isDateReservable ? "reservable-date" : "non-reservable-date"; // 予約可能な日付だけ `reservable-date`、それ以外は `non-reservable-date` を適用
};

const handleDateClick = (arg) => {
  const isDateReservable = reservableDates.some(dateObj => dateObj.date === arg.dateStr && dateObj.is_reservable);
  if (isDateReservable) {
    setSelectedDate(arg.dateStr);
    // 選択された日付のイベントを更新
    setEvents(prevEvents => {
      return [
        ...prevEvents.filter(event => event.title === eventState), // 予約可能イベントを保持
        {
          title: 'Selected',
          start: arg.dateStr,
          color: 'green',
          classNames: ['selected-event'] // ここでカスタムクラスを適用
        }
      ];
    });
  } else {
    // alert('This date is not reservable. Please choose another date.');
    setPopupMessage('This date is not reservable. Please choose another date.');
    setPopupButtonText('Close');
    setPopupRedirectPath('');
    setShowPopup(true);
  }
};


// "Reserve" ボタンがクリックされたときの処理
const handleReserveClick = async () => {

  const Student_response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
      const studentData = Student_response.data[0];

      const visaExpireDateString = studentData.visa_expire_date;
      const reportDateString = studentData.report_90_days_date;

      const visa_expire_date = new Date(Date.parse(visaExpireDateString));
      const report_90_days_date = new Date(Date.parse(reportDateString))
      
      const currentDate = new Date();
      const VisadaysDifference = Math.floor((visa_expire_date - currentDate) / (1000 * 3600 * 24));
      const ReportdaysDifference = Math.floor((report_90_days_date - currentDate) / (1000 * 3600 * 24));

      if (VisadaysDifference > 30 && ReportdaysDifference > 7) {
        // alert("Too early to apply, try again before 30 days of visa expire date or 7 days of 90 days report date");
        setPopupMessage('Too early to apply, try again before 30 days of visa expire date or 7 days of 90 days report date');
        setPopupButtonText('Close');
        setPopupRedirectPath('');
        setShowPopup(true);
        setIsButtonDisabled(true); // ボタンを無効化
        return;
      }

  const student_id =  studentId
  if (selectedDate) {
    console.log(studentId)
    // 選択された日付で何かをする
    try {
      const response = await fetch('http://127.0.0.1:8000/create_reservation/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate, student: studentId }),
    });

    if (!response.ok) {
      // サーバーからエラーが返された場合
      const errorData = await response.json();
      console.error('Reservation error:', errorData.error);
      // alert(`Reservation failed: ${errorData.error}`);
      setPopupMessage('Reservation faild, Check your email you already requested!');
      setPopupButtonText('Close');
      setPopupRedirectPath('');
      setShowPopup(true);
      return;
    }
      const data = await response.json();
      console.log(data); // 予約成功の応答を確認
      // alert('Reservation successful!');
      setPopupMessage('Reservation successful!');
      setPopupButtonText('Next');
      setPopupRedirectPath('van_reservation_status');
      setShowPopup(true);
      // navigate('van_reservation_status'); // 成功した後のナビゲーション

      try {
        const response = await axios.get(`http://127.0.0.1:8000/reservation_email/${studentId}/`);
        const data = response.data;
        console.log(data); // 予約成功の応答を確認
      } catch (error) {
        console.error('Reservation email failed:', error);
        // alert('Reservation email failed to sent. Please try again.');
      }

    } catch (error) {
      console.error('Reservation failed:', error);
      // alert('Reservation failed. Please try again.');
      setPopupMessage('Reservation failed. Please try again.');
      setPopupButtonText('Close');
      setPopupRedirectPath('');
      setShowPopup(true);
    }
  } else {
    // alert('Please select a date first.');
    setPopupMessage('Please select a date first.');
    setPopupButtonText('Close');
    setPopupRedirectPath('');
    setShowPopup(true);
  }
};

  return (
    <div className='ContentArea'>
        <div className='Content-Reservation flex flex-col'>
        {"Van reservation"}
        <div className='calendar-container'>
        <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" dateClick={handleDateClick} dayCellClassNames={dayCellClassNames} events={events}/>
        </div>
        <Button  variant="contained" color="success" onClick={handleReserveClick}>Reserve</Button>
        </div>
        {showPopup && <Popup 
    message={popupMessage} // 動的なメッセージ
    buttonText={popupButtonText} // 動的なボタンテキスト
    redirectPath={popupRedirectPath} // 動的な遷移パス
    onClose={handlePopupClose}
    />}
    </div>
  );
}

export default VanReservation;
