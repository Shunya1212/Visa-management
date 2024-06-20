import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import GradingIcon from '@mui/icons-material/Grading';
import ApprovalIcon from '@mui/icons-material/Approval';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import TokenIcon from '@mui/icons-material/Token';

export const SidebarData = [
    {
        title: "Home",
        icon:  <HomeIcon />,
        link: "/home",
    },
    {
        title: "Visa Extension",
        icon:  <GradingIcon />,
        link: "/visa_extension",
    },
    {
        title: "90 Days Report",
        icon:  <ApprovalIcon />,
        link: "/90_days_report",
    },
    {
        title: "Update Profile",
        icon:  <AccountCircleIcon />,
        link: "/update_profile",
    },
    {
        title: "Van Reservation",
        icon:  <AirportShuttleIcon />,
        link: "/van_reservation",
    },
    {
        title: "Token",
        icon:  <TokenIcon />,
        link: "/token",
    },
]