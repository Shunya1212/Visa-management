import React from 'react';
import { useState , useEffect} from 'react';
import UpdateProfilePopup from '../popups/UpdateProfilePopup';
import axios from 'axios';


function Profile({studentId}) {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    // name: '',
    // student_id:'',
    birth: '',
    sex: '',
    nationality: '',
    address_no: '',
    road: '',
    tambol: '',
    amphoe: '',
    province: '',
    birthday:'',
    place_of_birth:'',
    passport_number: '',
    visaType: '',
    visa_expire_date: '',
    passport_issue_date: '',
    passport_expiration_date: '',
    passport_issue_place:'',
    arrival_transportation_type:'',
    arrival_from:'',
    port_of_arrival:'',
    arrival_date:'',
    tm6_no:'',
    report_90_days_date: '',
    email:'',
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
      return !['name', 'sex','nationality','passport_number','visa_expire_date','passport-issue','passport-expire','report-date'].includes(fieldName);
    }
    else if (selectedOption === 'register-info') {
      // Visa Extensionの場合、名前と性別以外を無効化
      return !['sex','nationality','address_no','road','tambol','amphoe','province','birthday','birth','passport_number','visa_expire_date','passport-issue','passport-expire','passport-place','transportation','arrival_from','port_of_arrival','arrival_date','tm6_no','report-date','email'].includes(fieldName);
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

  const handlesexChange = (event) => {
    const { name, value } = event.target;
    // Convert 'male' and 'female' to 'M' and 'F'
    const mappedValue = name === 'sex' ? (value === 'male' ? 'M' : value === 'female' ? 'F' : '') : value;
    setFormData({ ...formData, [name]: mappedValue });
};

const handletransportChange = (event) => {
  const { name, value } = event.target;
  setFormData({ ...formData, [name]: value }); // 値をそのまま設定
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
          <option value="register-info">Register-info</option>

        </select>
        {selectedOption && (
          <div className='form-edit flex flex-col'>
          <div className="form-field">
            <label className="form-label">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name (capital letter ex:ALEX JOSES)" disabled={isFieldDisabled('name')} />
          </div>
          <div className="form-field">
            <label className="form-label">Sex</label>
            <select name="sex"  value={formData.sex === 'M' ? 'male' : formData.sex === 'F' ? 'female' : ''} onChange={handlesexChange} disabled={isFieldDisabled('sex')} >
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
            <label className="form-label">birthday</label>
            <input className="form-input" type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} disabled={isFieldDisabled('birthday')} />
          </div>
          <div className="form-field">
            <label className="form-label">place_of_birth</label>
            <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} placeholder="place of birth" disabled={isFieldDisabled('birth')} />
          </div> 
          <div className="form-field">
            <label className="form-label">Passport No</label>
            <input type="text" name="passport_number" value={formData.passport_number} onChange={handleInputChange} placeholder="Passport No" disabled={isFieldDisabled('passport_number')} />
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
            <input className="form-input" type="date" name="passport_issue_date" value={formData.passport_issue_date} onChange={handleInputChange} disabled={isFieldDisabled('passport-issue')} />
          </div>
          <div className="form-field">
            <label className="form-label">Passport Expire Date</label>
            <input className="form-input" type="date" name="passport_expiration_date" value={formData.passport_expiration_date} onChange={handleInputChange} disabled={isFieldDisabled('passport-expire')} />
          </div>
          <div className="form-field">
            <label className="form-label">passport_issue_place</label>
            <input type="text" name="passport_issue_place" value={formData.passport_issue_place} onChange={handleInputChange} placeholder="passport issue place" disabled={isFieldDisabled('passport-place')} />
          </div>
          <div className="form-field">
            <label className="form-label">arrival_transportation_type</label>
            <select
              name="arrival_transportation_type"
              value={formData.arrival_transportation_type} // 値をそのまま利用
              onChange={handletransportChange}
              disabled={isFieldDisabled('transportation')}
            >
              <option value="">Select transportation</option>
              <option value="AIR">Airplane</option>
              <option value="SEA">Sea</option>
              <option value="LAND">Land</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">arrival_from</label>
            <input type="text" name="arrival_from" value={formData.arrival_from} onChange={handleInputChange} placeholder="arrival from" disabled={isFieldDisabled('arrival_from')} />
          </div>
          <div className="form-field">
            <label className="form-label">port_of_arrival</label>
            <input type="text" name="port_of_arrival" value={formData.port_of_arrival} onChange={handleInputChange} placeholder="port of arrival" disabled={isFieldDisabled('port_of_arrival')} />
          </div>
          <div className="form-field">
            <label className="form-label">arrival_date</label>
            <input className="form-input" type="date" name="arrival_date" value={formData.arrival_date} onChange={handleInputChange} disabled={isFieldDisabled('arrival_date')} />
          </div>
          <div className="form-field">
            <label className="form-label">tm6_no</label>
            <input type="text" name="tm6_no" value={formData.tm6_no} onChange={handleInputChange} placeholder="tm6_no" disabled={isFieldDisabled('tm6_no')} />
          </div>
          <div className="form-field">
            <label className="form-label">90 days report Date</label>
            <input className="form-input" type="date" name="report_90_days_date" value={formData.report_90_days_date} onChange={handleInputChange} disabled={isFieldDisabled('report-date')} />
          </div>
          <div className="form-field">
            <label className="form-label">email</label>
            <input type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="email" disabled={isFieldDisabled('email')} />
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
            <select name="sex"  value={formData.sex === 'M' ? 'male' : formData.sex === 'F' ? 'female' : ''} onChange={handlesexChange} disabled={isFieldDisabled('sex')} >
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
        <br></br>
      </div>

      {showPopup && <UpdateProfilePopup />} 
    </div>
  );
}

export default Profile;
