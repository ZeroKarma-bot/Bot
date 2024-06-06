const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Aki } = require('aki-api');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

// Array of thumbnail URLs
const thumbnails = [
  'https://en.akinator.com/assets/img/akitudes_670x1096/defi.png',
  'https://en.akinator.com/assets/img/akitudes_670x1096/inspiration_legere.png',
  'https://en.akinator.com/assets/img/akitudes_670x1096/serein.png',
  'https://en.akinator.com/assets/img/akitudes_670x1096/inspiration_forte.png',
  'https://en.akinator.com/assets/img/akitudes_670x1096/confiant.png',
  'https://en.akinator.com/assets/img/akitudes_670x1096/mobile.png'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('akinator')
    .setDescription('Play a game of Akinator!'),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const aki = new Aki({ region: 'en' });
      await aki.start();

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎩 Akinator')
        .setDescription(`${aki.question}\n\n**Progress:** ${aki.progress.toFixed(2)}%`)
        .setThumbnail(thumbnails[Math.floor(Math.random() * thumbnails.length)]) // Random thumbnail
        .setFooter({ text: 'Akinator Game', iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFNnrMxNb3M_oS-3NUd5byfIYPCVVhJsS4ZQ&s' }) // Example footer icon, replace with your own
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('no')
            .setLabel('No')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('dont_know')
            .setLabel('Don\'t Know')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('probably')
            .setLabel('Probably')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('probably_not')
            .setLabel('Probably Not')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({ embeds: [embed], components: [row] });

      const filter = i => ['yes', 'no', 'dont_know', 'probably', 'probably_not'].includes(i.customId) && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        try {
          const answerMap = {
            yes: 0,
            no: 1,
            dont_know: 2,
            probably: 3,
            probably_not: 4
          };
          const answer = answerMap[i.customId];

          await i.deferUpdate(); // Acknowledge the interaction to prevent "This interaction failed"

          await aki.step(answer);

          if (aki.progress >= 95 || aki.currentStep >= 78) {
            const guess = await aki.win();
            const resultEmbed = new EmbedBuilder()
              .setColor(embedColor)
              .setTitle('🎩 Akinator')
              .setDescription(`I guess you are thinking of **${guess.answers[0].name}**!\n\n**Description:** ${guess.answers[0].description}\n\n**Progress:** ${aki.progress.toFixed(2)}%`)
              .setImage(guess.answers[0].absolute_picture_path)
              .setFooter({ text: 'Akinator Game', iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFNnrMxNb3M_oS-3NUd5byfIYPCVVhJsS4ZQ&s' })
              .setTimestamp();

            await i.editReply({ embeds: [resultEmbed], components: [] });
            collector.stop();
          } else {
            const updatedEmbed = new EmbedBuilder()
              .setColor(embedColor)
              .setTitle('🎩 Akinator')
              .setDescription(`${aki.question}\n\n**Progress:** ${aki.progress.toFixed(2)}%`)
              .setThumbnail(thumbnails[Math.floor(Math.random() * thumbnails.length)]) // Random thumbnail
              .setFooter({ text: 'Akinator Game', iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFNnrMxNb3M_oS-3NUd5byfIYPCVVhJsS4ZQ&s' })
              .setTimestamp();

            await i.editReply({ embeds: [updatedEmbed], components: [row] });
          }
        } catch (error) {
          console.error('Error during Akinator game step:', error);
          try {
            await i.followUp({ content: 'There was an error during the Akinator game. Please try again later.', ephemeral: true });
          } catch (updateError) {
            console.error('Error updating interaction:', updateError);
          }
          collector.stop();
        }
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          try {
            await interaction.editReply({ content: 'Time is up! Please start a new game.', components: [] });
          } catch (endError) {
            console.error('Error ending interaction:', endError);
          }
        }
      });
    } catch (error) {
      console.error('Error starting Akinator game:', error);
      try {
        await interaction.editReply({ content: 'There was an error starting the Akinator game. Please try again later.', ephemeral: true });
      } catch (replyError) {
        console.error('Error replying to interaction:', replyError);
      }
    }
  },
};
