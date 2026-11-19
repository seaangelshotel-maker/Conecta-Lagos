/**
 * Prévias PRIVADAS de lugares públicos (praias, ruas, igrejas, mirantes) com foto de licença aberta (Wikimedia Commons).
 * Link: /previa/<id>?k=<chave>. Autor e licença ficam em `source`; ao publicar, exibir o crédito.
 */
import type { PrivatePreview } from './privatePreviews';

export const PRIVATE_PLACE_PREVIEWS: Record<string, PrivatePreview> = {
  // Praia Rasa
  'pub_buzios_praia-rasa': { key: 'e2712fdc5f', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-PraiaRasa3.jpg?width=1280", source: "Wikimedia Commons · Fulviusbsas · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Buzios-PraiaRasa3.jpg" },
  // Praia da Ferradura
  'pub_buzios_praia-da-ferradura': { key: 'f03be384a0', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/PRAIA_DA_FERRADURA.B%C3%9AZIOS.JPG?width=1280", source: "Wikimedia Commons · Msadp77 · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:PRAIA_DA_FERRADURA.B%C3%9AZIOS.JPG" },
  // Praia de João Fernandes
  'pub_buzios_praia-de-joao-fernandes': { key: '736b2062a3', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-JoaoFernandes.jpg?width=1280", source: "Wikimedia Commons · Fulviusbsas · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Buzios-JoaoFernandes.jpg" },
  // Praia da Armação
  'pub_buzios_praia-da-armacao': { key: 'a439efc57b', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Arma%C3%A7%C3%A3o%2C_B%C3%BAzios_2.JPG?width=1280", source: "Wikimedia Commons · Leandrobarr · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Praia_da_Arma%C3%A7%C3%A3o%2C_B%C3%BAzios_2.JPG" },
  // Praia dos Ossos
  'pub_buzios_praia-dos-ossos': { key: 'd5f628ecb0', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_dos_Ossos%2C_2_-_Village_de_B%C3%BAzios%2C_B%C3%BAzios_-_RJ%2C_28950-000%2C_Brazil_-_panoramio.jpg?width=1280", source: "Wikimedia Commons · TMbux · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Praia_dos_Ossos%2C_2_-_Village_de_B%C3%BAzios%2C_B%C3%BAzios_-_RJ%2C_28950-000%2C_Brazil_-_panoramio.jpg" },
  // Praia da Tartaruga
  'pub_buzios_praia-da-tartaruga': { key: '651a0a1fb5', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Traineira_Praia_da_Tartaruga.jpg?width=1280", source: "Wikimedia Commons · Patrick Montenegro · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Traineira_Praia_da_Tartaruga.jpg" },
  // Praia de Manguinhos
  'pub_buzios_praia-de-manguinhos': { key: '26f43a293c', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Porto_de_Manguinhos_-_B%C3%BAzios_Brasil.JPG?width=1280", source: "Wikimedia Commons · Kcris Ramos · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Porto_de_Manguinhos_-_B%C3%BAzios_Brasil.JPG" },
  // Praia do Forte
  'pub_cabo_frio_praia-do-forte': { key: 'af45c38fa3', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/PlayaForteSaoMateo-CaboFrio-Brasil-feb2016.jpg?width=1280", source: "Wikimedia Commons · Ezarate · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:PlayaForteSaoMateo-CaboFrio-Brasil-feb2016.jpg" },
  // Orla Bardot
  'pub_buzios_orla-bardot': { key: '43e4cc5fb1', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Orla_Bardot%2C_B%C3%BAzios.jpg?width=1280", source: "Wikimedia Commons · Viniciusmpv · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Orla_Bardot%2C_B%C3%BAzios.jpg" },
  // Rua das Pedras
  'pub_buzios_rua-das-pedras': { key: 'fba792a663', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Rua_das_Pedras_(2).jpg?width=1280", source: "Wikimedia Commons · Eduardo P · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Rua_das_Pedras_(2).jpg" },
  // Escultura Os Três Pescadores
  'pub_buzios_escultura-os-tres-pescadores': { key: '15d54c6f7c', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/ThiagoFreitas_Monumento_dos_Tres_Pescadores_Armacao_dos_Buzios_RJ_(27180960928).jpg?width=1280", source: "Wikimedia Commons · MTur Destinos · Public domain · https://commons.wikimedia.org/wiki/File:ThiagoFreitas_Monumento_dos_Tres_Pescadores_Armacao_dos_Buzios_RJ_(27180960928).jpg" },
  // Ilha do Cabo Frio
  'pub_arraial_do_cabo_ilha-do-cabo-frio': { key: '3f3791e9f9', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/VistaPraiadoFarol-Arraial_do_Cabo-feb2016.jpg?width=1280", source: "Wikimedia Commons · Ezarate · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:VistaPraiadoFarol-Arraial_do_Cabo-feb2016.jpg" },
  // Praia do Canto
  'pub_buzios_praia-do-canto': { key: '68113a9bcf', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAzios_RJ_Brasil_-_Ruela_na_Praia_do_Canto_-_panoramio.jpg?width=1280", source: "Wikimedia Commons · Josue Marinho · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:B%C3%BAzios_RJ_Brasil_-_Ruela_na_Praia_do_Canto_-_panoramio.jpg" },
  // Praia da Foca
  'pub_buzios_praia-da-foca': { key: '70f761fef4', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Foca_2010_BBKW.JPG?width=1280", source: "Wikimedia Commons · Beatriz Bukowitz · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Praia_da_Foca_2010_BBKW.JPG" },
  // Praia da Azeda
  'pub_buzios_praia-da-azeda': { key: '405e7023df', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Azeda_05.jpg?width=1280", source: "Wikimedia Commons · Halley Pacheco de Oliveira · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Praia_da_Azeda_05.jpg" },
  // Praia da Ferradurinha
  'pub_buzios_praia-da-ferradurinha': { key: 'fdee851474', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-Ferradurinha4.jpg?width=1280", source: "Wikimedia Commons · Fulviusbsas · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Buzios-Ferradurinha4.jpg" },
  // Praia do Forno (Búzios)
  'pub_buzios_praia-do-forno': { key: '006a188819', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-Forno1.jpg?width=1280", source: "Wikimedia Commons · Fulviusbsas · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Buzios-Forno1.jpg" },
  // Igreja de Sant’Ana
  'pub_buzios_igreja-de-sant-ana': { key: '7cea554eb5', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Igreja_de_Sant'Ana.jpg?width=1280", source: "Wikimedia Commons · Hour.poing · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Igreja_de_Sant'Ana.jpg" },
  // Serra das Emerências
  'pub_buzios_serra-das-emerencias': { key: '7f49c8a1ed', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Serra_das_emerencias_-_B%C3%B9zios%2C_RJ_-_panoramio.jpg?width=1280", source: "Wikimedia Commons · Newton paz peres · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Serra_das_emerencias_-_B%C3%B9zios%2C_RJ_-_panoramio.jpg" },
  // Praia de João Fernandinho
  'pub_buzios_praia-de-joao-fernandinho': { key: '4f77f997cd', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-JoaoFernandinho1.jpg?width=1280", source: "Wikimedia Commons · Fulviusbsas · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Buzios-JoaoFernandinho1.jpg" },
  // Praia da Azedinha
  'pub_buzios_praia-da-azedinha': { key: '39631258b0', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Azedinha_03.jpg?width=1280", source: "Wikimedia Commons · Halley Pacheco de Oliveira · CC BY-SA 3.0 · https://commons.wikimedia.org/wiki/File:Praia_da_Azedinha_03.jpg" },
};
