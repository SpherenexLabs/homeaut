// import React, { useState, useEffect, useRef } from 'react';
// import { database } from '../firebase';
// import { ref, set, onValue } from "firebase/database";
// import './SmartHomeInterface.css';

// const SmartHomeInterface = () => {
//   // Room value mapping for Firebase
//   const FIREBASE_VALUES = {
//     ALL_OFF: 0,
//     ALL_ON: 1,
//     BEDROOM_ON: 2,
//     BEDROOM_OFF: 3,
//     BATHROOM_ON: 4,
//     BATHROOM_OFF: 5,
//     KITCHEN_ON: 6,
//     KITCHEN_OFF: 7,
//     OTHER_ON: 8,
//     OTHER_OFF: 9
//   };

//   // State for each room's light status
//   const [lights, setLights] = useState({
//     bedroom: false,
//     bathroom: false,
//     kitchen: false,
//     other: false
//   });

//   // State for voice recognition
//   const [isListening, setIsListening] = useState(false);
//   const [notification, setNotification] = useState('');
//   const [speechSupported, setSpeechSupported] = useState(false);

//   // State for temperature
//   const [temperature, setTemperature] = useState(null);

//   // State for gesture detection
//   const [isGestureDetecting, setIsGestureDetecting] = useState(false);
//   const [detectedFingers, setDetectedFingers] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const handModelRef = useRef(null);

//   // Check if speech recognition is supported
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       setSpeechSupported(true);
//     } else {
//       setNotification('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   // Connect to Firebase and listen for changes
//   useEffect(() => {
//     const lightsRef = ref(database, 'lights');

//     // Listen for changes in Firebase and update local state
//     onValue(lightsRef, (snapshot) => {
//       const value = snapshot.val();

//       // Only update UI if the value is defined
//       if (value !== null && value !== undefined) {
//         console.log("Firebase value received:", value);

//         // Update local state based on the Firebase value
//         switch (parseInt(value)) {
//           case FIREBASE_VALUES.ALL_ON:
//             console.log("Setting all lights ON");
//             setLights({
//               bedroom: true,
//               bathroom: true,
//               kitchen: true,
//               other: true
//             });
//             break;
//           case FIREBASE_VALUES.ALL_OFF:
//             console.log("Setting all lights OFF");
//             setLights({
//               bedroom: false,
//               bathroom: false,
//               kitchen: false,
//               other: false
//             });
//             break;
//           case FIREBASE_VALUES.BEDROOM_ON:
//             setLights(prev => ({ ...prev, bedroom: true }));
//             break;
//           case FIREBASE_VALUES.BEDROOM_OFF:
//             setLights(prev => ({ ...prev, bedroom: false }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_ON:
//             setLights(prev => ({ ...prev, bathroom: true }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_OFF:
//             setLights(prev => ({ ...prev, bathroom: false }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_ON:
//             setLights(prev => ({ ...prev, kitchen: true }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_OFF:
//             setLights(prev => ({ ...prev, kitchen: false }));
//             break;
//           case FIREBASE_VALUES.OTHER_ON:
//             setLights(prev => ({ ...prev, other: true }));
//             break;
//           case FIREBASE_VALUES.OTHER_OFF:
//             setLights(prev => ({ ...prev, other: false }));
//             break;
//           default:
//             console.log("Unknown value from Firebase:", value);
//         }
//       }
//     });

//     // Listen for temperature updates
//     const temperatureRef = ref(database, 'sensorData/temperature');
//     onValue(temperatureRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         console.log("Temperature value received:", value);
//         setTemperature(value);
//       }
//     });

//     // Clean up listeners
//     return () => {
//       // Clean up listeners
//     };
//   }, []);

//   // Load HandPose model
//   useEffect(() => {
//     const loadHandPoseModel = async () => {
//       try {
//         // Dynamically import TensorFlow.js and HandPose
//         const tf = await import('@tensorflow/tfjs');
//         const handpose = await import('@tensorflow-models/handpose');

//         // Load the HandPose model
//         handModelRef.current = await handpose.load();
//         console.log("Handpose model loaded");
//       } catch (error) {
//         console.error("Error loading handpose model:", error);
//         setNotification("Error: Could not load hand detection model");
//       }
//     };

//     loadHandPoseModel();
//   }, []);

//   // Toggle light function for individual rooms
//   const toggleLight = (room) => {
//     const newStatus = !lights[room];

//     // Update local state (will be overwritten when Firebase updates)
//     setLights(prevState => ({
//       ...prevState,
//       [room]: newStatus
//     }));

//     // Determine which Firebase value to send
//     let valueToSend;
//     if (room === 'bedroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BEDROOM_ON : FIREBASE_VALUES.BEDROOM_OFF;
//     } else if (room === 'bathroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BATHROOM_ON : FIREBASE_VALUES.BATHROOM_OFF;
//     } else if (room === 'kitchen') {
//       valueToSend = newStatus ? FIREBASE_VALUES.KITCHEN_ON : FIREBASE_VALUES.KITCHEN_OFF;
//     } else if (room === 'other') {
//       valueToSend = newStatus ? FIREBASE_VALUES.OTHER_ON : FIREBASE_VALUES.OTHER_OFF;
//     }

//     // Update Firebase
//     set(ref(database, 'lights'), valueToSend)
//       .then(() => {
//         setNotification(`${room.charAt(0).toUpperCase() + room.slice(1)} light turned ${newStatus ? 'on' : 'off'}`);
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification(`Error: Could not update ${room} light status`);
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights on
//   const turnAllOn = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: true,
//       bathroom: true,
//       kitchen: true,
//       other: true
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//       .then(() => {
//         setNotification('All lights turned on');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights on');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights off
//   const turnAllOff = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: false,
//       bathroom: false,
//       kitchen: false,
//       other: false
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF)
//       .then(() => {
//         setNotification('All lights turned off');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights off');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Process voice command
//   const processCommand = (command) => {
//     if (!command) return;

//     command = command.toLowerCase();

//     // Check for "all" commands first
//     if (command.includes('all') || command.includes('every')) {
//       if (command.includes('on')) {
//         turnAllOn();
//         return;
//       } else if (command.includes('off')) {
//         turnAllOff();
//         return;
//       }
//     }

//     // Process commands for individual rooms
//     if (command.includes('turn on') || command.includes('turn off')) {
//       const isOn = command.includes('turn on');

//       // Check which room is mentioned
//       const rooms = ['bedroom', 'bathroom', 'kitchen', 'other'];
//       const mentionedRoom = rooms.find(room => command.includes(room));

//       if (mentionedRoom) {
//         // Only toggle if the current state is different
//         if (lights[mentionedRoom] !== isOn) {
//           toggleLight(mentionedRoom);
//         } else {
//           setNotification(`${mentionedRoom.charAt(0).toUpperCase() + mentionedRoom.slice(1)} light is already ${isOn ? 'on' : 'off'}`);

//           // Clear notification after 3 seconds
//           setTimeout(() => {
//             setNotification('');
//           }, 3000);
//         }
//       } else {
//         setNotification('Sorry, I didn\'t recognize which room you meant');

//         // Clear notification after 3 seconds
//         setTimeout(() => {
//           setNotification('');
//         }, 3000);
//       }
//     } else if (command.includes('hello') || command.includes('hi')) {
//       setNotification('Hello! How can I help you with the lights?');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     } else {
//       setNotification('Try saying "Turn on bedroom light" or "Turn all lights off"');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     }
//   };

//   // Start voice recognition
//   const startListening = () => {
//     if (!speechSupported) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     setIsListening(true);
//     setNotification('Listening...');

//     recognition.start();

//     recognition.onresult = (event) => {
//       const speechResult = event.results[0][0].transcript;
//       setNotification(`You said: "${speechResult}"`);
//       processCommand(speechResult);
//     };

//     recognition.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setNotification(`Error: ${event.error}`);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };
//   };

//   // Start gesture detection
//   const startGestureDetection = async () => {
//     if (!handModelRef.current) {
//       console.log("Model not loaded yet");
//       setNotification('Hand detection model is not loaded yet. Please try again in a moment.');
//       return;
//     }

//     console.log("Starting gesture detection");

//     try {
//       // Access webcam with more specific constraints
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: 'user'
//         } 
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();

//         // Start detection loop
//         setIsGestureDetecting(true);
//         setNotification('Gesture detection started. Show your hand with fingers extended.');

//         // Setup canvas
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.clientWidth;
//           canvasRef.current.height = videoRef.current.clientHeight;

//           // Start the detection loop
//           console.log("Gesture detection loop started");
//           detectGestures();
//         }
//       }
//     } catch (error) {
//       console.error('Error accessing webcam:', error);
//       setNotification('Error: Could not access webcam. Please check camera permissions.');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Stop gesture detection
//   const stopGestureDetection = () => {
//     setIsGestureDetecting(false);

//     // Stop the webcam stream
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = videoRef.current.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }

//     setNotification('Gesture detection stopped');
//   };

//   // Improved helper function to count extended fingers
//   const countExtendedFingers = (landmarks) => {
//     // Get key points
//     const wrist = landmarks[0];
//     const thumbTip = landmarks[4];
//     const indexTip = landmarks[8];
//     const middleTip = landmarks[12];
//     const ringTip = landmarks[16];
//     const pinkyTip = landmarks[20];

//     // Get base points
//     const indexBase = landmarks[5];
//     const middleBase = landmarks[9];
//     const ringBase = landmarks[13];
//     const pinkyBase = landmarks[17];

//     let count = 0;

//     // SIMPLE DETECTION ALGORITHM that prioritizes reliability over accuracy

//     // Special case for just one finger (index) - very lenient detection
//     // Many users just point with index finger, so we make this especially easy to detect
//     const indexRaised = indexTip[1] < indexBase[1] - 15; // Vertical check with smaller threshold

//     if (indexRaised &&
//         // Make sure other fingers are not clearly extended
//         middleTip[1] > middleBase[1] - 10 &&
//         ringTip[1] > ringBase[1] - 10 &&
//         pinkyTip[1] > pinkyBase[1] - 10) {

//       console.log("INDEX FINGER CLEARLY DETECTED");
//       return 1; // Directly return 1 for clear index finger pointing
//     }

//     // More general detection for other cases
//     // Thumb (simplified)
//     if (Math.abs(thumbTip[0] - wrist[0]) > 30) {
//       count++;
//       console.log("Thumb detected");
//     }

//     // Index finger
//     if (indexTip[1] < indexBase[1] - 25) {
//       count++;
//       console.log("Index finger detected");
//     }

//     // Middle finger
//     if (middleTip[1] < middleBase[1] - 25) {
//       count++;
//       console.log("Middle finger detected");
//     }

//     // Ring finger
//     if (ringTip[1] < ringBase[1] - 25) {
//       count++;
//       console.log("Ring finger detected");
//     }

//     // Pinky
//     if (pinkyTip[1] < pinkyBase[1] - 25) {
//       count++;
//       console.log("Pinky detected");
//     }

//     console.log(`Total fingers detected: ${count}`);
//     return count;
//   };


//   // Process detected finger count and execute command
//   const processGestureCommand = (fingerCount) => {
//     console.log(`PROCESSING COMMAND: ${fingerCount} fingers`);

//     // Always log to debugData for verification
//     set(ref(database, 'debugData/fingerCount'), fingerCount)
//       .then(() => console.log(`Debug data updated with count ${fingerCount}`))
//       .catch(error => console.error("Debug update error:", error));

//     // Explicitly process each count
//     switch (fingerCount) {
//       case 1:
//         console.log("*** SENDING VALUE 1 TO FIREBASE ***");

//         // Direct update to Firebase - no conditional logic
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//           .then(() => {
//             console.log("SUCCESS: Firebase value set to 1 (ALL_ON)");
//             setNotification('All lights turned ON via gesture');
//           })
//           .catch((error) => {
//             console.error("Firebase error:", error);
//             setNotification('Error sending to Firebase');
//           });
//         break;

//       // Handle other finger counts similarly
//       case 0:
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF);
//         break;
//       case 2:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BEDROOM_ON);
//         break;
//       case 3:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BATHROOM_ON);
//         break;
//       case 4:
//         set(ref(database, 'lights'), FIREBASE_VALUES.KITCHEN_ON);
//         break;
//       case 5:
//         set(ref(database, 'lights'), FIREBASE_VALUES.OTHER_ON);
//         break;
//     }

//     // Stop detection after successfully processing command
//     setTimeout(() => {
//       stopGestureDetection();
//     }, 2000);
//   };

//   // Improved gesture detection with consistency check
//   const detectGestures = async () => {
//     if (!isGestureDetecting || !handModelRef.current || !videoRef.current || !canvasRef.current) return;

//     try {
//       // Get hand predictions
//       const predictions = await handModelRef.current.estimateHands(videoRef.current);

//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//       // Draw video
//       ctx.drawImage(
//         videoRef.current, 
//         0, 0, 
//         canvasRef.current.width, 
//         canvasRef.current.height
//       );

//       // Add detection readings history for stability
//       const readingsHistory = [];

//       if (predictions.length > 0) {
//         // Get hand and count fingers
//         const hand = predictions[0];
//         const fingerCount = countExtendedFingers(hand.landmarks);

//         // Update UI
//         setDetectedFingers(fingerCount);
//         setNotification(`Detected ${fingerCount} finger${fingerCount !== 1 ? 's' : ''}`);

//         // Log to console for debugging
//         console.log(`Current finger count: ${fingerCount}`);

//         // Draw landmarks
//         for (const landmark of hand.landmarks) {
//           ctx.beginPath();
//           ctx.arc(
//             landmark[0] * canvasRef.current.width / videoRef.current.videoWidth,
//             landmark[1] * canvasRef.current.height / videoRef.current.videoHeight,
//             5, 0, 2 * Math.PI
//           );
//           ctx.fillStyle = 'red';
//           ctx.fill();
//         }

//         // Draw finger count prominently
//         ctx.font = 'bold 100px Arial';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 5;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.strokeText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );
//         ctx.fillText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );

//         // Send directly to Firebase after detection
//         if (fingerCount >= 0 && fingerCount <= 5) {
//           // Immediately send to Firebase - no delay for better responsiveness
//           // In a real app you might want a small delay, but for debugging immediate feedback helps
//           processGestureCommand(fingerCount);
//         }
//       } else {
//         setDetectedFingers(null);
//         setNotification('No hand detected. Please show your hand to the camera.');
//       }

//       // Continue loop
//       if (isGestureDetecting) {
//         requestAnimationFrame(detectGestures);
//       }
//     } catch (error) {
//       console.error('Error in hand detection:', error);
//       setNotification('Error in hand detection');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Custom Switch component
//   const Switch = ({ isOn, onToggle }) => {
//     return (
//       <label className="switch">
//         <input 
//           type="checkbox" 
//           checked={isOn} 
//           onChange={onToggle} 
//         />
//         <span className={`slider ${isOn ? 'active' : ''}`}>
//           <span className={`slider-thumb ${isOn ? 'active' : ''}`}></span>
//         </span>
//       </label>
//     );
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className='smart'>
//           <div className="assistant-icon">G</div>
//           <h1 className="title">Smart Home Controls</h1>
//         </div>
//         {/* Temperature and Fan Status Display */}
//         {temperature !== null && (
//           <div className="temperature-display">
//             <span className="temp-icon">🌡️</span>
//             <span className="temp-value">{temperature}°C</span>
//             <div className={`fan-status ${temperature >= 29 ? 'fan-on' : 'fan-off'}`}>
//               <span className="fan-icon">{temperature >= 29 ? '🔄' : '⏹️'}</span>
//               <span className="fan-text">Fan {temperature >= 29 ? 'ON' : 'OFF'}</span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="master-controls">
//         <button 
//           className="master-button on" 
//           onClick={turnAllOn}
//         >
//           All Lights On
//         </button>
//         <button 
//           className="master-button off" 
//           onClick={turnAllOff}
//         >
//           All Lights Off
//         </button>
//       </div>

//       <div className="controls">
//         {Object.entries(lights).map(([room, isOn]) => (
//           <div key={room} className={`room ${isOn ? 'active' : ''}`}>
//             <h2 className="room-name">{room.charAt(0).toUpperCase() + room.slice(1)}</h2>
//             <Switch isOn={isOn} onToggle={() => toggleLight(room)} />
//           </div>
//         ))}
//       </div>

//       {/* Gesture Detection Section */}
//       <div className="gesture-section">
//         <h2>Gesture Control</h2>
//         <p>Control your lights with hand gestures:</p>
//         <ul className="gesture-examples">
//           <li><strong>0 fingers:</strong> Turn all lights off</li>
//           <li><strong>1 finger:</strong> Turn all lights on</li>
//           <li><strong>2 fingers:</strong> Toggle bedroom light</li>
//           <li><strong>3 fingers:</strong> Toggle bathroom light</li>
//           <li><strong>4 fingers:</strong> Toggle kitchen light</li>
//           <li><strong>5 fingers:</strong> Toggle other lights</li>
//         </ul>

//         <div className="gesture-controls">
//           <button 
//             onClick={isGestureDetecting ? stopGestureDetection : startGestureDetection} 
//             className={`gesture-button ${isGestureDetecting ? 'detecting' : ''}`}
//           >
//             <span className="camera-icon">📷</span>
//             {isGestureDetecting ? 'Stop Gesture Detection' : 'Start Gesture Detection'}
//           </button>
//         </div>

//         <div className="gesture-display">
//           <video 
//             ref={videoRef} 
//             className={`gesture-video ${isGestureDetecting ? 'active' : ''}`}
//             playsInline
//             muted
//           />
//           <canvas 
//             ref={canvasRef} 
//             className={`gesture-canvas ${isGestureDetecting ? 'active' : ''}`}
//           />
//         </div>
//       </div>

//       <div className="voice-section">
//         <h2>Voice Commands</h2>
//         <p>Click the microphone button and try saying:</p>
//         <ul className="command-examples">
//           <li>"Turn on bedroom light"</li>
//           <li>"Turn off kitchen light"</li>
//           <li>"Turn all lights on"</li>
//           <li>"Turn all lights off"</li>
//         </ul>

//         <button 
//           onClick={startListening} 
//           className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
//           disabled={!speechSupported || isListening}
//         >
//           <span className="mic-icon">🎤</span>
//           {isListening ? 'Listening...' : 'Start Voice Command'}
//         </button>
//       </div>

//       {notification && (
//         <div className="notification">
//           {notification}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SmartHomeInterface;


import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, set, onValue } from "firebase/database";
import './SmartHomeInterface.css';

const SmartHomeInterface = () => {
  // State for each room's light status - using "0" and "1" strings
  const [lights, setLights] = useState({
    bedroom: "0",
    kitchen: "0",
    bathroom: "0",
    living_room: "0"
  });

  // State for sensor values
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    fan: null,
    pir_motion: null,
    rfid_message: null,
    room_light: null,
    servo: null,
    smoke_level: null
  });

  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // Default language
  const recognitionRef = useRef(null);

  // State for notifications
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState('');

  // Language configurations
  const languages = {
    'en-US': { name: 'English', code: 'en-US', flag: '🇺🇸' },
    'kn-IN': { name: 'ಕನ್ನಡ (Kannada)', code: 'kn-IN', flag: '🇮🇳' },
    'hi-IN': { name: 'हिन्दी (Hindi)', code: 'hi-IN', flag: '🇮🇳' }
  };

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      setNotificationQueue(prev => [...prev, 'Speech recognition is not supported in this browser.']);
    }
  }, []);

  // Manage notification queue
  useEffect(() => {
    if (notificationQueue.length > 0) {
      setCurrentNotification(notificationQueue[0]);
      const timer = setTimeout(() => {
        setNotificationQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setCurrentNotification('');
    }
  }, [notificationQueue]);

  // Connect to Firebase and listen for changes
  useEffect(() => {
    if (!database) {
      setNotificationQueue(prev => [...prev, 'Error: Firebase database not initialized']);
      return;
    }

    // Updated Firebase path
    const basePath = '83_Water_10_12_2025';

    // Listen for all sensor data
    const fanRef = ref(database, `${basePath}/fan`);
    const humidityRef = ref(database, `${basePath}/humidity`);
    const pirMotionRef = ref(database, `${basePath}/pir_motion`);
    const rfidMessageRef = ref(database, `${basePath}/rfid_message`);
    const roomLightRef = ref(database, `${basePath}/room_light`);
    const servoRef = ref(database, `${basePath}/servo`);
    const smokeLevelRef = ref(database, `${basePath}/smoke_level`);
    const temperatureRef = ref(database, `${basePath}/temperature`);

    const fanListener = onValue(fanRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, fan: value }));
      }
    });

    const humidityListener = onValue(humidityRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, humidity: value }));
      }
    });

    const pirMotionListener = onValue(pirMotionRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, pir_motion: value }));
      }
    });

    const rfidMessageListener = onValue(rfidMessageRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, rfid_message: value }));
      }
    });

    const roomLightListener = onValue(roomLightRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, room_light: value }));
      }
    });

    const servoListener = onValue(servoRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, servo: value }));
      }
    });

    const smokeLevelListener = onValue(smokeLevelRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, smoke_level: value }));
      }
    });

    const temperatureListener = onValue(temperatureRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setSensorData(prev => ({ ...prev, temperature: value }));
        
        // Automatically control fan based on temperature
        if (value >= 30) {
          set(ref(database, `${basePath}/fan`), 1)
            .then(() => {
              console.log('Fan turned on automatically (temp >= 30°C)');
            })
            .catch((error) => {
              console.error("Error turning on fan: ", error);
            });
        } else {
          set(ref(database, `${basePath}/fan`), 0)
            .then(() => {
              console.log('Fan turned off automatically (temp < 30°C)');
            })
            .catch((error) => {
              console.error("Error turning off fan: ", error);
            });
        }
      }
    });

    return () => {
      fanListener();
      humidityListener();
      pirMotionListener();
      rfidMessageListener();
      roomLightListener();
      servoListener();
      smokeLevelListener();
      temperatureListener();
    };
  }, []);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Helper function to control fan
  const toggleFan = (status) => {
    // Check if trying to turn off fan when temperature is >= 30
    if (status === 0 && sensorData.temperature >= 30) {
      const messages = {
        'en-US': '⚠️ Cannot turn off fan - Temperature is 30°C or above',
        'kn-IN': '⚠️ ಫ್ಯಾನ್ ಆಫ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ - ತಾಪಮಾನ 30°C ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು',
        'hi-IN': '⚠️ पंखा बंद नहीं कर सकते - तापमान 30°C या उससे अधिक है'
      };
      setNotificationQueue(prev => [...prev, messages[selectedLanguage]]);
      return;
    }

    const basePath = '83_Water_10_12_2025';
    set(ref(database, `${basePath}/fan`), status)
      .then(() => {
        const messages = {
          'en-US': `Fan turned ${status === 1 ? 'on' : 'off'}`,
          'kn-IN': `ಫ್ಯಾನ್ ${status === 1 ? 'ಆನ್' : 'ಆಫ್'} ಮಾಡಲಾಗಿದೆ`,
          'hi-IN': `पंखा ${status === 1 ? 'चालू' : 'बंद'} किया गया`
        };
        setNotificationQueue(prev => [...prev, messages[selectedLanguage]]);
      })
      .catch((error) => {
        console.error("Error updating fan: ", error);
        setNotificationQueue(prev => [...prev, 'Error: Could not control fan']);
      });
  };

  // Helper function to control room light
  const toggleRoomLight = (status) => {
    const basePath = '83_Water_10_12_2025';
    set(ref(database, `${basePath}/room_light`), status)
      .then(() => {
        const messages = {
          'en-US': `Room light turned ${status === 1 ? 'on' : 'off'}`,
          'kn-IN': `ಕೋಣೆ ಬೆಳಕು ${status === 1 ? 'ಆನ್' : 'ಆಫ್'} ಮಾಡಲಾಗಿದೆ`,
          'hi-IN': `कमरे की लाइट ${status === 1 ? 'चालू' : 'बंद'} की गई`
        };
        setNotificationQueue(prev => [...prev, messages[selectedLanguage]]);
      })
      .catch((error) => {
        console.error("Error updating room light: ", error);
        setNotificationQueue(prev => [...prev, 'Error: Could not control room light']);
      });
  };

  // Helper function to control gate
  const setGatePosition = (position) => {
    const basePath = '83_Water_10_12_2025';
    set(ref(database, `${basePath}/servo`), position)
      .then(() => {
        const messages = {
          'en-US': position === 90 ? 'Gate opened' : 'Gate closed',
          'kn-IN': position === 90 ? 'ಗೇಟ್ ತೆರೆಯಲಾಗಿದೆ' : 'ಗೇಟ್ ಮುಚ್ಚಲಾಗಿದೆ',
          'hi-IN': position === 90 ? 'गेट खोला गया' : 'गेट बंद किया गया'
        };
        setNotificationQueue(prev => [...prev, messages[selectedLanguage]]);
      })
      .catch((error) => {
        console.error("Error updating gate: ", error);
        setNotificationQueue(prev => [...prev, 'Error: Could not control gate']);
      });
  };

  // Helper function to update lights
  const updateLights = (updates) => {
    setLights(prev => ({ ...prev, ...updates }));
    Object.entries(updates).forEach(([roomKey, status]) => {
      // Map room names to relay numbers
      const roomToRelay = {
        bedroom: 'Relay1',
        kitchen: 'Relay2',
        bathroom: 'Relay3',
        living_room: 'Relay4'
      };
      
      const firebasePath = roomToRelay[roomKey];
      
      set(ref(database, `Home_Automation_1/${firebasePath}`), Number(status))
        .then(() => {
          setNotificationQueue(prev => [...prev, `${formatRoomName(roomKey)} light turned ${status === "1" ? 'on' : 'off'}`]);
        })
        .catch((error) => {
          console.error("Error updating database: ", error);
          setNotificationQueue(prev => [...prev, `Error: Could not update ${formatRoomName(roomKey)} light status`]);
        });
    });
  };

  // Toggle light function for individual rooms
  const toggleLight = (roomKey) => {
    // Check if trying to turn on kitchen light while flame is detected
    if (roomKey === 'kitchen' && lights[roomKey] === "0" && sensorData.flame === 1) {
      setNotificationQueue(prev => [...prev, '⚠️ Cannot turn on kitchen light - Flame detected for safety!']);
      return;
    }
    
    const newStatus = lights[roomKey] === "0" ? "1" : "0";
    updateLights({ [roomKey]: newStatus });
  };

  // Function to turn all lights on
  const turnAllOn = () => {
    const updates = {
      bedroom: "1",
      kitchen: sensorData.flame === 1 ? "0" : "1", // Don't turn on kitchen if flame detected
      bathroom: "1",
      living_room: "1"
    };
    updateLights(updates);
    
    if (sensorData.flame === 1) {
      setNotificationQueue(prev => [...prev, 'All lights turned on (Kitchen light kept off due to flame detection)']);
    } else {
      setNotificationQueue(prev => [...prev, 'All lights turned on']);
    }
  };

  // Function to turn all lights off
  const turnAllOff = () => {
    const updates = {
      bedroom: "0",
      kitchen: "0",
      bathroom: "0",
      living_room: "0"
    };
    updateLights(updates);
    setNotificationQueue(prev => [...prev, 'All lights turned off']);
  };

  // Multi-language command patterns
  const getCommandPatterns = (lang) => {
    const patterns = {
      'en-US': {
        turnOn: ['turn on', 'switch on', 'on', 'start'],
        turnOff: ['turn off', 'switch off', 'off', 'stop'],
        fan: ['fan', 'ceiling fan'],
        roomLight: ['room light', 'main light', 'light'],
        gate: ['gate', 'door'],
        open: ['open', 'unlock'],
        close: ['close', 'lock'],
        greeting: ['hello', 'hi', 'hey']
      },
      'kn-IN': {
        turnOn: ['ಆನ್ ಮಾಡಿ', 'ಹಚ್ಚು', 'ಹಾಕು', 'ಹಚ್ಚಿ', 'ಶುರು ಮಾಡಿ'],
        turnOff: ['ಆಫ್ ಮಾಡಿ', 'ಆರಿಸು', 'ಆರಿಸಿ', 'ಆಫ್', 'ನಿಲ್ಲಿಸು'],
        fan: ['ಫ್ಯಾನ್', 'ಪಂಖಾ'],
        roomLight: ['ಕೋಣೆ ಬೆಳಕು', 'ಮುಖ್ಯ ಬೆಳಕು', 'ಬೆಳಕು'],
        gate: ['ಗೇಟ್', 'ಬಾಗಿಲು'],
        open: ['ತೆರೆ', 'ತೆರೆಯಿರಿ'],
        close: ['ಮುಚ್ಚು', 'ಮುಚ್ಚಿರಿ'],
        greeting: ['ನಮಸ್ಕಾರ', 'ಹಲೋ']
      },
      'hi-IN': {
        turnOn: ['चालू करो', 'ऑन करो', 'जलाओ', 'चालू', 'शुरू करो'],
        turnOff: ['बंद करो', 'ऑफ करो', 'बुझाओ', 'बंद', 'बंद करो'],
        fan: ['पंखा', 'फैन'],
        roomLight: ['कमरे की लाइट', 'मुख्य लाइट', 'लाइट'],
        gate: ['गेट', 'दरवाजा'],
        open: ['खोलो', 'खोल दो'],
        close: ['बंद करो', 'बंद कर दो'],
        greeting: ['नमस्ते', 'हैलो', 'हाय']
      }
    };
    return patterns[lang] || patterns['en-US'];
  };

  // Process voice command with multi-language support
  const processCommand = (command) => {
    if (!command) return;

    command = command.toLowerCase();
    const patterns = getCommandPatterns(selectedLanguage);

    // Check for greeting
    if (patterns.greeting.some(greeting => command.includes(greeting))) {
      const greetingMessages = {
        'en-US': 'Hello! I can control the fan, room light, and gate.',
        'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ಫ್ಯಾನ್, ಕೋಣೆ ಬೆಳಕು ಮತ್ತು ಗೇಟ್ ಅನ್ನು ನಿಯಂತ್ರಿಸಬಹುದು.',
        'hi-IN': 'नमस्ते! मैं पंखा, कमरे की लाइट और गेट को नियंत्रित कर सकता हूं.'
      };
      setNotificationQueue(prev => [...prev, greetingMessages[selectedLanguage]]);
      return;
    }

    // Check for fan control
    if (patterns.fan.some(word => command.includes(word))) {
      const hasOnCommand = patterns.turnOn.some(cmd => command.includes(cmd));
      const hasOffCommand = patterns.turnOff.some(cmd => command.includes(cmd));
      
      if (hasOnCommand) {
        toggleFan(1);
        return;
      } else if (hasOffCommand) {
        // Check temperature before allowing fan to be turned off
        if (sensorData.temperature >= 30) {
          const messages = {
            'en-US': '⚠️ Cannot turn off fan - Temperature is 30°C or above. Fan will turn off automatically when temperature drops below 30°C.',
            'kn-IN': '⚠️ ಫ್ಯಾನ್ ಆಫ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ - ತಾಪಮಾನ 30°C ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು. ತಾಪಮಾನ 30°C ಕಿಂತ ಕುಸಿದಾಗ ಫ್ಯಾನ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆಫ್ ಆಗುತ್ತದೆ.',
            'hi-IN': '⚠️ पंखा बंद नहीं कर सकते - तापमान 30°C या उससे अधिक है। जब तापमान 30°C से नीचे जाएगा तब पंखा स्वचालित बंद हो जाएगा।'
          };
          setNotificationQueue(prev => [...prev, messages[selectedLanguage]]);
          return;
        }
        toggleFan(0);
        return;
      }
    }

    // Check for room light control
    if (patterns.roomLight.some(word => command.includes(word))) {
      const hasOnCommand = patterns.turnOn.some(cmd => command.includes(cmd));
      const hasOffCommand = patterns.turnOff.some(cmd => command.includes(cmd));
      
      if (hasOnCommand) {
        toggleRoomLight(1);
        return;
      } else if (hasOffCommand) {
        toggleRoomLight(0);
        return;
      }
    }

    // Check for gate control
    if (patterns.gate.some(word => command.includes(word))) {
      const hasOpenCommand = patterns.open.some(cmd => command.includes(cmd));
      const hasCloseCommand = patterns.close.some(cmd => command.includes(cmd));
      
      if (hasOpenCommand) {
        setGatePosition(90);
        return;
      } else if (hasCloseCommand) {
        setGatePosition(0);
        return;
      }
    }

    // Command not recognized
    const notRecognizedMessages = {
      'en-US': 'Sorry, I didn\'t understand. Try saying "turn on fan", "turn on light", or "open gate"',
      'kn-IN': 'ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. "ಫ್ಯಾನ್ ಹಚ್ಚು", "ಬೆಳಕು ಹಚ್ಚು", ಅಥವಾ "ಗೇಟ್ ತೆರೆ" ಎಂದು ಹೇಳಿ',
      'hi-IN': 'क्षमा करें, मैं समझ नहीं पाया. "पंखा चालू करो", "लाइट चालू करो", या "गेट खोलो" कहें'
    };
    setNotificationQueue(prev => [...prev, notRecognizedMessages[selectedLanguage]]);
  };

  // Start voice recognition with selected language
  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.lang = selectedLanguage;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    setIsListening(true);
    
    const listeningMessages = {
      'en-US': 'Listening...',
      'kn-IN': 'ಕೇಳುತ್ತಿದೆ...',
      'hi-IN': 'सुन रहा हूँ...'
    };
    setNotificationQueue(prev => [...prev, listeningMessages[selectedLanguage]]);

    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      const youSaidMessages = {
        'en-US': `You said: "${speechResult}"`,
        'kn-IN': `ನೀವು ಹೇಳಿದ್ದು: "${speechResult}"`,
        'hi-IN': `आपने कहा: "${speechResult}"`
      };
      setNotificationQueue(prev => [...prev, youSaidMessages[selectedLanguage]]);
      processCommand(speechResult);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      const errorMessages = {
        'en-US': `Error: ${event.error}`,
        'kn-IN': `ದೋಷ: ${event.error}`,
        'hi-IN': `त्रुटि: ${event.error}`
      };
      setNotificationQueue(prev => [...prev, errorMessages[selectedLanguage]]);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  // Custom Switch component
  const Switch = ({ isOn, onToggle }) => {
    return (
      <label className="switch">
        <input
          type="checkbox"
          checked={isOn === "1"}
          onChange={onToggle}
        />
        <span className={`slider ${isOn === "1" ? 'active' : ''}`}>
          <span className={`slider-thumb ${isOn === "1" ? 'active' : ''}`}></span>
        </span>
      </label>
    );
  };

  // Helper function to format room name for display
  const formatRoomName = (roomKey) => {
    const roomNames = {
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      living_room: 'Living Room'
    };
    return roomNames[roomKey] || roomKey;
  };

  return (
    <div className="container">
      <div className="header">
        <div className='smart'>
          <div className="assistant-icon">G</div>
          <h1 className="title">Smart Home Controls</h1>
        </div>
      </div>

      {/* Sensor Data Display */}
      <div className="sensor-data-section">
        <div className="sensor-card">
          <span className="sensor-icon">🌡️</span>
          <div className="sensor-info">
            <span className="sensor-label">Temperature</span>
            <span className="sensor-value">
              {sensorData.temperature !== null ? `${sensorData.temperature}°C` : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">💧</span>
          <div className="sensor-info">
            <span className="sensor-label">Humidity</span>
            <span className="sensor-value">
              {sensorData.humidity !== null ? `${sensorData.humidity}%` : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">🌪️</span>
          <div className="sensor-info">
            <span className="sensor-label">Fan</span>
            <span className="sensor-value">
              {sensorData.fan !== null ? (sensorData.fan === 1 ? 'ON' : 'OFF') : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">🚶</span>
          <div className="sensor-info">
            <span className="sensor-label">PIR Motion</span>
            <span className="sensor-value">
              {sensorData.pir_motion !== null ? (sensorData.pir_motion === 1 ? 'DETECTED' : 'No Motion') : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">🔑</span>
          <div className="sensor-info">
            <span className="sensor-label">RFID Status</span>
            <span className="sensor-value">
              {sensorData.rfid_message !== null ? sensorData.rfid_message : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">💡</span>
          <div className="sensor-info">
            <span className="sensor-label">Room Light</span>
            <span className="sensor-value">
              {sensorData.room_light !== null ? (sensorData.room_light === 1 ? 'ON' : 'OFF') : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">🚪</span>
          <div className="sensor-info">
            <span className="sensor-label">Gate</span>
            <span className="sensor-value">
              {sensorData.servo !== null ? (sensorData.servo === 0 ? 'Closed' : sensorData.servo === 90 ? 'Open' : `${sensorData.servo}°`) : '--'}
            </span>
          </div>
        </div>
        
        <div className="sensor-card">
          <span className="sensor-icon">💨</span>
          <div className="sensor-info">
            <span className="sensor-label">Smoke Level</span>
            <span className={`sensor-value ${sensorData.smoke_level > 0 ? 'flame-detected' : 'flame-safe'}`}>
              {sensorData.smoke_level !== null ? sensorData.smoke_level : '--'}
            </span>
          </div>
        </div>
      </div>

      <div className="master-controls">
        <button
          className="master-button on"
          onClick={turnAllOn}
        >
          All Lights On
        </button>
        <button
          className="master-button off"
          onClick={turnAllOff}
        >
          All Lights Off
        </button>
      </div>

      <div className="controls">
        {/* Fan Control */}
        <div className={`room ${sensorData.fan === 1 ? 'active' : ''}`}>
          <h2 className="room-name">Fan</h2>
          <Switch isOn={sensorData.fan === 1 ? "1" : "0"} onToggle={() => toggleFan(sensorData.fan === 1 ? 0 : 1)} />
        </div>

        {/* Room Light Control */}
        <div className={`room ${sensorData.room_light === 1 ? 'active' : ''}`}>
          <h2 className="room-name">Room Light</h2>
          <Switch isOn={sensorData.room_light === 1 ? "1" : "0"} onToggle={() => toggleRoomLight(sensorData.room_light === 1 ? 0 : 1)} />
        </div>

        {/* Gate Control */}
        <div className={`room ${sensorData.servo === 90 ? 'active' : ''}`}>
          <h2 className="room-name">Gate</h2>
          <Switch isOn={sensorData.servo === 90 ? "1" : "0"} onToggle={() => setGatePosition(sensorData.servo === 90 ? 0 : 90)} />
        </div>
      </div>

      <div className="voice-section">
        <h2>Voice Commands</h2>
        
        {/* Language Selector */}
        <div className="language-selector">
          <label htmlFor="language-select">
            <span className="language-label">🌐 Select Language:</span>
          </label>
          <select 
            id="language-select"
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-dropdown"
          >
            {Object.entries(languages).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <p>Click the microphone button and try saying:</p>
        <ul className="command-examples">
          {selectedLanguage === 'en-US' && (
            <>
              <li>"🌪️ Turn on fan"</li>
              <li>"🌪️ Turn off fan"</li>
              <li>"💡 Turn on light"</li>
              <li>"💡 Turn off light"</li>
              <li>"🚪 Open gate"</li>
              <li>"🚪 Close gate"</li>
            </>
          )}
          {selectedLanguage === 'kn-IN' && (
            <>
              <li>"🌪️ ಫ್ಯಾನ್ ಆನ್ ಮಾಡಿ"</li>
              <li>"🌪️ ಫ್ಯಾನ್ ಆಫ್ ಮಾಡಿ"</li>
              <li>"💡 ಬೆಳಕು ಹಚ್ಚು"</li>
              <li>"💡 ಬೆಳಕು ಆರಿಸು"</li>
              <li>"🚪 ಗೇಟ್ ತೆರೆ"</li>
              <li>"🚪 ಗೇಟ್ ಮುಚ್ಚು"</li>
            </>
          )}
          {selectedLanguage === 'hi-IN' && (
            <>
              <li>"🌪️ पंखा चालू करो"</li>
              <li>"🌪️ पंखा बंद करो"</li>
              <li>"💡 लाइट चालू करो"</li>
              <li>"💡 लाइट बंद करो"</li>
              <li>"🚪 गेट खोलो"</li>
              <li>"🚪 गेट बंद करो"</li>
            </>
          )}
        </ul>

        <button
          onClick={startListening}
          className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
          disabled={!speechSupported || isListening}
        >
          <span className="mic-icon">🎤</span>
          {isListening ? (
            selectedLanguage === 'kn-IN' ? 'ಕೇಳುತ್ತಿದೆ...' :
            selectedLanguage === 'hi-IN' ? 'सुन रहा हूँ...' :
            'Listening...'
          ) : (
            selectedLanguage === 'kn-IN' ? 'ಧ್ವನಿ ಆದೇಶ ಪ್ರಾರಂಭಿಸಿ' :
            selectedLanguage === 'hi-IN' ? 'वॉयस कमांड शुरू करें' :
            'Start Voice Command'
          )}
        </button>
      </div>

      {currentNotification && (
        <div className="notification">
          {currentNotification}
        </div>
      )}
    </div>
  );
};

export default SmartHomeInterface;
