const { updateConfig } = require("./utils");

function handleAdmin(bot, msg, admins, subscribers) {
  const chatId = msg.chat.id;

  if (!admins.has(chatId)) {
    bot.sendMessage(
      chatId,
      "You are not authorized to access the admin panel."
    );
    return;
  }

  bot.sendMessage(
    chatId,
    `
*Admin Panel*
Here are the commands you can use:
/block userid - Block a user
/unblock userid - Unblock a user
/delete userid - Delete a user
/updateapi - Update the API keys or bot settings
/viewusers - View a list of all subscribed users
`,
    { parse_mode: "Markdown" }
  );
}

function handleBlock(bot, msg, match, subscribers) {
  const chatId = msg.chat.id;
  const userId = parseInt(match[1], 10);

  if (!subscribers.has(userId)) {
    bot.sendMessage(chatId, `User ${userId} is not subscribed.`);
  } else {
    subscribers.delete(userId);
    bot.sendMessage(chatId, `User ${userId} has been blocked.`);
  }
}

function handleUnblock(bot, msg, match, subscribers) {
  const chatId = msg.chat.id;
  const userId = parseInt(match[1], 10);

  if (subscribers.has(userId)) {
    bot.sendMessage(chatId, `User ${userId} is already unblocked.`);
  } else {
    subscribers.set(userId, { subscribed: true, city: "Unknown" });
    bot.sendMessage(chatId, `User ${userId} has been unblocked.`);
  }
}

function handleDelete(bot, msg, match, subscribers) {
  const chatId = msg.chat.id;
  const userId = parseInt(match[1], 10);

  if (!subscribers.has(userId)) {
    bot.sendMessage(chatId, `User ${userId} is not in the system.`);
  } else {
    subscribers.delete(userId);
    bot.sendMessage(chatId, `User ${userId} has been permanently deleted.`);
  }
}

function handleUpdateApi(bot, msg, admins) {
  const chatId = msg.chat.id;

  if (!admins.has(chatId)) {
    bot.sendMessage(chatId, "You are not authorized to update the API keys.");
    return;
  }

  bot.sendMessage(
    chatId,
    "Please send the updated API keys in the format:\n`KEY_NAME=NEW_VALUE`",
    {
      parse_mode: "Markdown",
    }
  );

  // Listen for the next message only from the same admin
  bot.once("message", (response) => {
    // Ensure the response is from the same user
    if (response.chat.id !== chatId) return;

    const [key, value] = response.text.split("=");
    if (key && value) {
      try {
        // Update the configuration
        updateConfig(key.trim(), value.trim());

        // Notify the admin about the successful update
        bot.sendMessage(
          chatId,
          `The setting *${key}* has been updated successfully.`,
          {
            parse_mode: "Markdown",
          }
        );
      } catch (error) {
        // Handle any errors from `updateConfig`
        bot.sendMessage(
          chatId,
          `An error occurred while updating: ${error.message}`
        );
      }
    } else {
      // Inform the user about incorrect format
      bot.sendMessage(
        chatId,
        "Invalid format. Please use the format: `KEY_NAME=NEW_VALUE`",
        { parse_mode: "Markdown" }
      );
    }
  });
}


function handleViewUsers(bot, msg, subscribers) {
  const chatId = msg.chat.id;

  if (!subscribers.size) {
    bot.sendMessage(chatId, "No users are currently subscribed.");
    return;
  }

  let userList = "*Subscribed Users:*\n";
  for (const [userId, { city }] of subscribers.entries()) {
    userList += `ID: ${userId}, City: ${city || "Unknown"}\n`;
  }

  bot.sendMessage(chatId, userList, { parse_mode: "Markdown" });
}

module.exports = {
  handleAdmin,
  handleBlock,
  handleUnblock,
  handleDelete,
  handleUpdateApi,
  handleViewUsers,
};
