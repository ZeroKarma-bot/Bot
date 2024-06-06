const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shoutout')
    .setDescription('Give a shoutout to another user.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to give a shoutout to')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('message')
        .setDescription('Custom message for the shoutout')
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const message = interaction.options.getString('message') || "You're awesome!";
      const shoutoutMessage = `Hey everyone, let's give a big shoutout to ${user}! ${message}`;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎉 Shoutout!')
        .setDescription(shoutoutMessage)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error creating shoutout:', error);
      await interaction.reply({ content: 'There was an error creating your shoutout. Please try again later.', ephemeral: true });
    }
  },
};
