const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Measures bot and API latency'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    // Introduce a delay before showing the latency message
    setTimeout(() => {
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🏓 Pong!')
        .setDescription(`🏓 Latency is \`${latency}ms\`. API Latency is \`${apiLatency}ms\`.`);

      interaction.editReply({ content: null, embeds: [embed] });
    }, 1000); // 1000 milliseconds = 1 second delay
  }
};
