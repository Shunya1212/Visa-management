import React from 'react';
import { useNavigate } from 'react-router-dom';

const Popup = ({ message, buttonText, redirectPath, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (redirectPath && redirectPath !== '') {
      navigate(redirectPath); // 指定されたパスに遷移
    } else if (onClose) {
      onClose(); // 遷移しない場合、外部から提供された閉じる処理を実行
    }
  };

  return (
    <div className="popup-overlay">
      <div className="Popup">
        <p>{message}</p> {/* メッセージを動的に表示 */}
        <button onClick={handleClose}>{buttonText}</button> {/* ボタンテキストを動的に表示 */}
      </div>
    </div>
  );
};

export default Popup;
