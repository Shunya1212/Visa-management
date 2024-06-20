import React from 'react'
import { SidebarData } from './SidebarData'

function Sidebar({ student_name, student_id}) {
  return (
    <div className="Sidebar w-64 flex-shrink-0">
        <ul className="SidebarList">
        <li className="row_info" ><strong>{"Profile"}</strong></li>
        <li className="row_info" >{student_id}</li>
        <li className="row_info" >{student_name}</li>
        <li className="row_info" >{"PSU"}</li>
        <li className="row_info" >{"------------------------------"}</li>
           {SidebarData.map((value, key) => {
            return (
                <li key={key} 
                    id={window.location.pathname == value.link ? "active" : ""}
                    className="row" 
                    onClick={() => {
                    window.location.pathname = value.link
                }}>
                <div id="icon">{value.icon}</div>
                <div id="title">{value.title}</div>
                </li>
            )
           })}
           <li className="row_info" >{"------------------------------"}</li>
           <li className="row_info" ><strong>{"Contact IAC"}</strong></li>
           <li className="row_info" >{"Telephone" }</li>
           <li className="row_info" >{"Email" }</li>
           <li className="row_info" >{"7 building 2nd floor"}</li>
        </ul>

    </div>
  )
}

export default Sidebar