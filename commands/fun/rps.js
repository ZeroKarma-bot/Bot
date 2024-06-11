const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { embedColor } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play a best-of-three Rock, Paper, Scissors game!'),
  async execute(interaction) {
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = {
      rock: '✊',
      paper: '📰',
      scissors: '✂️'
    };

    const botWinSayings = [
      'HAHA I WON', 
      'UR BAD', 
      'Better luck next time!', 
      'Nice try!', 
      'Too easy!', 
      'You can\'t beat me!'
    ];

    const botLoseSayings = [
      'You got lucky!', 
      'DAMN IT!', 
      'I demand a rematch!', 
      'No way!', 
      'How did you do that?', 
      'I\'ll get you next time!'
    ];

    const botTieSayings = [
      'It\'s a draw!', 
      'We\'re evenly matched!', 
      'Try again?', 
      'So close!', 
      'Neither wins!', 
      'Let\'s go again!'
    ];

    const botEmoji = '🤖';

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Rock, Paper, Scissors')
      .setDescription('Choose your move by selecting an option from the dropdown below:')
      .setThumbnail('https://example.com/rps.png') // Add an appropriate thumbnail
      .setFooter({ text: 'Let\'s see who wins!', iconURL: 'https://example.com/footer-icon.png' }); // Add an appropriate footer icon

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select')
      .setPlaceholder('Choose your move...')
      .addOptions([
        {
          label: 'Rock',
          description: 'Choose Rock',
          value: 'rock',
          emoji: '✊',
        },
        {
          label: 'Paper',
          description: 'Choose Paper',
          value: 'paper',
          emoji: '📰',
        },
        {
          label: 'Scissors',
          description: 'Choose Scissors',
          value: 'scissors',
          emoji: '✂️',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const filter = i => i.user.id === interaction.user.id;

    let userScore = 0;
    let botScore = 0;
    let round = 0;

    const playRound = async (i) => {
      round++;
      const userChoice = i.values[0];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      let result, randomSaying;
      if (userChoice === botChoice) {
        result = 'It\'s a tie!';
        randomSaying = botTieSayings[Math.floor(Math.random() * botTieSayings.length)];
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = 'You win!';
        randomSaying = botLoseSayings[Math.floor(Math.random() * botLoseSayings.length)];
        userScore++;
      } else {
        result = 'You lose!';
        randomSaying = botWinSayings[Math.floor(Math.random() * botWinSayings.length)];
        botScore++;
      }

      // Add a 2-second delay before showing the result
      setTimeout(async () => {
        const resultEmbed = new EmbedBuilder()
          .setColor(embedColor)
          .setTitle(`Round ${round} Results Are in!`)
          .setDescription(
            `**You chose** ${emojis[userChoice]} **${userChoice}**\n` +
            `**Bot chose** ${emojis[botChoice]} **${botChoice}**\n\n` +
            `**${result}**\n\n` +
            `${botEmoji}  *${randomSaying}*\n\n` +
            `**Score:** You ${userScore} - ${botScore} Bot`
          )
          .setFooter({ text: 'Thanks for playing!' }); // Add an appropriate footer icon

        // Send the result as a new message
        await i.update({ embeds: [resultEmbed], components: [] });

        // Check if the game is over
        if (userScore >= 2 && userScore > botScore) {
          await interaction.followUp({ content: '🎉 Congratulations! You won the best of three games. 🎉', ephemeral: true });
        } else if (botScore >= 2 && botScore > userScore) {
          await interaction.followUp({ content: '💀 Bot wins the best of three games. Better luck next time! 💀', ephemeral: true });
        } else if (userScore === 2 && botScore === 2) {
          if (userScore === 3) {
            await interaction.followUp({ content: 'Congratulations! You won by reaching 3 wins first.', ephemeral: true });
          } else if (botScore === 3) {
            await interaction.followUp({ content: 'The bot wins the game by reaching 3 wins first. Better luck next time!', ephemeral: true });
          } else {
            await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
          }
        } else {
          await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
        }
      }, 2000);
    };

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      await playRound(i);
      if (userScore >= 3 || botScore >= 3 || (userScore >= 2 && botScore >= 2)) {
        collector.stop(); // Stop the collector if the game is over
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        // Update the message to indicate that the user did not make a choice in time and remove the embed and components
        await interaction.editReply({ content: 'You did not make a choice in time!', embeds: [], components: [], ephemeral: true });
      }
    });
  }
};
