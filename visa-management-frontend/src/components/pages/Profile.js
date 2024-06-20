import React from 'react';
import { useState , useEffect} from 'react';
import UpdateProfilePopup from '../popups/UpdateProfilePopup';
import axios from 'axios';


function Profile({studentId}) {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    // student_id:'',
    birth: '',
    sex: '',
    nationality: '',
    address_no: '',
    road: '',
    tambol: '',
    amphoe: '',
    province: '',
    passportNumber: '',
    visaType: '',
    visa_expire_date: '',
    passportIssueDate: '',
    passportExpireDate: '',
    report_90_days_date: '',
  });

  // useEffect(() => {
  //   // データベースからユーザーデータをフェッチ
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('/path/to/your/api');
  //       setFormData(response.data); // 取得したデータを状態に設定
  //     } catch (error) {
  //       console.error('Fetching data failed:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // const handleUpdateProfile = () =>{
  //   setShowPopup(true);
  //   console.log('Update Profile...');
  // };

  const filterEmptyFields = (data) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '') { // または、value != null や value.trim() !== '' など空でないことをチェック
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFieldDisabled = (fieldName) => {
    if (selectedOption === 'default') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return ![].includes(fieldName);
    }
    else if (selectedOption === 'visa-extension') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return !['visa_expire_date'].includes(fieldName);
    }
    else if (selectedOption === '90-days-report') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return !['report-date'].includes(fieldName);
    }
    else if (selectedOption === 'new-passport') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return !['name', 'sex','nationality','passport','visa_expire_date','passport-issue','passport-expire','report-date'].includes(fieldName);
    }
    else if (selectedOption === 'other') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return !['name', 'sex','nationality','address_no','road','tambol','amphoe','province','passport','visa_expire_date','passport-issue','passport-expire','report-date'].includes(fieldName);
    }
    // 他のオプションではすべてのフィールドが編集可能
    return false;
  };

  const handleUpdateProfile = async () => {
    try {
      const filteredFormData = filterEmptyFields(formData);
      // setFormData({ ...formData, student_id: studentId });
      const response = await axios.patch(`http://127.0.0.1:8000/update_student_info/${studentId}/`, filteredFormData);
      console.log('Profile updated:', response.data);
      setShowPopup(true);
    } catch (error) {
      console.error('Update failed:', error.response?.data);
      // エラーメッセージをアラートで表示する場合
      alert(`Update failed: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  return (
    <div className='ContentArea'>
      <h1>Update Profile</h1>
    <div class="form-section">
      <label for="update-selection">Select your update  </label>
      <select
          className='dropdown'
          id="update-selection"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="default">Please select...</option>
          <option value="visa-extension">Visa Extension</option>
          <option value="90-days-report">90 days report</option>
          <option value="new-passport">New Passport</option>
          <option value="other">Other</option>

        </select>
        {selectedOption && (
          <div className='form-edit flex flex-col'>
          <div className="form-field">
            <label className="form-label">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name (capital letter ex:ALEX JOSES)" disabled={isFieldDisabled('name')} />
          </div>
          <div className="form-field">
            <label className="form-label">Sex</label>
            <select name="sex" value={formData.sex} onChange={handleInputChange} disabled={isFieldDisabled('sex')} >
            <option value="" >Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Femele</option>
          </select> 
          </div>
          <div className="form-field">
            <label className="form-label">Nationality</label>
            <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Nationality" disabled={isFieldDisabled('nationality')} />
          </div> 
          <div className="form-field">
            <label className="form-label">address_no</label>
            <input type="text" name="address_no" value={formData.address_no} onChange={handleInputChange} placeholder="address_no" disabled={isFieldDisabled('address_no')} />
          </div> 
          <div className="form-field">
            <label className="form-label">road</label>
            <input type="text" name="road" value={formData.road} onChange={handleInputChange} placeholder="road" disabled={isFieldDisabled('road')} />
          </div> 
          <div className="form-field">
            <label className="form-label">tambol</label>
            <input type="text" name="tambol" value={formData.tambol} onChange={handleInputChange} placeholder="tambol" disabled={isFieldDisabled('tambol')} />
          </div> 
          <div className="form-field">
            <label className="form-label">amphoe</label>
            <input type="text" name="amphoe" value={formData.amphoe} onChange={handleInputChange} placeholder="amphoe" disabled={isFieldDisabled('amphoe')} />
          </div> 
          <div className="form-field">
            <label className="form-label">province</label>
            <input type="text" name="province" value={formData.province} onChange={handleInputChange} placeholder="province" disabled={isFieldDisabled('province')} />
          </div> 
          <div className="form-field">
            <label className="form-label">Passport No</label>
            <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} placeholder="Passport No" disabled={isFieldDisabled('passport')} />
          </div> 
          {/* <div className="form-field">
            <label className="form-label">Visa Type</label>
            <select name="visaType" value={formData.visaType} onChange={handleInputChange} disabled={isFieldDisabled('visa-type')} >
            <option value="" >Select Visa Type</option>
            <option value="education">Non-O Education Visa</option>
            <option value="family">Non-O Family Visa</option>
            <option value="business">Non-B Business Visa</option>
            <option value="other">Other Visa</option>
          </select>
          </div>  */}
          <div className="form-field">
            <label className="form-label">Visa Expire Date</label>
            <input className="form-input" type="date" name="visa_expire_date" value={formData.visa_expire_date} onChange={handleInputChange} disabled={isFieldDisabled('visa_expire_date')} />
          </div>
          <div className="form-field">
            <label className="form-label">Passport Issue Date</label>
            <input className="form-input" type="date" name="passportIssueDate" value={formData.passportIssueDate} onChange={handleInputChange} disabled={isFieldDisabled('passport-issue')} />
          </div>
          <div className="form-field">
            <label className="form-label">Passport Expire Date</label>
            <input className="form-input" type="date" name="passportExpireDate" value={formData.passportExpireDate} onChange={handleInputChange} disabled={isFieldDisabled('passport-expire')} />
          </div>
          <div className="form-field">
            <label className="form-label">90 days report Date</label>
            <input className="form-input" type="date" name="report_90_days_date" value={formData.report_90_days_date} onChange={handleInputChange} disabled={isFieldDisabled('report-date')} />
          </div>
        </div>
        )}

        {!selectedOption && (
          <div className='form-edit flex flex-col'>
          <div className="form-field">
            <label className="form-label">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name (capital letter ex:ALEX JOSES)" disabled={isFieldDisabled('name')} />
          </div>
          <div className="form-field">
            <label className="form-label">Sex</label>
            <select name="sex" value={formData.sex} onChange={handleInputChange} disabled={isFieldDisabled('sex')} >
            <option value="" >Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Femele</option>
          </select> 
          </div>
          <div className="form-field">
            <label className="form-label">Nationality</label>
            <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} placeholder="Nationality" disabled={isFieldDisabled('nationality')} />
          </div> 
          <div className="form-field">
            <label className="form-label">address_no</label>
            <input type="text" name="address_no" value={formData.address_no} onChange={handleInputChange} placeholder="address_no" disabled={isFieldDisabled('address_no')} />
          </div> 
          <div className="form-field">
            <label className="form-label">road</label>
            <input type="text" name="road" value={formData.road} onChange={handleInputChange} placeholder="road" disabled={isFieldDisabled('road')} />
          </div> 
          <div className="form-field">
            <label className="form-label">tambol</label>
            <input type="text" name="tambol" value={formData.tambol} onChange={handleInputChange} placeholder="tambol" disabled={isFieldDisabled('tambol')} />
          </div> 
          <div className="form-field">
            <label className="form-label">amphoe</label>
            <input type="text" name="amphoe" value={formData.amphoe} onChange={handleInputChange} placeholder="amphoe" disabled={isFieldDisabled('amphoe')} />
          </div> 
          <div className="form-field">
            <label className="form-label">province</label>
            <input type="text" name="province" value={formData.province} onChange={handleInputChange} placeholder="province" disabled={isFieldDisabled('province')} />
          </div> 
          <div className="form-field">
            <label className="form-label">Passport No</label>
            <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} placeholder="Passport No" disabled={isFieldDisabled('passport')} />
          </div> 
          {/* <div className="form-field">
            <label className="form-label">Visa Type</label>
            <select name="visaType" value={formData.visaType} onChange={handleInputChange} disabled={isFieldDisabled('visa-type')} >
            <option value="" >Select Visa Type</option>
            <option value="education">Non-O Education Visa</option>
            <option value="family">Non-O Family Visa</option>
            <option value="business">Non-B Business Visa</option>
            <option value="other">Other Visa</option>
          </select>
          </div>  */}
          <div className="form-field">
            <label className="form-label">Visa Expire Date</label>
            <input className="form-input" type="date" name="visa_expire_date" value={formData.visa_expire_date} onChange={handleInputChange} disabled={isFieldDisabled('visa_expire_date')} />
          </div>
          <div className="form-field">
            <label className="form-label">Passport Issue Date</label>
            <input className="form-input" type="date" name="passportIssueDate" value={formData.passportIssueDate} onChange={handleInputChange} disabled={isFieldDisabled('passport-issue')} />
          </div>
          <div className="form-field">
            <label className="form-label">Passport Expire Date</label>
            <input className="form-input" type="date" name="passportExpireDate" value={formData.passportExpireDate} onChange={handleInputChange} disabled={isFieldDisabled('passport-expire')} />
          </div>
          <div className="form-field">
            <label className="form-label">90 days report Date</label>
            <input className="form-input" type="date" name="report_90_days_date" value={formData.report_90_days_date} onChange={handleInputChange} disabled={isFieldDisabled('report-date')} />
          </div>
        </div>
        )}

        <div className="form-actions">
          <button onClick={handleUpdateProfile} disabled={!selectedOption}>Save</button>
        </div>
      </div>

      {showPopup && <UpdateProfilePopup />} 
    </div>
  );
}

export default Profile;
