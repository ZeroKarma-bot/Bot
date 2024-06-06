const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

const facts = [
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "There are more stars in the universe than grains of sand on all the world's beaches.",
  "Humans share 50% of their DNA with bananas.",
  "Octopuses have three hearts and blue blood.",
  "A single strand of spider silk is stronger than a steel strand of the same diameter.",
  "The shortest war in history lasted 38 minutes: the Anglo-Zanzibar War of 1896.",
  "A group of flamingos is called a 'flamboyance'.",
  "Cows have best friends and get stressed when they are separated.",
  "The Eiffel Tower can be 15 cm taller during the summer.",
  "Wombat poop is cube-shaped.",
  "The longest time between two twins being born is 87 days.",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "The inventor of the Pringles can is now buried in one.",
  "A single teaspoon of honey represents the life work of 12 bees.",
  "A jiffy is an actual unit of time: 1/100th of a second.",
  "An octopus has three hearts, nine brains, and blue blood.",
  "Butterflies taste with their feet.",
  "A group of crows is called a murder.",
  "You can't hum while holding your nose.",
  "A shrimp's heart is in its head.",
  "Koalas have fingerprints almost identical to human fingerprints.",
  "Sea otters hold hands while sleeping to keep from drifting apart.",
  "A snail can sleep for three years.",
  "Sloths can hold their breath longer than dolphins can.",
  "The shortest commercial flight in the world lasts just 57 seconds.",
  "A blue whale's heart is the size of a small car.",
  "A baby octopus is about the size of a flea at birth.",
  "Elephants are the only animals that can't jump.",
  "The tongue is the fastest healing part of the body.",
  "A crocodile cannot stick its tongue out.",
  "The chicken is the closest living relative to the Tyrannosaurus Rex.",
  "A group of hedgehogs is called a prickle.",
  "A narwhal's tusk is actually an elongated tooth.",
  "A giraffe can clean its ears with its tongue.",
  "The unicorn is the national animal of Scotland.",
  "A duck's quack does not echo, and no one knows why.",
  "Owls don't have eyeballs. They have eye tubes.",
  "A newborn kangaroo is the size of a lima bean.",
  "Polar bears have black skin under their white fur.",
  "The heart of a shrimp is located in its head.",
  "There are more artificial flamingos in the world than real ones.",
  "A cat's purr has been shown to relieve stress in humans.",
  "The fingerprints of a koala are so indistinguishable from humans that they have on occasion been confused at a crime scene.",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "The inventor of the Pringles can is now buried in one.",
  "Cows have best friends and get stressed when they are separated.",
  "A group of pandas is called an embarrassment.",
  "A group of parrots is called a pandemonium.",
  "The plastic or metal tip at the end of a shoelace is called an aglet.",
  "The human nose can detect about 1 trillion smells.",
  "A blue whale's tongue can weigh as much as an elephant.",
  "A group of porcupines is called a prickle.",
  "The longest recorded flight of a chicken is 13 seconds.",
  "The world's largest grand piano was built by a 15-year-old in New Zealand.",
  "A jiffy is an actual unit of time: 1/100th of a second.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are berries, but strawberries aren't.",
  "An octopus has three hearts, nine brains, and blue blood.",
  "Butterflies taste with their feet.",
  "A shrimp's heart is in its head.",
  "Koalas have fingerprints almost identical to human fingerprints.",
  "Sea otters hold hands while sleeping to keep from drifting apart.",
  "A snail can sleep for three years.",
  "Sloths can hold their breath longer than dolphins can.",
  "The shortest commercial flight in the world lasts just 57 seconds.",
  "A blue whale's heart is the size of a small car.",
  "A baby octopus is about the size of a flea at birth.",
  "Elephants are the only animals that can't jump.",
  "The tongue is the fastest healing part of the body.",
  "A crocodile cannot stick its tongue out.",
  "The chicken is the closest living relative to the Tyrannosaurus Rex.",
  "A group of hedgehogs is called a prickle.",
  "A narwhal's tusk is actually an elongated tooth.",
  "A giraffe can clean its ears with its tongue.",
  "The unicorn is the national animal of Scotland.",
  "A duck's quack does not echo, and no one knows why.",
  "Owls don't have eyeballs. They have eye tubes.",
  "A newborn kangaroo is the size of a lima bean.",
  "Polar bears have black skin under their white fur.",
  "The heart of a shrimp is located in its head.",
  "There are more artificial flamingos in the world than real ones.",
  "A cat's purr has been shown to relieve stress in humans.",
  "The fingerprints of a koala are so indistinguishable from humans that they have on occasion been confused at a crime scene.",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "The inventor of the Pringles can is now buried in one.",
  "Cows have best friends and get stressed when they are separated.",
  "A group of pandas is called an embarrassment.",
  "A group of parrots is called a pandemonium.",
  "The plastic or metal tip at the end of a shoelace is called an aglet.",
  "The human nose can detect about 1 trillion smells.",
  "A blue whale's tongue can weigh as much as an elephant.",
  "A group of porcupines is called a prickle.",
  "The longest recorded flight of a chicken is 13 seconds.",
  "The world's largest grand piano was built by a 15-year-old in New Zealand."
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Share a random interesting fact.'),
  async execute(interaction) {
    try {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      const formattedFact = `**"${randomFact}"**`;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('📚 Random Interesting Fact')
        .setDescription(formattedFact)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching fact:', error);
      await interaction.reply({ content: 'There was an error fetching your fact. Please try again later.', ephemeral: true });
    }
  },
};
