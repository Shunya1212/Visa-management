import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Popup from '../popups/Popup';
// import Token_FailPopup from '../popups/Token_FailPopup';

function Token({studentId}) {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);  // ローディング状態を追跡
  const accountNumber = '61214255164641';  // テスト用アカウント番号
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('');
  const [popupRedirectPath, setPopupRedirectPath] = useState('');
  
  const handlePopupClose = () => {
    setShowPopup(false); // ポップアップを非表示にする
  };
  
  const fetchTransaction = async () => {
    try {
      // ユーザー情報の取得
      const userResponse = await axios.get(`http://127.0.0.1:8000/api/user/${studentId}/`);
      setUserData(userResponse.data);
      console.log(userData)
      console.log(studentId)
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    try {
      // 取引履歴の取得
      // const transactionResponse = await axios.get(`http://127.0.0.1:8000/api/user/${studentId}/transactions`);
      const transactionResponse = await axios.get(`http://127.0.0.1:8000/transactions/${studentId}/`);
      setTransactions(transactionResponse.data);
      console.log("saved transaction data: ", transactions[0])
      console.log("returned transaction data:", transactionResponse.data)
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);  // データ取得後にローディングを終了
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);  // 空の依存配列で一度だけ実行

  const PayToken = async (amount) => {
      try {
        const response = await axios.post(`http://127.0.0.1:8000/api/user/${studentId}/paytoken/`, {
          amount: amount, // 削除するトークンの量を指定
        });
        console.log('Payment successful:', response.data);
        setPopupMessage('Payment was successful!');
        setPopupButtonText('Back to Home');
        setPopupRedirectPath('/home');
        setShowPopup(true);
        fetchTransaction();  // トランザクションの更新
      } catch (error) {
        console.error('Payment failed:', error);
        setPopupMessage('Payment was failed, check your balance.');
        setPopupButtonText('Close');
        setPopupRedirectPath('');
        setShowPopup(true);
      }
  }

  const handleVisaExtensionPayment = async () => {
    if (userData?.visa_extension_status) {
      setPopupMessage('You already paid for this service');
      setPopupButtonText('Close');
      setPopupRedirectPath('');
      setShowPopup(true);
    } else {
      
      PayToken(50);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/extension_token_email/${studentId}/`);
        const data = response.data;
        console.log(data); // 予約成功の応答を確認
      } catch (error) {
        console.error('Extension token email failed:', error);
        console.log(studentId)
        // alert('Reservation email failed to sent. Please try again.');
      }
    }
  };

  // 90日レポートの支払いボタンのクリック処理
  const handle90DaysReportPayment = async () => {
    if (userData?.report_status) {
      setPopupMessage('You already paid for this service');
      setPopupButtonText('Close');
      setPopupRedirectPath('');
      setShowPopup(true);
    } else {
       
      PayToken(150);
    try {
        const response = await axios.get(`http://127.0.0.1:8000/90days_token_email/${studentId}/`);
        const data = response.data;
        console.log(data); // 予約成功の応答を確認
      } catch (error) {
        console.error('90days token email failed:', error);
        // alert('Reservation email failed to sent. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ContentArea">
    <div className='form-section'>
      <div className="account-section">
        <div className="account-header">
          <p className="account-label">Current</p>
          <p className="account-number">Account No: {userData.account_number}</p>
        </div>
        <div className="balance">
          <p>{userData.balance} IAC coin</p>
        </div>
      </div>

      <div className="transaction-section">
        <h4>Transaction History</h4>
        <ul className="transactions-list">
          {transactions.map((transaction, index) => {
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
            
            // Payneeの名前設定
            const paynee = transaction.is_deposit ? `${userData.name}`:'IAC';
            const payer = transaction.is_deposit ? 'IAC' : `${userData.name}`;
            return (
              <li key={index} className="transaction-item">
                <div className="transaction-row">
                  <span className="transaction-date">{formattedDate}</span>
                  <span className="transaction-from">From: {payer}</span>
                  <span className="transaction-to">To: {paynee}</span>
                  <span className="transaction-service">Service: {transaction.service}</span>
                  <span className={`transaction-amount ${transaction.is_deposit ? 'positive' : 'negative'}`}>
                    {transaction.is_deposit ? `+ ${transaction.amount} coins` : `- ${transaction.amount} coins`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
    <div className="actions">
        <button onClick={handleVisaExtensionPayment}>
          Pay 50 coins for Visa Extension
        </button>
        <button onClick={handle90DaysReportPayment}>
          Pay 150 coins for 90 days Report
        </button>
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

export default Token;
