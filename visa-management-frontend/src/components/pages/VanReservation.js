import React ,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios'; 

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
  width: 20%; /* 横幅を50%に指定 */
  display: block; /* ブロック要素として表示 */
  &:hover {
    background-color: ${props => theme[props.theme && theme[props.theme] ? props.theme : 'blue'].hover};
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
    alert('This date is not reservable. Please choose another date.');
  }
};


// "Reserve" ボタンがクリックされたときの処理
const handleReserveClick = async () => {

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
        body: JSON.stringify({ selectedDate, studentId }),
    });
      const data = await response.json();
      console.log(data); // 予約成功の応答を確認
      alert('Reservation successful!');
      navigate('van_reservation_status'); // 成功した後のナビゲーション
    } catch (error) {
      console.error('Reservation failed:', error);
      alert('Reservation failed. Please try again.');
    }
  } else {
    // ユーザーに日付を選択させる
    alert('Please select a date first.');
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
    </div>
  );
}

export default VanReservation;
