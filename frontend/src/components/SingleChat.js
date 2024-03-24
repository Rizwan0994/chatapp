// import { FormControl } from "@chakra-ui/form-control";
// import { Input } from "@chakra-ui/input";
// import { Box, Text } from "@chakra-ui/layout";
// import { Flex } from "@chakra-ui/layout";
// import { Alert, AlertIcon } from "@chakra-ui/react";
// import "./styles.css";
// import { IconButton, Spinner, useToast } from "@chakra-ui/react";
// import { getSender, getSenderFull } from "../config/ChatLogics";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { ArrowBackIcon, PhoneIcon } from "@chakra-ui/icons";
// import { BsCameraVideo } from "react-icons/bs";
// import ProfileModal from "./miscellaneous/ProfileModal";
// import { ChatState } from "../Context/ChatProvider";
// import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
// import ScrollableChat from "./ScrollableChat";
// import io from "socket.io-client";
// import Lottie from "react-lottie";
// import animationData from "../animations/typing.json";
// import { Progress } from "@chakra-ui/react";
// import { ChatIcon } from '@chakra-ui/icons';
// const ENDPOINT = "http://localhost:5000/";
// let socket, selectedChatCompare;

// const SingleChat = ({ fetchAgain, setFetchAgain }) => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileUrl, setFileUrl] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [istyping, setIsTyping] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const toast = useToast();

//  const { selectedChat, setSelectedChat, user, notification, setNotification } =
//     ChatState();

//   const defaultOptions = {
//     loop: true,
//     autoplay: true,
//     animationData: animationData,
//     rendererSettings: {
//       preserveAspectRatio: "xMidYMid slice",
//     },
//   };

//   //for socket get initallize first we put this use effect at the top
//   useEffect(() => {
//     socket = io(ENDPOINT);
//     socket.emit("setup", user);
//     socket.on("connected", () => setSocketConnected(true));
//     socket.on("typing", () => setIsTyping(true));
//     socket.on("stop typing", () => setIsTyping(false));
//   }, []);

//   const fetchMessages = async () => {
//     if (!selectedChat) return;

//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       };

//       setLoading(true);

//       const { data } = await axios.get(
//         `/api/message/${selectedChat._id}`,
//         config
//       );
//       setMessages(data);
//       setLoading(false);
//       socket.emit("join chat", selectedChat._id);
//     } catch (error) {
//       toast({
//         title: "Error Occured!",
//         description: "Failed to Load the Messages",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//         position: "bottom",
//       });
//     }
//   };

//   const typingHandler = (e) => {
//     setNewMessage(e.target.value);

//     if (!socketConnected) return;

//     if (!typing) {
//       setTyping(true);
//       socket.emit("typing", selectedChat._id);
//     }
//     let lastTypingTime = new Date().getTime();
//     let timerLength = 3000;
//     setTimeout(() => {
//       let timeNow = new Date().getTime();
//       let timeDiff = timeNow - lastTypingTime;
//       if (timeDiff >= timerLength && typing) {
//         socket.emit("stop typing", selectedChat._id);
//         setTyping(false);
//       }
//     }, timerLength);
//   };
//   const uploadFile = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const config = {
//       headers: {
//         'Content-type': 'multipart/form-data',
//         Authorization: `Bearer ${user.token}`,
//       },
//       onUploadProgress: (progressEvent) => {
//         // Limit the reported progress to 90%
//         const progress = Math.round((progressEvent.loaded * 90) / progressEvent.total);
//         setUploadProgress(progress);
//       },
//     };

//     const { data } = await axios.post("/api/message/attachment", formData, config);
//     return data.fileUrl;
//   };
//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     const maxSize = 10485760; // 10 MB

//     if (file && file.size > maxSize) {
//       alert('File size too large. Maximum is 10 MB.');
//       return;
//     }

//     setIsUploading(true);
//     if (file) {
//       setSelectedFile(file);
//       const fileUrl = await uploadFile(file);
//       setFileUrl(fileUrl);
//       //alert('File attached successfully! Press Enter to send the message.');
//     }
//     setIsUploading(false);
//   };
//   const sendMessage = async (event) => {
//     if (event.key === "Enter" && (newMessage || fileUrl)) {

//       try {
//         const config = {
//           headers: {
//             "Content-type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//         };
//         setNewMessage("");
//         setSelectedFile(null);
//         const { data } = await axios.post(
//           "/api/message",
//           {
//             content: newMessage,
//             chatId: selectedChat,
//             fileUrl: fileUrl,
//           },
//           config
//         );
//         socket.emit("new message", data);
//         setMessages([...messages, data]);

//       } catch (error) {
//         toast({
//           title: "Error Occured!",
//           description: "Failed to send the Message",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//           position: "bottom",
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     selectedChatCompare = selectedChat;
//   }, [selectedChat]);

//   useEffect(() => {
//     socket.on("message recieved", (newMessageRecieved) => {
//       if (
//         !selectedChatCompare || // if chat is not selected or doesn't match current chat
//         selectedChatCompare._id !== newMessageRecieved.chat._id
//       ) {
//         if (!notification.includes(newMessageRecieved)) {
//           setNotification([newMessageRecieved, ...notification]);
//           setFetchAgain(!fetchAgain);
//         }
//       } else {
//         setMessages([...messages, newMessageRecieved]);
//       }
//     });
//   });

//   return (
//     <>
//       {selectedChat ? (
//         <>
//           <Text
//             fontSize={{ base: "18px", md: "20px" }}
//             pb={3}
//             px={2}
//             w="100%"
//             fontFamily="Work sans"
//             display="flex"
//             justifyContent={{ base: "space-between" }}
//             alignItems="center"
//           >
//             <IconButton
//               display={{ base: "flex", md: "none" }}
//               icon={<ArrowBackIcon />}
//               onClick={() => setSelectedChat("")}
//             />

//             {!selectedChat.isGroupChat ? (
//               <>
//                 {getSender(user, selectedChat.users)}
//                 <div style={{display:'flex', columnGap:'3rem',marginRight:'1rem',alignItems:'center'}}>
//                   <ProfileModal user={getSenderFull(user, selectedChat.users)} />
//                 <PhoneIcon />
//                 <BsCameraVideo />
//                 </div>

//               </>
//             ) : (
//               <>
//                 {'# '}{selectedChat.chatName}
//                 <div style={{display:'flex', columnGap:'3rem',marginRight:'1rem',alignItems:'center'}}>
//                 <UpdateGroupChatModal
//                   fetchMessages={fetchMessages}
//                   fetchAgain={fetchAgain}
//                   setFetchAgain={setFetchAgain}
//                 />
//                 <PhoneIcon />
//                 <BsCameraVideo />
//                 </div>

//               </>
//             )}
//           </Text>

//           <Box
//             display="flex"
//             flexDir="column"
//             justifyContent="flex-end"
//             p={3}
//             bg="#E8E8E8"
//             w="100%"
//             h="100%"
//             borderRadius="lg"
//             overflowY="hidden"
//           >
//             {loading ? (
//               <Spinner
//                 size="xl"
//                 w={20}
//                 h={20}
//                 alignSelf="center"
//                 margin="auto"
//               />
//             ) : (
//               <div className="messages">
//                 <ScrollableChat messages={messages} />
//               </div>
//             )}

//             <FormControl
//               onKeyDown={sendMessage}
//               id="first-name"
//               isRequired
//               mt={3}
//             >
//               {istyping ? (
//                 <div>
//                   <Lottie
//                     options={defaultOptions}
//                     width={70}
//                     style={{ marginBottom: 15, marginLeft: 0 }}
//                   />
//                   typing...
//                 </div>
//               ) : (
//                 <></>
//               )}
//               <Flex direction="row" align="center">
//                 <label htmlFor="file-upload" style={{ cursor: 'pointer', marginRight: '10px' }}>
//                   <i className="fas fa-paperclip"></i>
//                 </label>
//                 <input
//                   id="file-upload"
//                   type="file"
//                   accept="image/png,image/jpeg,video/mp4"
//                   style={{ display: 'none' }}
//                   onChange={handleFileChange}
//                 />

//                 <Input
//                   variant="filled"
//                   bg="#E0E0E0"
//                   placeholder="Enter a message.."
//                   value={newMessage}
//                   onChange={typingHandler}
//                   flex="1"
//                   isDisabled={isUploading}
//                 />

//               </Flex>
//               {selectedFile &&
//                 <Box ml={2} mt={2}>

//                   <span>File Attached: </span> <span>{selectedFile.name}</span>
//                 </Box>
//               }
//               {isUploading &&
//                 <Box>
//                   <Progress value={uploadProgress} isIndeterminate={uploadProgress === 0} />
//                   <Alert status="info">
//                     <AlertIcon />
//                     File is uploading...
//                   </Alert>
//                 </Box>
//               }
//             </FormControl>
//           </Box>
//         </>
//       ) : (
//         <Box display="flex" alignItems="center" justifyContent="center" h="100%" gap={2}>
//           <ChatIcon boxSize="3em" /> {/* Adjust size as needed */}
//           <Text fontSize="3xl" pb={3} fontFamily="Work sans" fontWeight={600}>
//             Start chatting on Vibex.
//           </Text>
//         </Box>
//       )}
//     </>
//   );
// };

// export default SingleChat;

//...........................call feature...............................................
// import { FormControl } from "@chakra-ui/form-control";
// import { Input } from "@chakra-ui/input";
// import { Box, Text } from "@chakra-ui/layout";
// import { Flex } from "@chakra-ui/layout";
// import { Alert, AlertIcon } from "@chakra-ui/react";
// import { IconButton, Spinner, useToast } from "@chakra-ui/react";
// import { getSender, getSenderFull } from "../config/ChatLogics";
// import { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { ArrowBackIcon, PhoneIcon, CheckIcon } from "@chakra-ui/icons";
// import { BsCameraVideo } from "react-icons/bs";
// import ProfileModal from "./miscellaneous/ProfileModal";
// import { ChatState } from "../Context/ChatProvider";
// import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
// import ScrollableChat from "./ScrollableChat";
// import io from "socket.io-client";
// import Lottie from "react-lottie";
// import animationData from "../animations/typing.json";
// import { Progress } from "@chakra-ui/react";
// import { ChatIcon } from '@chakra-ui/icons';

// const ENDPOINT = "http://localhost:5000/";
// let socket, selectedChatCompare, peerConnection;

// const SingleChat = ({ fetchAgain, setFetchAgain }) => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileUrl, setFileUrl] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [isCalling, setIsCalling] = useState(false);
//   const [isInCall, setIsInCall] = useState(false);
//   const [istyping, setIsTyping] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const toast = useToast();

//   const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

//   const defaultOptions = {
//     loop: true,
//     autoplay: true,
//     animationData: animationData,
//     rendererSettings: {
//       preserveAspectRatio: "xMidYMid slice",
//     },
//   };

//   const localVideoRef = useRef({});
//   const remoteVideoRef = useRef({});

//   useEffect(() => {
//     socket = io(ENDPOINT);
//     socket.emit("setup", user);
//     socket.on("connected", () => setSocketConnected(true));
//     socket.on("typing", () => setIsTyping(true));
//     socket.on("stop typing", () => setIsTyping(false));
//     socket.on("voice call initiated", () => {
//       setIsCalling(true);
//       answerCall();
//     });
//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (selectedChat && isInCall) {
//       initiateCall();
//     }
//   }, [selectedChat, isInCall]);

//   const fetchMessages = async () => {
//     if (!selectedChat) return;
//     try {
//       const config = {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       };
//       setLoading(true);
//       const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
//       setMessages(data);
//       setLoading(false);
//       socket.emit("join chat", selectedChat._id);
//     } catch (error) {
//       toast({
//         title: "Error Occurred!",
//         description: "Failed to Load the Messages",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//         position: "bottom",
//       });
//     }
//   };

//   const typingHandler = (e) => {
//     setNewMessage(e.target.value);

//     if (!socketConnected) return;

//     if (!typing) {
//       setTyping(true);
//       socket.emit("typing", selectedChat._id);
//     }
//     let lastTypingTime = new Date().getTime();
//     let timerLength = 3000;
//     setTimeout(() => {
//       let timeNow = new Date().getTime();
//       let timeDiff = timeNow - lastTypingTime;
//       if (timeDiff >= timerLength && typing) {
//         socket.emit("stop typing", selectedChat._id);
//         setTyping(false);
//       }
//     }, timerLength);
//   };

//   const uploadFile = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const config = {
//       headers: {
//         'Content-type': 'multipart/form-data',
//         Authorization: `Bearer ${user.token}`,
//       },
//       onUploadProgress: (progressEvent) => {
//         // Limit the reported progress to 90%
//         const progress = Math.round((progressEvent.loaded * 90) / progressEvent.total);
//         setUploadProgress(progress);
//       },
//     };

//     const { data } = await axios.post("/api/message/attachment", formData, config);
//     return data.fileUrl;
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     const maxSize = 10485760; // 10 MB

//     if (file && file.size > maxSize) {
//       alert('File size too large. Maximum is 10 MB.');
//       return;
//     }

//     setIsUploading(true);
//     if (file) {
//       setSelectedFile(file);
//       const fileUrl = await uploadFile(file);
//       setFileUrl(fileUrl);
//     }
//     setIsUploading(false);
//   };

//   const sendMessage = async (event) => {
//     if (event.key === "Enter" && (newMessage || fileUrl)) {
//       try {
//         const config = {
//           headers: {
//             "Content-type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//         };
//         setNewMessage("");
//         setSelectedFile(null);
//         const { data } = await axios.post(
//           "/api/message",
//           {
//             content: newMessage,
//             chatId: selectedChat._id,
//             fileUrl: fileUrl,
//           },
//           config
//         );
//         socket.emit("new message", data);
//         setMessages([...messages, data]);
//       } catch (error) {
//         toast({
//           title: "Error Occurred!",
//           description: "Failed to send the Message",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//           position: "bottom",
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     selectedChatCompare = selectedChat;
//   }, [selectedChat]);

//   useEffect(() => {
//     socket.on("message received", (newMessageReceived) => {
//       if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
//         if (!notification.includes(newMessageReceived)) {
//           setNotification([newMessageReceived, ...notification]);
//           setFetchAgain(!fetchAgain);
//         }
//       } else {
//         setMessages([...messages, newMessageReceived]);
//       }
//     });
//     return () => {
//       socket.off("message received");
//     };
//   }, [messages]);

//   const handleTrack = (event) => {
//     console.log("Track received:", event);
//     remoteVideoRef.current.srcObject = event.streams[0];
//   };

//   const handleICECandidate = (event) => {
//     if (event.candidate) {
//       socket.emit("candidate", {
//         candidate: event.candidate,
//         chatId: '65f86f0326076e0d4504d1ba',
//       });
//     }
//   };

//   const startCall = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       console.log("Media stream obtained:", stream);
//       if (peerConnection.signalingState !== "closed") {
//         stream.getTracks().forEach(track => {
//           peerConnection.addTrack(track, stream);
//           console.log("Track added:", track);
//         });
//       }
//       localVideoRef.current.srcObject = stream;
//       setIsInCall(true);
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//       toast({
//         title: "Error",
//         description: "Failed to access media devices. Please allow access and try again.",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//         position: "bottom",
//       });
//     }
//   };

//   useEffect(() => {
//     peerConnection = new RTCPeerConnection();
//     peerConnection.onicecandidate = handleICECandidate;
//     peerConnection.ontrack = handleTrack;

//     socket.on("incoming call", (offer) => {
//       setIsCalling(true);
//       handleIncomingCall(offer);
//     });

//     return () => {
//       peerConnection.close();
//       socket.off("incoming call");
//     };
//   }, []);

//   const handleIncomingCall = async (offer) => {
//     try {
//       await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);
//       socket.emit("answer", {
//         answer,
//         chatId: '65f86f0326076e0d4504d1ba',
//       });
//     } catch (error) {
//       console.error("Error handling incoming call:", error);
//     }
//   };

//   const answerCall = async () => {
//     try {
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);
//       socket.emit("answer", {
//         answer,
//         chatId: '65f86f0326076e0d4504d1ba',
//       });
//     } catch (error) {
//       console.error("Error answering call:", error);
//     }
//   };

//   const initiateCall = async () => {
//     try {
//       if (peerConnection.signalingState !== "closed") {
//         const offer = await peerConnection.createOffer();
//         await peerConnection.setLocalDescription(offer);
//         socket.emit("call", {
//           offer,
//           chatId: '65f86f0326076e0d4504d1ba',
//         });
//       } else {
//         console.error("RTCPeerConnection is closed. Cannot initiate call.");
//       }
//     } catch (error) {
//       console.error("Error initiating call:", error);
//     }
//   };

//   const endCall = () => {
//     setIsInCall(false);
//   };

//   return (
//     <>
//       {isCalling && <video ref={localVideoRef} autoPlay muted />}
//       {isInCall && <video ref={remoteVideoRef} autoPlay />}
//       {selectedChat ? (
//         <>
//           <Text
//             fontSize={{ base: "18px", md: "20px" }}
//             pb={3}
//             px={2}
//             w="100%"
//             fontFamily="Work sans"
//             display="flex"
//             justifyContent={{ base: "space-between" }}
//             alignItems="center"
//           >
//             <IconButton
//               display={{ base: "flex", md: "none" }}
//               icon={<ArrowBackIcon />}
//               onClick={() => setSelectedChat("")}
//             />
//             {!selectedChat.isGroupChat ? (
//               <>
//                 {getSender(user, selectedChat.users)}
//                 <div style={{ display: 'flex', columnGap: '3rem', marginRight: '1rem', alignItems: 'center' }}>
//                   <ProfileModal user={getSenderFull(user, selectedChat.users)} />
//                   {!isInCall && <IconButton icon={<PhoneIcon />} onClick={startCall} />}
//                   {isInCall && <IconButton icon={<CheckIcon />} onClick={endCall} />}
//                 </div>
//               </>
//             ) : (
//               <>
//                 {'# '}{selectedChat.chatName}
//                 <div style={{ display: 'flex', columnGap: '3rem', marginRight: '1rem', alignItems: 'center' }}>
//                   <UpdateGroupChatModal
//                     fetchMessages={fetchMessages}
//                     fetchAgain={fetchAgain}
//                     setFetchAgain={setFetchAgain}
//                   />
//                   {!isInCall && <IconButton icon={<PhoneIcon />} onClick={startCall} />}
//                   {isInCall && <IconButton icon={<CheckIcon />} onClick={endCall} />}
//                 </div>
//               </>
//             )}
//           </Text>

//           <Box
//             display="flex"
//             flexDir="column"
//             justifyContent="flex-end"
//             p={3}
//             bg="#E8E8E8"
//             w="100%"
//             h="100%"
//             borderRadius="lg"
//             overflowY="hidden"
//           >
//             {loading ? (
//               <Spinner
//                 size="xl"
//                 w={20}
//                 h={20}
//                 alignSelf="center"
//                 margin="auto"
//               />
//             ) : (
//               <div className="messages">
//                 <ScrollableChat messages={messages} />
//               </div>
//             )}

//             <FormControl
//               onKeyDown={sendMessage}
//               id="first-name"
//               isRequired
//               mt={3}
//             >
//               {istyping ? (
//                 <div>
//                   <Lottie
//                     options={defaultOptions}
//                     width={70}
//                     style={{ marginBottom: 15, marginLeft: 0 }}
//                   />
//                   typing...
//                 </div>
//               ) : (
//                 <></>
//               )}
//               <Flex direction="row" align="center">
//                 <label htmlFor="file-upload" style={{ cursor: 'pointer', marginRight: '10px' }}>
//                   <i className="fas fa-paperclip"></i>
//                 </label>
//                 <input
//                   id="file-upload"
//                   type="file"
//                   accept="image/png,image/jpeg,video/mp4"
//                   style={{ display: 'none' }}
//                   onChange={handleFileChange}
//                 />

//                 <Input
//                   variant="filled"
//                   bg="#E0E0E0"
//                   placeholder="Enter a message.."
//                   value={newMessage}
//                   onChange={typingHandler}
//                   flex="1"
//                   isDisabled={isUploading}
//                 />

//               </Flex>
//               {selectedFile &&
//                 <Box ml={2} mt={2}>
//                   <span>File Attached: </span> <span>{selectedFile.name}</span>
//                 </Box>
//               }
//               {isUploading &&
//                 <Box>
//                   <Progress value={uploadProgress} isIndeterminate={uploadProgress === 0} />
//                   <Alert status="info">
//                     <AlertIcon />
//                     File is uploading...
//                   </Alert>
//                 </Box>
//               }
//             </FormControl>
//           </Box>
//         </>
//       ) : (
//         <Box display="flex" alignItems="center" justifyContent="center" h={20} mt={20}>
//         <Text>Please select a chat to start messaging</Text>
//       </Box>
//     )}

//     {notification.length > 0 && (
//       <Box position="fixed" bottom="20px" right="20px" zIndex="100">
//         <IconButton
//           aria-label="Chat Notification"
//           icon={<ChatIcon />}
//           size="lg"
//           onClick={() => setNotification([])}
//         />
//       </Box>
//     )}
//   </>
// );
// };

// export default SingleChat;

//old video call.....................

import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/layout";
import { Alert, AlertIcon } from "@chakra-ui/react";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, PhoneIcon } from "@chakra-ui/icons";
import { BsCameraVideo } from "react-icons/bs";
import ProfileModal from "./miscellaneous/ProfileModal";
import { ChatState } from "../Context/ChatProvider";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import { isSameUser } from "../config/ChatLogics";
import animationData from "../animations/typing.json";
import { Progress } from "@chakra-ui/react";
import { ChatIcon } from "@chakra-ui/icons";
const ENDPOINT = "http://localhost:5000/";

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
  //...new
  const [calling, setCalling] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [callStatus, setCallStatus] = useState(""); // "calling", "rejected", or ""
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const userVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  //for socket get initallize first we put this use effect at the top
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("incomingCall", (callerId) => {
      // Pass the callerId to the handleIncomingCall function
      console.log("caller id socekt:", callerId);
      handleIncomingCall(callerId);
    });
  }, []);
  useEffect(() => {
    if (calling && localStream) {
      initiatePeerConnection();
    }
  }, [calling, localStream]);

  const initiatePeerConnection = () => {
    // Initialize peer connection and add local stream
    const peerConnection = new RTCPeerConnection();
    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));
    // Event handler for receiving remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Create offer and set local description
    peerConnection
      .createOffer()
      .then((offer) => {
        peerConnection.setLocalDescription(offer);
        // Emit offer to the recipient
        socket.emit("call", {
          callerId: user._id,
          recipientId: selectedChat._id,
          offer,
        });
      })
      .catch((error) => {
        console.error("Error creating offer:", error);
      });
  };
  const handleIncomingCall = (callerId) => {
    // Check if the caller ID matches the current user's ID

    if (callerId !== user._id) {
      // Only display incoming call screen if the call is for a different user
      console.log("incomming call-->:", callerId);
      setShowIncomingCall(true);
    }
    if (callerId !== user._id) {
      // Display incoming call UI only if the call is for a different user
      setCalling(true);
    }
  };

  const initiateCall = () => {
    // Ask for permission to access media devices
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        userVideoRef.current.srcObject = stream;
        setCallStatus("calling");
        setCalling(true);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        if (error.name === "PermissionDeniedError") {
          setPermissionDenied(true);
          toast({
            title: "Permission Denied",
            description: "Please allow access to your camera and microphone.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      });
  };
  const acceptCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        userVideoRef.current.srcObject = stream;
        setCallStatus("");
        const peerConnection = new RTCPeerConnection();
        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));
        peerConnection.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          remoteVideoRef.current.srcObject = event.streams[0];
        };
        peerConnection
          .createAnswer()
          .then((answer) => {
            peerConnection.setLocalDescription(answer);
            socket.emit("answer", { callerId: selectedChat._id, answer });
          })
          .catch((error) => {
            console.error("Error creating answer:", error);
          });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  const rejectCall = () => {
    // Handle rejecting the call
    setCallStatus("rejected");
    setCalling(false);
  };

  const endCall = () => {
    // Emit event to notify server that the call has ended
    socket.emit("endCall", { recipientId: selectedChat._id });
    // Stop local media stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    // Stop remote media stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
    // Reset calling state and call status
    setCalling(false);
    setCallStatus("");
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "Content-type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`,
      },
      onUploadProgress: (progressEvent) => {
        // Limit the reported progress to 90%
        const progress = Math.round(
          (progressEvent.loaded * 90) / progressEvent.total
        );
        setUploadProgress(progress);
      },
    };

    const { data } = await axios.post(
      "/api/message/attachment",
      formData,
      config
    );
    return data.fileUrl;
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const maxSize = 10485760; // 10 MB

    if (file && file.size > maxSize) {
      alert("File size too large. Maximum is 10 MB.");
      return;
    }

    setIsUploading(true);
    if (file) {
      setSelectedFile(file);
      const fileUrl = await uploadFile(file);
      setFileUrl(fileUrl);
      //alert('File attached successfully! Press Enter to send the message.');
    }
    setIsUploading(false);
  };
  const sendMessage = async (event) => {
    if (event.key === "Enter" && (newMessage || fileUrl)) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        setSelectedFile(null);
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
            fileUrl: fileUrl,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "45%",
          right: "20%", // Adjusted to move the screen to the right side
          display: calling || showIncomingCall ? "block" : "none",
          textAlign: "center",
          zIndex: "999",
        }}
      >
        {localStream && ( // Display local video stream only when available
          <div style={{ marginBottom: "10px" }}>
            <video
              ref={userVideoRef}
              autoPlay
              muted
              style={{ maxWidth: "100%", maxHeight: "350px" }}
            ></video>
          </div>
        )}
        {remoteStream && ( // Display remote video stream only when available
          <div style={{ marginBottom: "10px" }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "350px" }}
            ></video>
          </div>
        )}
        {!remoteStream &&
          !localStream &&
          showIncomingCall && ( // Show ringing UI only when no streams available and showIncomingCall is true
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Incoming Call...
              </Text>
              <Flex justify="center">
                <IconButton
                  onClick={acceptCall}
                  icon={<PhoneIcon />}
                  colorScheme="green"
                  aria-label="Accept Call"
                  mr={4}
                />
                <IconButton
                  onClick={rejectCall}
                  icon={<PhoneIcon />}
                  colorScheme="red"
                  aria-label="Reject Call"
                />
              </Flex>
            </Box>
          )}
        {/* End Call button */}
        {localStream &&
          remoteStream && ( // Display "End Call" button when both local and remote streams are available
            <Flex justify="center" mt={4}>
              <IconButton
                onClick={endCall}
                icon={<PhoneIcon />}
                colorScheme="red"
                aria-label="End Call"
              />
            </Flex>
          )}
      </div>

      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "18px", md: "20px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <div
                  style={{
                    display: "flex",
                    columnGap: "3rem",
                    marginRight: "1rem",
                    alignItems: "center",
                  }}
                >
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                  <IconButton
                    onClick={() => {
                      if (
                        callStatus === "calling" ||
                        callStatus === "rejected"
                      ) {
                        // Stop the call
                        setLocalStream(null);
                        setCallStatus(""); // Clear call status
                      } else {
                        // Initiate the call
                        initiateCall();
                      }
                    }}
                    icon={<PhoneIcon />}
                    colorScheme={
                      callStatus === "calling" || callStatus === "rejected"
                        ? "red"
                        : "green"
                    }
                    aria-label={
                      callStatus === "calling" || callStatus === "rejected"
                        ? "End Call"
                        : "Call"
                    }
                  />

                  {/* <BsCameraVideo /> */}
                </div>
              </>
            ) : (
              <>
                {"# "}
                {selectedChat.chatName}
                <div
                  style={{
                    display: "flex",
                    columnGap: "3rem",
                    marginRight: "1rem",
                    alignItems: "center",
                  }}
                >
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                  <IconButton
                    onClick={() => {
                      if (
                        callStatus === "calling" ||
                        callStatus === "rejected"
                      ) {
                        // Stop the call
                        setLocalStream(null);
                        setCallStatus(""); // Clear call status
                      } else {
                        // Initiate the call
                        initiateCall();
                      }
                    }}
                    icon={<PhoneIcon />}
                    colorScheme={
                      callStatus === "calling" || callStatus === "rejected"
                        ? "red"
                        : "green"
                    }
                    aria-label={
                      callStatus === "calling" || callStatus === "rejected"
                        ? "End Call"
                        : "Call"
                    }
                  />

                  {/* <BsCameraVideo /> */}
                </div>
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                  typing...
                </div>
              ) : (
                <></>
              )}
              <Flex direction="row" align="center">
                <label
                  htmlFor="file-upload"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                >
                  <i className="fas fa-paperclip"></i>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/png,image/jpeg,video/mp4"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  flex="1"
                  isDisabled={isUploading}
                />
              </Flex>
              {selectedFile && (
                <Box ml={2} mt={2}>
                  <span>File Attached: </span> <span>{selectedFile.name}</span>
                </Box>
              )}
              {isUploading && (
                <Box>
                  <Progress
                    value={uploadProgress}
                    isIndeterminate={uploadProgress === 0}
                  />
                  <Alert status="info">
                    <AlertIcon />
                    File is uploading...
                  </Alert>
                </Box>
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          gap={2}
        >
          <ChatIcon boxSize="3em" /> {/* Adjust size as needed */}
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" fontWeight={600}>
            Start chatting on Vibex.
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
