/**
 * Prévias PRIVADAS para mostrar a ficha completa ao dono da empresa antes de ele autorizar fotos.
 * Aberta só por link com chave (/previa/<id>?k=<chave>), fora do Google, sem aparecer no guia.
 * As imagens são exibidas direto do site oficial da própria empresa (não são copiadas nem guardadas aqui).
 * Quando o dono autorizar/enviar as fotos, o link é apagado daqui.
 */
import type { BusinessProfile } from '../types';
import { PRIVATE_PLACE_PREVIEWS } from './privatePlacePreviews';

export interface PrivatePreview {
  key: string;
  coverImage?: string;
  gallery?: string[];
  source: string;
  /**
   * Correções/complementos de INFORMAÇÃO mostrados só na prévia (a ficha oficial não muda até o dono aprovar).
   * Cada campo só entra com fonte conferida (site oficial, Instagram, Booking...). Ver docs/CADASTRO_PADRAO.md.
   */
  info?: Partial<Pick<BusinessProfile, 'description' | 'address' | 'phone' | 'whatsapp' | 'instagram' | 'website' | 'openingHours' | 'amenities' | 'bookingUrl' | 'deliveryUrl'>>;
}

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  // Sentinelas do Mar e Ocean View autorizaram as fotos e já estão públicos (19/11/2026)
  // Água na Boca
  'emp_iguaba_grande_agua-na-boca': { key: 'c92dfdf5c0', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLenvsrPBtf63hmOzXsLz7QLqfcIz3FhD4haRfk5b1E2ZPSlJwbHmdOFo-bJQocJT0YiYGXgOJUvIft5ybLp4GNpa2sUYXl4akeIXdlL8YblIWN7-2GFPWzUSrwzORYJ07Uu7Ehh=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Açaí Forte do Cabo
  'emp_arraial_do_cabo_acai-forte-do-cabo': { key: 'f0f83ab67c', source: "sem foto (aguardando envio do dono)" },
  // Ancho e Faca Churrascaria
  'emp_cabo_frio_ancho-e-faca-churrascaria': { key: '0bc95c77ed', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLc3gNKKrTjwGMrFstydi8_xrD_8_s4EuYnJeMOSLJX0fZw06Pxh4Zg4fSmD3VSOPsEEoG5AJCM_54twrdORcaA0ba9Q0kLATXsg_A-Vv3d2CwslPXFe45IpZkVA7NC7H6jekiKTcA=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Anchova na Brasa
  'emp_arraial_do_cabo_anchova-na-brasa': { key: 'a90e18a7d9', source: "sem foto (aguardando envio do dono)" },
  // Bamba
  'emp_cabo_frio_bamba': { key: 'aab15f2916', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcssSupfCCE3-QmziP-rvcXVVHdbvOJIzb7NANrUwKvkDdibiSShbObCLLrwNJ8ap07Qia7zhsx00V-f55F9NSJWB9Fid7LpyJL3L_R-LggopKfOQUnq1R6QhwM_skc1-V94lwzIg=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Bar do Cajueiro by Bodega Boa
  'emp_saquarema_bar-do-cajueiro-by-bodega-boa': { key: '06248a3581', source: "sem foto (aguardando envio do dono)" },
  // Cantinho do Peixe
  'emp_sao_pedro_da_aldeia_cantinho-do-peixe': { key: 'b14b84e7b7', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLe6Q7xmZcaSQF1tfG6xLK6XNLu96XgTWXlrSN2kZvdoE4VrHvg0_UfWVLtn574hTq-kplJLYWhBbkpru5JNeSpa8U1PZDFw7-RJShOgXh3uXxLQByvVKX5YJLUeIk0LSCCRjQBShg=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Canto Restô
  'emp_buzios_canto-resto': { key: '934f0961e4', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcEcrAGeiSmqlogcKnltxDpoiCctkCMUNHiRfktNHuqg3ar7SPaShZCmATw2uwlJvHsnm_XI2Ge_JAaqAFGcZTHaaPUKXp-0kSF7UbVIq6VtDhYfQXJY1EZJD2zH0xbPUMPgehSjVAhwBsy=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Casa da Picanha
  'emp_iguaba_grande_casa-da-picanha': { key: 'dfc4f88272', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLdCMDQLCPxfQN0AMsl8oUhi7p85JlipdDjb-ybklodH9MBlo-Ry8j3mgY2C3UsMF7jYehU8yEcaQAI2uQZqECitSMVzVBH4GoNxKbZlPK428stpF_XvzSTaKRNTgMlnJuRwxUY=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Casa da Praia Itaúna
  'emp_saquarema_casa-da-praia-itauna': { key: '61b25f1df6', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLdcmJSQV-HKVLFCPmaVvz-j3isYyvBgk7oRzthKAnxt0BYz8SJR8RmzgjeCxRSkSmXvDL17uWLj7aGGYRLLxJpZMskEXjpcMx9wxhbUEGNv3zaM8EFmszGmMQogidtuS008SkUg=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Esquina da Onda
  'emp_arraial_do_cabo_esquina-da-onda': { key: '3ccf2a452a', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLfyHmcPlD4Yvk9g1b5bswMG_7AZ7OpuHUtgDj445PZwLHuUc_YKScYwrw-lvPFB1cdnEGRkvClsDvfY40dXFnumDNgplUie8bHDjTfLnH19WeuCMMIG2ljC8EclvI7y5FaKFNEt=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Estrela do Mar Saquarema
  'emp_saquarema_estrela-do-mar-saquarema': { key: '68af866ffb', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLeJV9Bg_G_XwQPUjGCXfEyhyPsZPHfk7wST1G4WAemyliLfKYTNu8DK-mNKtSGENF55n9QTsQ2yDBcLdVWyxZzPEGnYO5aUU9y8dwusLiJ_Ci9TgsYvbw-SDd3Sdu5SSNRhPqPh3QNKJHrU=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Gabi's Hamburgueria
  'emp_arraial_do_cabo_gabi-s-hamburgueria': { key: 'd851c507c9', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLeWS9AgPsitgeBiArXN61qVza2VMN00RPPvNefiop9mavhZrVYu6JA7Sq42U6J9QeRnSFH851uqJcBmm5O2Ek8Q38a_aC8mbB0c5za7Gg-AX28pRI3D9x4X6ztstEzHhd2ufs0=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Iguaba Palace Hotel
  'emp_iguaba_grande_iguaba-palace-hotel': { key: 'c4e389cdd4', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLf6NUdBa6uG3GEFCedR2oijk-alk9B02AwNCJSgFXBzlClYs5I8de0qTe1Fe0BWM1OXPqvGj4f3PDv4Jyh6qWBrnskcNY4MnXQRrpVl7hx2bvYOuSNXuqG8qQ18HSc9HucyXuFPVw=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Kentô Cozinha Oriental
  'emp_cabo_frio_kento-cozinha-oriental': { key: '794ab33469', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLc50cf1w4TqV0O4VowA3tkg8HOHXqJrhqoA19rmy9Mk1xqXrmXP3jLytKofTvQgM7SzjyILUVA3TJJ3GaJj8MTmKaUCmUlIRduShx2L_n3loOLvqKBYauCqduofwQr6EscI7dQF=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // La Bodeguita Restaurante e Pizzaria
  'emp_araruama_la-bodeguita-restaurante-e-pizzaria': { key: '7148c904af', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcveAaMYQV6bHmY7_eqTTkHcgvygwfxpb9nC5J5IVTTNRcvsaP7qxopU-1n0xUJSrKWljXaOllwx1WcHdTTOWwhRSJIF1VeRuwnVfbrz-Se_uER6kle3PpZKoz51TEK1zh7PyBkdw=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Lorenzzo Burguer
  'emp_arraial_do_cabo_lorenzzo-burguer': { key: 'fdf2d5fc59', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLeJ_yAFxHMLmCIkBcN0SFRsNbaIqK-cSfeW7xLi6MyifHb6sx7Y7CEWQctCAqnUDqmphzSB3hO3Q3azd0n6gVHdoUgbzdm72txa9vKKUh9C3k6IaSJd0E0EmlbKlrCPfFPKP-E=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Lounge da Praia
  'emp_arraial_do_cabo_lounge-da-praia': { key: '5d026e3c75', source: "sem foto (aguardando envio do dono)" },
  // Outros500 Bar & Restaurante
  'emp_sao_pedro_da_aldeia_outros500-bar-restaurante': { key: '654c3718a1', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcCNiuwES2Q0cgJvhzG4UxOaR3icXAdajfOWyExYsXc4zow0NK4SLN1T_hEr28lmy7x2bTSHKbmUM42V_mb3RZWUWMHMTrnlYavmS7pLzskOaHk3F54zoaPwZkorfk51X7AO12PUw=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pimenta Rosa Gastronomia
  'emp_arraial_do_cabo_pimenta-rosa-gastronomia': { key: '065db3d5bb', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLdCqPniECzhGb1hU1b14eScJd6e_3PSsFb3plMY8H3XhUZiIsRdwNMq_aoWvflVfbEuHULw9mOipY7MEyw8WxPp44qdAHHtTpMl6pAa2XSJl-cz-Ik3ql3WdmZ0Fg1YgXosQoY=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada Atalaia Boutique
  'emp_arraial_do_cabo_pousada-atalaia-boutique': { key: '207a85adaf', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLfTLYJxb41fcL4lLjOAgENHsQph41l4BopZliwdWMCdaovmrFe3DdHDgc42Mf23-cB05ItKNFp3itwgKzq59xY28Ox_S0R2roQ-3_h_f_Q98IrpGi1iyU-XryTnYu8qVSz9jkjAzMss648x=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada Catavento
  'emp_saquarema_pousada-catavento': { key: '733adbe92d', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLf9sz6TWEY6cqZ7YZL2S03VzqZpgOUyrOA3YUaficIdydSzDvY3K7yov0T5R2gk85Z-nXOqyGFv1K2-fMEoD9TYuStk89FXWzHVD9gIjRj3W8hG96QNNHGpcREfurgw4d66zYDzrw=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada das Andorinhas
  'emp_iguaba_grande_pousada-das-andorinhas': { key: 'c40c536eb0', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLf5v1eVp5BYAM5nyPpCj_GAmLwEYu0WNAeYUq3Nf69YpApRXTEt14B3hq-uWJIsJWZTBuW7RbvngpQ16pPY7ozS0wskE-f4lK39Jbyr-nInrO94ga_vrll7Vx6XAjmDNg7R1c5W=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada Fruto de Itaúna
  'emp_saquarema_pousada-fruto-de-itauna': { key: '111ee2dcbf', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLeAcHu7dPm10bSPEp-7gPEUsohttbHmnl0ftruZvO2gRc4E8iT80evW6YviJiBBCyzEi43O_F1WglU_zdLA7BZjz8qchLCIb_GTstgk_t-VQiBC17Wb6GEihD5txesQ4H4RqZ72RbksSKwA=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada Hotel Praia dos Anjos
  'emp_arraial_do_cabo_pousada-hotel-praia-dos-anjos': { key: 'fea61b0893', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLfREuESWDTXlrV7SfVWl8MveN42pAPWJ7cbkLh8Bwy_CcElmsXrBA3P-XyEWOluz3UH13E644X6lv1Qgom5AFg4yi8-6qxA7rZbNJxJnwnYJHWxmjMC75e8RLQQ73pS8AwJxjyL=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Pousada Melodia do Mar
  'emp_cabo_frio_pousada-melodia-do-mar': { key: '1bc6386ff0', source: "sem foto (aguardando envio do dono)" },
  // Princesa Supermercados - Arraial do Cabo III
  'emp_arraial_do_cabo_princesa-supermercados-arraial-do-cabo-iii': { key: '7b41982f6a', source: "sem foto (aguardando envio do dono)" },
  // Recanto Suítes
  'emp_araruama_recanto-suites': { key: '684fbb35ff', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLfK-H532boz6du8SDu7MPRktDGPuNw5dAzDfmZA8JkITVWdLtEJBuTix_Ja32-CeRgJUPAFnoSQhgD7yUWc16k1KOCmUhY7dga4cQMVJaZLMFBBdIPrRVeFnaooqJ5vuVe8Uyi1=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Restaurante Mar.
  'emp_cabo_frio_restaurante-mar': { key: 'e73779ac6c', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcEp_qrgodoRWBY0csOUeh3hf1bGvGjgT0kWONC190LJ3KAWXum_FEI32anEqNXpH9-PCKgUkZqvwT8feOIJQBgF91cQoQBzRpon_ASspFKMPPCq0uUB2VhXw9Hbmst92mrkgSHhT7pxiE=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Restaurante Mediterrâneo
  'emp_araruama_restaurante-mediterraneo': { key: 'e330e072db', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLcAIfzmXty6lgGMKEbwSJ0mH84rn0eke85w4S0-kq9308cmFOv6Qg-dcpakP8OWAXa1_smAX-5gSU9kpMBNbp499YlnZnisNk30uFeJfU-NWEzbmq2fo7gcx_tT7aKBSbUQJz97=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Restaurante Picanha do Gugu
  'emp_araruama_restaurante-picanha-do-gugu': { key: 'c9335b6224', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLc_x-J79r2Xypo5_LMb3lGzFRFq1C-jJ5IILgJ5iujU0pYi7AfDQjo2YGW9ld8tdEIfxn_KrFqLxlHB17MipIRsdGi0u2_6e06cQ80bm4vU4dwUAqKs9V31ZNCRpHQ1hVlD5507=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Restaurante Saquasuco
  'emp_saquarema_restaurante-saquasuco': { key: '2a58ad07b1', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLchI9i6aqkqGj-i4hV2pxMOYGW8y5WCJokzyUFfZ2LM4eVK3i_UPXjh6gQGRKvAYiXED2iTtoYN33NK77Vv0qdjmlPZjzZ_LoeXu0iMDNuGeyxWAdrToZLCKN4Pze0Nkzeqdt5LgGkVzZLj=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // Restobar Dos Anjos
  'emp_arraial_do_cabo_restobar-dos-anjos': { key: '397b7d1c3a', source: "sem foto (aguardando envio do dono)" },
  // Rocka Restaurant & Beach Lounge
  'emp_buzios_rocka-restaurant-beach-lounge': { key: '8888d51ddd', source: "sem foto (aguardando envio do dono)" },
  // Smash do Cabo Hamburgueria
  'emp_arraial_do_cabo_smash-do-cabo-hamburgueria': { key: '9f3b712231', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLfbr4LRNFeagdvQX-wrXAtQKUbC6gfQdY4pzsEexqM-e69rkWK_rZ0Kzvoq_c2_9iK6FfwfpVjXVUx6veny5ouIH06TmXFK9utGb6iEpsl1jQWv5LzJS1qOaRthQKiHs0UtUg9Q0FG1KOY=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
  // The Bull Restaurant
  'emp_sao_pedro_da_aldeia_the-bull-restaurant': { key: 'd5a13b61a6', source: "sem foto (aguardando envio do dono)" },
  // The Duck Rock Pub
  'emp_cabo_frio_the-duck-rock-pub': { key: '6cf47f5825', source: "sem foto (aguardando envio do dono)" },
  // Toshi Conceito
  'emp_sao_pedro_da_aldeia_toshi-conceito': { key: '161e005906', coverImage: "https://lh3.googleusercontent.com/grass-cs/AABkmLeUYrvnLRIcBn7fiv8ahpVALn64QoqI9VE09t67PaqMowI6RVsX4iWRrMMsPszqsFyXhZEsi_0w1s3LkafSNdI9viEA2tUHM8Qbg6tOHPF9C6cMJDjTWkiRM4jlGw1MHdZ3pMz-fw=w1280-h960-k-no",
    source: "Foto do perfil p\u00fablico do neg\u00f3cio no Google Maps \u00b7 uso s\u00f3 na pr\u00e9via privada; publicar ap\u00f3s autoriza\u00e7\u00e3o do dono" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId] || PRIVATE_PLACE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
