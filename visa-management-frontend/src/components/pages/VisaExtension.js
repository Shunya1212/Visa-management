import React from 'react';
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
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

function VisaExtension({studentId}) {
  const navigate = useNavigate(); 

  const handleRequestClick = async () => {
    console.log('Requesting visa extension letter...');
    try {
      const response = await fetch('http://127.0.0.1:8000/request_visa_extension/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, isRequested: true })
      });

      if (response.ok) {
        navigate('visa_extension_status');
      } else {
        throw new Error('Request failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Error sending visa extension request:', error);
    }
  };

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

  return (
    <div className='ContentArea'>
      <div className='flex flex-row justify-center gap-16 flex-wrap'>
        <div className='Content-Extension flex flex-col gap-40' style={{ flexBasis: '45%' }}>
        {"Request Visa Extension letter"}
         <div className='Content-Extension-date'>
          {"Click below to request a letter"}
          {/* {"Visa Extension letter is not requested"} */}
        </div>
        <Button onClick={handleRequestClick}>Request</Button>
        </div>

        <div className='Content-Extension flex flex-col gap-40'style={{ flexBasis: '45%' }}>
        {"Download filled forms for Visa Extension"}
        <div className='Content-Extension-date'>
          {"Click below to download filled forms"}
          {/* {"Visa Extension letter is not requested"} */}
        </div>
        <Button  variant="contained" color="success" onClick={() => handleDownloadClick(studentId)}>Download</Button>
        </div>
      </div>
    </div>
  );
};

export default VisaExtension;

