const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('paineldenuncia')
    .setDescription('Envia o painel de denúncias'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('⚖️ Denúncias | Detroit Medical Center')
      .setDescription(`
Caso tenha identificado alguma conduta errada, falta de profissionalismo ou quebra de regras, abra uma denúncia.

Todas as denúncias serão analisadas pela equipe responsável.

⚠️ Denúncias falsas podem gerar punições.

🏥 **Detroit Medical Center © Nova Capital**
`);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('abrir_denuncia')
          .setLabel('Denunciar')
          .setEmoji('🚨')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};