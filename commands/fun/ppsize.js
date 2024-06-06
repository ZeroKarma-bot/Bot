const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

const sizeDescriptions = [
  "8D",
  "8=D",
  "8==D",
  "8===D",
  "8====D",
  "8=====D",
  "8======D",
  "8=======D",
  "8========D",
  "8==========D",
  "8==========D",
  "8============D",
  "8==============D",
  "8=============D",
  "8==============D",
  "8=================D",
  "8==================D",
  "8===================D",
  "8========================D",
  "8=======================================================================================================================================================D"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ppsize')
    .setDescription('Joke command to measure PP size.'),
  async execute(interaction) {
    try {
      const randomSize = sizeDescriptions[Math.floor(Math.random() * sizeDescriptions.length)];
      const formattedSize = `**${randomSize}**`;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🍆 PP Size Measurement')
        .setDescription(`Your PP Size is:\n${formattedSize}\n\n`)
        .setFooter({ text: 'PP Size Measurement', iconURL: 'https://example.com/pp_icon.png' }) // Replace with your own icon URL
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error measuring PP size:', error);
      await interaction.reply({ content: 'There was an error measuring your PP size. Please try again later.', ephemeral: true });
    }
  },
};
