import './App.css';
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import Header from "./components/Header"
import Frontbar from "./components/frontbar/Frontbar"
import Sidebar from "./components/Sidebar"
import Login from "./components/pages/Login"
import Home from "./components/pages/Home"
import VisaExtension from "./components/pages/VisaExtension"
import AfterVisaExtension from "./components/pages/AfterVisaExtension"
import Report from "./components/pages/90DaysReport"
import Profile from "./components/pages/Profile"
import VanReservation from "./components/pages/VanReservation"
import AfterVanReservation from "./components/pages/AfterVanReservation"
import Token from "./components/pages/Token"
import NotFound from "./components/pages/NotFound"
// import Default from "./components/pages/Default"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {v4 as uuid4} from "uuid";

function App() {  
  const [username, setUsername] = useState('');
  // const [fullname, setfullname] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudent_id] = useState( localStorage.getItem('student_id') || '');
  const [login, setLogin] = useState(false);
  const [students, setStudents] = useState([]);
  // const navigate = useNavigate();

  // const handleSubmit = (event) => {
  //   event.preventDefault(); // フォームのデフォルトの送信を防止
  //   axios.post('http://127.0.0.1:8000/login/', { username, password })
  //     .then(response => {
  //       // ログイン成功時の処理
  //       console.log('Login now ssuccessful', response.data);
  //       localStorage.setItem('isLoggedIn', 'true');
  //       setLogin(true);
  //     })
  //     .catch(error => {
  //       // ログイン失敗時の処理
  //       console.error('Login failed', error);
  //     });
  //   // ここでログインロジックを実装（例：APIへのPOSTリクエスト）
  // };

  // const handleSubmit = async (error) => {
  //   error.preventDefault();
  //   try {
  //     const response = await axios.post('http://127.0.0.1:8000/login/', { username, password });
  //     console.log(response)
  //     if (response.data.success) {
  //       // ログイン成功の処理
  //       console.log('Login now ssuccessful', response.data);
  //       localStorage.setItem('isLoggedIn', 'true');
  //       setLogin(true);
  //     } else {
  //       // ログイン失敗の処理
  //       console.error('Login failed', error);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.status === 200) {
        // alert('Login successful');
        console.log('Login now ssuccessful', data);
        // console.log('std id', response.data.student_id);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.username); // 仮にユーザーネームはこのように応答に含まれると仮定
        localStorage.setItem('student_id', data.student_id);
        setUsername(data.username);
        setLogin(true);
        setStudent_id(data.student_id)
        // console.log(studentId)
    } else {
        alert(data.message);
    }
};

  // ログイン状態を確認し、更新するための副作用フック
  useEffect(() => {
    const isLogged = localStorage.getItem('isLoggedIn');
    if (isLogged === 'true') {
      setLogin(true);
      console.log(username)
    }
  }, []);

  // useEffect(() => {
  //   axios.get('http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}')
  //     .then(response => {
  //       setStudents(response.data);
        
  //     })
  //     .catch(error => console.error(error));
  // }, []);

  useEffect(() => {
    if (studentId) { // studentIdが空でないことを確認
      const fetchStudentInfo = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
          setStudents(response.data);
        } catch (error) {
          console.error('Error fetching student info:', error);
          // エラー処理を適宜実装してください
        }
      };

      fetchStudentInfo();
    }
  }, [studentId]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username'); // ユーザーネームも削除
    localStorage.removeItem('student_id');
    setUsername(''); // ローカルストレージからログイン情報を削除
    setLogin(false);
    setStudent_id('');
  };

  return (  
    <div className="App h-screen w-full"> {/* 画面全体をカバー */}
    {!login ? (
      <>
    <Header />
    <div className='ContentAreaLogin w-full'>
      <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label">
          User Name:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div className="form-field">
        <label className="form-label">
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </label>
      </div>

      <div className="form-actions">
      <button type="submit">Login</button>
      </div>

      {/* <div>
      {students.map(student => (
        <div key={student.id}>{student.first_name}{student.student_id} {student.last_name} {student.passport_number}</div>
      ))}
    </div> */}
      
    </form>
  </div>
  </>
  ) : (
    <>
    <Header student={students.map(student => (
        <div key={student.id}>{student.student_id}</div>
      ))} onLogout={handleLogout}/>
    <div className='flex flex-row w-full'>
    <Sidebar student_name={students.map(student => (
        <div key={student.id}>{student.first_name} {student.last_name}</div>
      ))} student_id={students.map(student => (
        <div key={student.id}>{student.student_id}</div>
      ))} />
      <div className='flex flex-col w-4/5'>  
        <BrowserRouter>
        <Frontbar />
            <Routes>
              {/* <Route path={`/`} element={<Default/>} /> */}
              <Route path={`/Login/`} element={<Login/>} /> 
              <Route path={`/home/`} element={<Home studentId={studentId}/>} />
              <Route path={`/visa_extension/`} element={<VisaExtension studentId={studentId}/>} />
              <Route path={`/visa_extension/visa_extension_status/`} element={<AfterVisaExtension studentId={studentId} />} />
              <Route path={`/90_days_report/`} element={<Report studentId={studentId}/>} />
              <Route path={`/update_profile/`} element={<Profile studentId={studentId}/>} />
              <Route path={`/van_reservation/`} element={<VanReservation studentId={studentId}/>} />
              <Route path={`/van_reservation/van_reservation_status`} element={<AfterVanReservation studentId={studentId}/>} />
              <Route path={`/token/`} element={<Token />} />
              <Route path={`/*/`} element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </div>
    </div>
    </>
  )}
  </div>
  );
}

export default App;
