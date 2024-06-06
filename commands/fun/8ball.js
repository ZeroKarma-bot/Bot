const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('The question you want to ask the 8ball')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const responses = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes – definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      'Don’t count on it.',
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.'
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(embedColor) // Use the color from config.json
      .setTitle('🎱 The Magic 8ball')
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .addFields(
        { name: 'Question', value: question },
        { name: 'Answer', value: response }
      )
      .setFooter({ text: 'Magic 8ball', iconURL: 'https://i.redd.it/adr6nu1nx9r91.jpg' }) // Example footer icon, replace with your own
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
