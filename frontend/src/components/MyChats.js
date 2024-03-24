import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { Divider } from "@chakra-ui/react";
import { Circle } from "@chakra-ui/react";
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Conversations


      </Box> */}

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#0f1628"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        <div style={{ paddingTop: '2%', paddingBottom: '2%', display: 'unset', flexDirection: 'row' }}>
          <GroupChatModal>
            <Flex justifyContent="space-between" alignItems="center" w="100%">
              <Text color={'#efefef'} fontSize={{ base: "17px", md: "10px", lg: "17px" }}>
                Spaces
              </Text>
              <Button
                display="flex"
                alignItems="center"
                fontSize={{ base: "15px", md: "10px", lg: "15px" }}
                background={'transparent'}
                color={'#efefef'}
                _hover={{ bg: 'transparent' }} // Remove hover effect
              >
                <Circle size="24px" bg="transparent" border="2px" borderRadius="15px">
                  <AddIcon bg="transparent" borderRadius={'full'} />
                </Circle>
              </Button>
            </Flex>
          </GroupChatModal>
        </div>

        {chats ? (
          <Stack overflowY="scroll">
            {chats.filter(chat => chat.isGroupChat).map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#efefef" : "#151f36"}
                color={selectedChat === chat ? "#151f36" : "#efefef"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {"# " + chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
            <Divider /> {/* Divider between group chats and one-to-one chats */}
            <Text color={'#efefef'} fontSize={{ base: "17px", md: "10px", lg: "17px" }}>
               Direct Messages
              </Text>
            {chats.filter(chat => !chat.isGroupChat).map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#efefef" : "#151f36"}
                color={selectedChat === chat ? "#151f36" : "#efefef"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {getSender(loggedUser, chat.users)}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
