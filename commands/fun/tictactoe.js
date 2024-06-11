const { SlashCommandBuilder } = require("discord.js");
const { TicTacToe } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ttt")
    .setDescription("Starts a game of Tic Tac Toe with another user")
    .addUserOption(option =>
      option
        .setName("opponent")
        .setDescription("The user you want to play against.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const opponent = interaction.options.getUser("opponent");
    if (!opponent) {
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: "Please mention the user you want to play against.",
          ephemeral: true,
        });
      } else {
        return interaction.followUp({
          content: "Please mention the user you want to play against.",
          ephemeral: true,
        });
      }
    }

    // Check if the opponent is the bot or the user themselves
    if (opponent.id === client.user.id) {
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: "You can't play against the bot!",
          ephemeral: true,
        });
      } else {
        return interaction.followUp({
          content: "You can't play against the bot!",
          ephemeral: true,
        });
      }
    } else if (opponent.id === interaction.user.id) {
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: "You can't play against yourself!",
          ephemeral: true,
        });
      } else {
        return interaction.followUp({
          content: "You can't play against yourself!",
          ephemeral: true,
        });
      }
    }

    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply();
    }

    const game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: opponent,
      embed: {
        title: "Tic Tac Toe",
        color: "#5865F2",
        statusTitle: "Status",
        overTitle: "Game Over",
      },
      emojis: {
        xButton: "❌",
        oButton: "⭕",
        blankButton: "➖",
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButtonStyle: "DANGER",
      oButtonStyle: "PRIMARY",
      turnMessage: "{emoji} | It's {player}'s turn.",
      winMessage: "{emoji} | **{player}** won the game!",
      tieMessage: "The game ended in a tie!",
      timeoutMessage: "The game ended due to inactivity.",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    await game.startGame();
    game.on("gameOver", () => {});
  },
};

