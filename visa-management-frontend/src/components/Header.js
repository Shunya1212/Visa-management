import React from 'react'
import logo from "../images/logo2png.png";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ student, onLogout}) => {
    console.log(student)
  return (
    <div className='Header flex justify-between items-center px-4 py-2 bg-cyan-500'>
        <div className='flex items-center'>
        <AccountCircleIcon />
            <span className='username ml-2'>{student}</span> {/* ユーザー名を表示 */}
            <button onClick={onLogout} className="logout-button ml-4">
                Logout
            </button></div> 
    </div>
  )
}

export const HeaderData = [
    {
        title: "6430613024",
        icon:  <AccountCircleIcon />,
        link: "/update_profile",
    },
]
export default Header