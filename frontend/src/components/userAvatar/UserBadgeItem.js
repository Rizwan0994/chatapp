import { Box, Flex, Text, IconButton,Tag } from "@chakra-ui/react";
import { CloseIcon, ChatIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import { useDisclosure } from "@chakra-ui/hooks";
import axios from "axios";
import { useState } from "react";
import { useToast } from "@chakra-ui/toast";

const UserCardItem = ({ guser,isAdmin ,groupAdminId, handleRemove}) => {
  const loginuser = JSON.parse(localStorage.getItem("userInfo"));

  const {
    setSelectedChat,
    notification,
    setNotification,
    user,
    chats,
    setChats,
  } = ChatState();
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
 // console.log(guser);
  const accessChat = async (userId) => {
    

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <Flex
      align="center"
      p={2}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      m={1}
      mb={2}
    >
      <Box flex="1">
        <Text>{guser.name}</Text>
        {isAdmin && <Tag
            size="sm"
            borderRadius="full"
            bg="#0f1628"
            color="white"
            fontSize="12px"
            ml={2}
          >
            Admin
          </Tag>}
      </Box>
      <IconButton
        icon={<ChatIcon />}
        onClick={() => accessChat(guser._id)}
        variant="ghost"
        colorScheme="purple"
        aria-label="Start Chat"
        mr={2}
      />
{loginuser._id === groupAdminId && (
    <IconButton
      icon={<CloseIcon />}
      onClick={() => handleRemove(guser)}
      variant="ghost"
      colorScheme="red"
      aria-label="Remove User"
    />
  )}
    </Flex>
  );
};

export default UserCardItem;
