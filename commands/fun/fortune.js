const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

const fortunes = [
  "A beautiful, smart, and loving person will be coming into your life.",
  "A faithful friend is a strong defense.",
  "A fresh start will put you on your way.",
  "A golden egg of opportunity falls into your lap this month.",
  "A lifetime of happiness lies ahead of you.",
  "A lifetime friend shall soon be made.",
  "A new perspective will come with the new year.",
  "A person of words and not deeds is like a garden full of weeds.",
  "A pleasant surprise is waiting for you.",
  "A smile is your personal welcome mat.",
  "A soft voice may be awfully persuasive.",
  "A truly rich life contains love and art in abundance.",
  "Accept something that you cannot change, and you will feel better.",
  "Adventure can be real happiness.",
  "Advice is like kissing. It costs nothing and is a pleasant thing to do.",
  "All the effort you are making will ultimately pay off.",
  "All the troubles you have will pass away very quickly.",
  "An acquaintance of the past will affect you in the near future.",
  "Any decision you have to make tomorrow is a good decision.",
  "Be careful or you could fall for some tricks today.",
  "Beauty in its various forms appeals to you.",
  "Believe in yourself and others will too.",
  "Believe it can be done."
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Get a random fortune cookie message'),
  async execute(interaction) {
    try {
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      const formattedFortune = `**"${randomFortune}"**`;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🥠 Your Fortune Cookie')
        .setDescription(formattedFortune)
        .setFooter({ text: 'Fortune Cookie', iconURL: 'https://st.depositphotos.com/46898394/53816/v/450/depositphotos_538161396-stock-illustration-pixel-art-paper-lantern-icon.jpg' }) // Replace with your own icon URL
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching fortune:', error);
      await interaction.reply({ content: 'There was an error fetching your fortune. Please try again later.', ephemeral: true });
    }
  },
};
