const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Ensure embedColor is imported

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play a game of Tic-Tac-Toe against the bot!'),
  execute: async (interaction) => {
    const emptyBoard = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    let board = [...emptyBoard];
    let currentPlayer = 'X'; // Player starts as 'X'
    const playerMarker = 'X';
    const aiMarker = 'O';

    const emojis = {
      ' ': '⬛', 'X': '❌', 'O': '⭕'
    };

    const createBoardEmbed = () => {
      const boardString = board.map(cell => emojis[cell]).join('');
      const formattedBoard = `${boardString.slice(0, 3)}\n${boardString.slice(3, 6)}\n${boardString.slice(6, 9)}`;

      return new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('Tic-Tac-Toe')
        .setDescription(`**Current Player: ${currentPlayer === playerMarker ? 'You 👤' : 'Bot 🤖'}**\n\n${formattedBoard}`)
        .setFooter({ text: 'Use the dropdown menu to make your move.' });
    };

    const createSelectMenu = () => {
      const options = board.map((cell, index) => {
        if (cell === ' ') {
          const row = Math.floor(index / 3) + 1;
          const col = index % 3 + 1;
          return {
            label: `Row ${row}, Col ${col}`,
            value: `${index}`,
            description: `Choose the cell at row ${row}, col ${col}`,
            emoji: '⬛'
          };
        }
        return null;
      }).filter(option => option !== null);

      return new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Choose your move...')
            .addOptions(options)
        );
    };

    const checkWin = (board) => {
      const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
      ];

      for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    };

    const checkTie = (board) => {
      return board.every(cell => cell !== ' ');
    };

    const makeAIMove = async () => {
      const emptyIndexes = board
        .map((cell, index) => (cell === ' ' ? index : null))
        .filter(index => index !== null);

      const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
      board[randomIndex] = aiMarker;

      // Add a delay for the AI's move
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    const updateGame = async (i) => {
      await i.deferUpdate(); // Defer the update to prevent interaction timeout

      const index = parseInt(i.values[0]);
      board[index] = playerMarker;

      let winner = checkWin(board);
      let isTie = checkTie(board);

      if (winner || isTie) {
        const resultEmbed = new EmbedBuilder()
          .setColor(embedColor)
          .setTitle('Tic-Tac-Toe - Game Over')
          .setDescription(winner ? `**${winner === playerMarker ? 'You 👤' : 'Bot 🤖'} win!**\n\n${createBoardEmbed().data.description}` : `**It's a tie!**\n\n${createBoardEmbed().data.description}`)
          .setFooter({ text: 'Thanks for playing!' });

        await interaction.editReply({ embeds: [resultEmbed], components: [], ephemeral: true });

        // Send a follow-up message with the result
        if (winner) {
          await interaction.followUp({ content: winner === playerMarker ? 'Congratulations! You win! 🎉' : 'Sorry, you lose. The bot wins. 🤖', ephemeral: true });
        } else {
          await interaction.followUp({ content: 'It\'s a tie! Well played! 🤝', ephemeral: true });
        }

        return true; // Game over
      } else {
        currentPlayer = aiMarker;
        await interaction.editReply({ embeds: [createBoardEmbed()], components: [], ephemeral: true });

        await makeAIMove();
        currentPlayer = playerMarker;

        winner = checkWin(board);
        isTie = checkTie(board);

        if (winner || isTie) {
          const resultEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('Tic-Tac-Toe - Game Over')
            .setDescription(winner ? `**${winner === playerMarker ? 'You 👤' : 'Bot 🤖'} win!**\n\n${createBoardEmbed().data.description}` : `**It's a tie!**\n\n${createBoardEmbed().data.description}`)
            .setFooter({ text: 'Thanks for playing!' });

          await interaction.editReply({ embeds: [resultEmbed], components: [], ephemeral: true });

          // Send a follow-up message with the result
          if (winner) {
            await interaction.followUp({ content: winner === playerMarker ? 'Congratulations! You win! 🎉' : 'Sorry, you lose. The bot wins. 🤖', ephemeral: true });
          } else {
            await interaction.followUp({ content: 'It\'s a tie! Well played! 🤝', ephemeral: true });
          }

          return true; // Game over
        }
        await interaction.editReply({ embeds: [createBoardEmbed()], components: [createSelectMenu()], ephemeral: true });
        return false; // Game continues
      }
    };

    if (currentPlayer === aiMarker) {
      await interaction.reply({ embeds: [createBoardEmbed()], components: [], ephemeral: true });
      await makeAIMove();
      currentPlayer = playerMarker;
    }
    
    await interaction.reply({ embeds: [createBoardEmbed()], components: [createSelectMenu()], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      const gameEnded = await updateGame(i);
      if (gameEnded) collector.stop();
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({ content: 'Time is up! No moves were made in time.', embeds: [], components: [], ephemeral: true });
      }
    });
  }
};
