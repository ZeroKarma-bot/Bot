const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const { embedColor } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a list of available commands"),

  async execute(interaction) {
    // Check if the command is being used in a guild
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in servers.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle("Help Menu")
      .setDescription(
        "Select a category from the dropdown menu below to view the commands available:",
      )
      .setFooter({
        text: "Use the dropdown menu to navigate through the command categories.",
      })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select-category")
      .setPlaceholder("Choose a command category")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Ecosystem")
          .setValue("ecosystem")
          .setEmoji("🌱"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Fun")
          .setValue("fun")
          .setEmoji("🎉"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Admin Only")
          .setValue("admin")
          .setEmoji("🔒"),
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const filter = (i) =>
      i.customId === "select-category" && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      let categoryEmbed;

      switch (i.values[0]) {
        case "ecosystem":
          categoryEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Ecosystem Commands")
            .setDescription("Commands that interact with the karma ecosystem.")
            .addFields(
              {
                name: "**/karma check**",
                value: "Check your experience and level",
              },
              { name: "**/karma daily**", value: "Claim Daily Karma" },
              {
                name: "**/goodmorning** `[User]`",
                value: "Send a good morning message and earn karma",
              },
              {
                name: "**/match** `[User 1]` `[User 2]`",
                value:
                  "Check compatibility between two users. If you get 90% or over, you get a huge amount of karma experience",
              },
              {
                name: "**/welcome** `[User]`",
                value: "Welcome new users and get a karma reward",
              },
              {
                name: "**/goodnight** `[User]`",
                value: "Send a good night message and earn karma",
              },
            );
          break;
        case "fun":
          categoryEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Fun Commands")
            .setDescription("Commands for entertainment and fun.")
            .addFields(
              { name: "**/8ball**", value: "Ask the magic 8ball a question" },
              { name: "**/meme**", value: "Get a random meme" },
              { name: "**/fact**", value: "Get a random fact" },
              { name: "**/fortune**", value: "Get a random fortune" },
              { name: "**/ppsize**", value: "Check your PP size" },
              { name: "**/rps**", value: "Play Rock-Paper-Scissors" },
              { name: "**/shoutout**", value: "Give a shoutout to someone" },
              { name: "**/tictactoe**", value: "Play a game of Tic-Tac-Toe" },
              { name: "**/moviequote**", value: "Get a random movie quote" },
            );
          break;
        case "admin":
          categoryEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle("Admin Only Commands")
            .setDescription("Commands that require administrator permissions.")
            .addFields({
              name: "**/togglecommand** `[Command Name]` `[Enable/Disable]`",
              value:
                "Enables or disables a command on the bot in the server. Only administrators can use this command.",
            });
          break;
      }

      await i.update({
        embeds: [categoryEmbed],
        components: [row],
        ephemeral: true,
      });
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "No category selected.",
          components: [],
          ephemeral: true,
        });
      }
    });
  },
};
