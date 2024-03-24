//not in used
import React from "react";
import { Box, Avatar, Text, IconButton, Tooltip } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const UserListItem = ({ user, isAdmin, isGroupAdmin, onRemove }) => {
  const currentUserIsGroupAdmin = user.id === isGroupAdmin.id;

  return (
    <Box
      display="flex"
      flexDirection={'column'}
      alignItems="center"
      justifyContent="space-between"
      p={3}
      borderBottom="1px solid #E2E8F0"
      _hover={{ bgColor: "#F7FAFC" }}
    >
      <Box display="flex" alignItems="center">
        <Avatar size="sm" name={user.name} src={user.avatar} />
        <Box ml={3}>
          <Text fontWeight="bold">{user.name}</Text>
          {isGroupAdmin && (
            <Tooltip label="Group Admin" aria-label="Group Admin">
              <Text fontSize="sm" color="gray.500">
                Admin
              </Text>
            </Tooltip>
          )}
        </Box>
      </Box>
      {/* Render IconButton only if the user is admin and not the group admin */}
      {isAdmin && !currentUserIsGroupAdmin && (
        <IconButton
          icon={<CloseIcon />}
          variant="ghost"
          size="sm"
          colorScheme="red"
          aria-label="Remove user"
          onClick={() => onRemove(user)}
        />
      )}
    </Box>
  );
};

export default UserListItem;
