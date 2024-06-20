import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function Frontbar() {
  const location = useLocation();

  let content;
  let breadcrumb;
  switch (location.pathname) {
    case '/visa_extension':
      content = <h1>Visa Extension</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/visa_extension" className="link-style">  Visa Extension</Link>
        </div>
      );
      break;

    case '/visa_extension/visa_extension_status':
      content = <h1>Visa Extension Status</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/visa_extension" className="link-style">  Visa Extension </Link>/<Link to="/visa_extension_status" className="link-style">  Visa Extension Status</Link>
        </div>
      );
      break;      
    case '/90_days_report':
      content = <h1>90 Days Report</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/90_days_report" className="link-style"> 90 Days Report</Link>
        </div>
      );
      break;
      
    case '/update_profile':
      content = <h1>Update Profile</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/home" className="link-style"> Update Profile</Link>
        </div>
      );
      break;

    case '/van_reservation':
      content = <h1>Van Reservation</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/van_reservation" className="link-style"> Van Reservation</Link>
        </div>
      );
      break;
    case '/van_reservation/van_reservation_status':
      content = <h1>Van Reservation Status</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/van_reservation" className="link-style">  Van Reservation </Link>/<Link to="/van_reservation_status" className="link-style">  Van Reservation Status</Link>
        </div>
      );
      break;  
    case '/token':
      content = <h1>Token</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> /<Link to="/token" className="link-style"> Token</Link>
        </div>
      );
      break;
    default:
      content = <h1>Home</h1>;
      breadcrumb = (
        <div className="breadcrumb">
          <Link to="/home" className="link-style">Home </Link> 
        </div>
      );
  }

  return (
    <div className="Frontbar">
      {breadcrumb}
      {content}
    </div>
  );
}

export default Frontbar;
