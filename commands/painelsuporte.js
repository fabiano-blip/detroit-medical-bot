const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painelsuporte')
    .setDescription('Envia o painel de suporte'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('🏥 Suporte | Detroit Medical Center')
      .setDescription(`
Estamos prontos para ajudar!

Descreva com clareza sua dúvida, problema ou solicitação.

⏱️ **Tempo médio de resposta:** até 30 minutos.

⚠️ Não abra tickets sem necessidade.

🏥 **Detroit Medical Center © Detroit Roleplay**
`);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('menu_suporte')
      .setPlaceholder('Selecione uma categoria')
      .addOptions([
        {
          label: 'Suporte',
          description: 'Abrir ticket de suporte',
          emoji: '🏥',
          value: 'suporte'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};