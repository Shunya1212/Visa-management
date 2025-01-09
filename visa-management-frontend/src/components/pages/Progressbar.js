import React, { useEffect, useState } from "react";
import { TiTick } from "react-icons/ti";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

function Progressbar({ studentId }) {
  const steps_default = [""];
  const steps_cas1 = ["Update Profile"];
  const steps_cas2 = ["Report info", "Van Reservation", "Update Profile"];
  const steps_cas3 = ["Extension info", "Request/Download", "Van Reservation", "Update Profile"];
  
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('currentStep');
    return savedStep ? Number(savedStep) : 0;
  });

  const [complete, setComplete] = useState(() => {
    const savedComplete = localStorage.getItem('complete');
    return savedComplete === 'true';
  });

  const [steps, setSteps] = useState(() => {
    const savedSteps = localStorage.getItem('steps');
    return savedSteps ? JSON.parse(savedSteps) : steps_default;
  });

  const [students, setStudents] = useState([{}]);
  const [prevVisaExpireDate, setPrevVisaExpireDate] = useState(null); // 以前の visa_expire_date を保存
  const [prevReport90DaysDate, setPrevReport90DaysDate] = useState(null); // 以前の report_90_days_date を保存
  const navigate = useNavigate(); 
  const [activeCase, setActiveCase] = useState(null);
  const prevActiveCaseRef = useRef(null);
  
  useEffect(() => {
    if (activeCase !== prevActiveCaseRef.current) {
      // activeCase が変わった場合のみリセット
      if (prevActiveCaseRef.current !== null) {
        console.log(`Active case changed from ${prevActiveCaseRef.current} to ${activeCase}. Progress reset.`);
        setComplete(false);
        setCurrentStep(0);
        localStorage.setItem('complete', false);
        localStorage.setItem('currentStep', 0);
      }
      prevActiveCaseRef.current = activeCase; // 現在の activeCase を保存
    }
  }, [activeCase]);

  useEffect(() => {
    if (studentId) {
      const fetchStudentInfo = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/StudentInfo/?student_id=${studentId}`);
          const studentData = response.data[0];
          setStudents(studentData);

          // case1 の設定
          if (hasEmptyFields(studentData)) {
            setSteps(steps_cas1);
            setActiveCase(1);
          } 
          // case2 の設定
          else if (studentData.report_90_days_date && isReportDueWithinAWeek(studentData.report_90_days_date)) {
            setSteps(steps_cas2);
            setActiveCase(2);

            // report_90_days_date が変更されたら case2 を初期化
            if (prevReport90DaysDate && prevReport90DaysDate !== studentData.report_90_days_date) {
              setCurrentStep(0);
              setComplete(false);
              localStorage.setItem('currentStep', 0);
              localStorage.setItem('complete', false);
              console.log("case2 progress reset due to report_90_days_date change");
            }
            setPrevReport90DaysDate(studentData.report_90_days_date); // 現在の値を保存
          } 
          // case3 の設定
          else if (studentData.visa_expire_date && isExtensionDueWithinAMonth(studentData.visa_expire_date)) {
            setSteps(steps_cas3);
            setActiveCase(3);

            // visa_expire_date が変更されたら case3 を初期化
            if (prevVisaExpireDate && prevVisaExpireDate !== studentData.visa_expire_date) {
              setCurrentStep(0);
              setComplete(false);
              localStorage.setItem('currentStep', 0);
              localStorage.setItem('complete', false);
              console.log("case3 progress reset due to visa_expire_date change");
            }
            setPrevVisaExpireDate(studentData.visa_expire_date); // 現在の値を保存
          } else {
            setSteps(steps_default);
          }
          if (activeCase !== null) {
            setComplete(false);
            localStorage.setItem('complete', false);
            console.log(`Active case changed to Case ${activeCase}. Progress reset.`);
          }

          // localStorage.setItem('steps', JSON.stringify(steps));
          localStorage.setItem('steps', JSON.stringify(steps));
          
        } catch (error) {
          console.error('Error fetching student info:', error);
        }
      };

      fetchStudentInfo();
    }
  }, [studentId, steps, prevVisaExpireDate, prevReport90DaysDate,activeCase]);

  const isReportDueWithinAWeek = (dueDate) => {
    const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    const reportDate = new Date(dueDate);
    return (reportDate - currentDate) <= oneWeekInMillis;
  };

  const isExtensionDueWithinAMonth = (dueDate) => {
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    const extensionDate = new Date(dueDate);
    return (extensionDate - currentDate) <= oneMonthInMillis;
  };

  const hasEmptyFields = (students) => {
    const fieldsToCheck = [
      "first_name", 
      "last_name",
      "student_id", 
      "address_no",
      "road",
      "tambol",
      "amphoe",
      "province",
      "nationality",
      "birthday",
      "place_of_birth",
      "sex",
      "passport_number",
      "passport_issue_date",
      "passport_issue_place",
      "passport_expiration_date",
      "visa_expire_date",
      "arrival_transportation_type",
      "arrival_from", "port_of_arrival",
      "arrival_date",
      "tm6_no",
      "report_90_days_date"
    ];
    return fieldsToCheck.some(field => !students[field] || students[field] === "");
  };

  // const handleNextClick = () => {
  //   // Handle the "Start" button click when currentStep is 0
  //   if (currentStep === 0) {
  //     navigate("/home");
  //     setCurrentStep(1);  // 次のステップに進む
  //     localStorage.setItem('currentStep', 1);
  //     return;
  //   }

  //   if (activeCase === 1) {
  //     if (currentStep === 1) {
  //       setComplete(true);
  //       localStorage.setItem('complete', true);
  //     }
  //   } else if (activeCase === 2) {
  //     if (currentStep === 1) {
  //       navigate("/van_reservation");
  //     } else if (currentStep === 2) {
  //       navigate("/update_profile");
  //     } else if (currentStep === 3) {
  //       setComplete(true);
  //       localStorage.setItem('complete', true);
  //       navigate("/home");
  //     }
  //   } else if (activeCase === 3) {
  //     if (currentStep === 1) {
  //       navigate("/visa_extension");
  //     } else if (currentStep === 2) {
  //       navigate("/van_reservation");
  //     } else if (currentStep === 3) {
  //       navigate("/update_profile");
  //     } else if (currentStep === 4) {
  //       setComplete(true);
  //       localStorage.setItem('complete', true);
  //       navigate("/home");
  //     }
  //   }

  //   if (currentStep < steps.length) {
  //     const nextStep = currentStep + 1;
  //     setCurrentStep(nextStep);
  //     localStorage.setItem('currentStep', nextStep);
  //   }
  // };

  const handleNextClick = () => {
    if (currentStep === 0) {
      navigate("/home");
      setCurrentStep(1);
      localStorage.setItem('currentStep', 1);
      return;
    }
  
    if (activeCase === 1) {
      if (currentStep === steps.length) {
        setComplete(true);
        localStorage.setItem('complete', true);
      }
    } else if (activeCase === 2) {
      if (currentStep === 1) {
        navigate("/van_reservation");
      } else if (currentStep === 2) {
        navigate("/update_profile");
      } else if (currentStep === steps.length) {
        setComplete(true);
        localStorage.setItem('complete', true);
        navigate("/home");
      }
    } else if (activeCase === 3) {
      if (currentStep === 1) {
        navigate("/visa_extension");
      } else if (currentStep === 2) {
        navigate("/van_reservation");
      } else if (currentStep === 3) {
        navigate("/update_profile");
      } else if (currentStep === steps.length) {
        setComplete(true);
        localStorage.setItem('complete', true);
        navigate("/home");
      }
    }
  
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      localStorage.setItem('currentStep', nextStep);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        {steps?.map((step, i) => (
          <div
            key={i}
            className={`step-item ${currentStep === i + 1 && "active"} ${
              (i + 1 < currentStep || complete) && "complete"
            } `}
          >
            <div className="step">
              {i + 1 < currentStep || complete ? <TiTick size={24} /> : i + 1}
            </div>
            <p className="text-gray-500">{step}</p>
          </div>
        ))}
      </div>
      {!complete && (
        <div className="flex justify-center mt-6">
          <button
            className="btn bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-600 transition-all"
            onClick={handleNextClick}
          >
            {currentStep === 0 ? "Start" : currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
      {complete && (
        <div className="flex justify-center mt-6">
          <p className="text-green-500">Process is completed.</p>
        </div>
      )}
    </>
  );
}

export default Progressbar;
