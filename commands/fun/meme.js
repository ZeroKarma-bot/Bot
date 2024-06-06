const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Fetches a random meme from Reddit."),
  async execute(interaction) {
    try {
      const response = await axios.get(
        "https://www.reddit.com/r/memes/random/.json",
        {
          headers: {
            "User-Agent": "DiscordBot (https://p3233x-3000.csb.app/, v1.0.0)", // Replace with your bot's information
          },
        },
      );

      const [list] = response.data;
      const [post] = list.data.children;

      const meme = {
        title: post.data.title,
        url: post.data.url,
        image: post.data.url_overridden_by_dest || post.data.thumbnail,
        author: post.data.author,
        subreddit: post.data.subreddit,
      };

      const colors = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FF33A1",
        "#33FFF5",
        "#F5FF33",
        "#FF5733",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setImage(meme.image)
        .setColor(randomColor)
        .setFooter({
          text: `Posted by u/${meme.author} in r/${meme.subreddit}`,
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "Failed to fetch a meme. Please try again later.",
      );
    }
  },
};
