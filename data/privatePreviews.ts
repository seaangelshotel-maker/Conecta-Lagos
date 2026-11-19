/**
 * Prévias PRIVADAS para mostrar a ficha completa ao dono da empresa antes de ele autorizar fotos.
 * Aberta só por link com chave (/previa/<id>?k=<chave>), fora do Google, sem aparecer no guia.
 * As imagens são exibidas direto do site oficial da própria empresa (não são copiadas nem guardadas aqui).
 * Quando o dono autorizar/enviar as fotos, o link é apagado daqui.
 */
export interface PrivatePreview {
  key: string;
  coverImage?: string;
  gallery?: string[];
  source: string;
}

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  // Sentinelas do Mar e Ocean View autorizaram as fotos e já estão públicos (19/11/2026)
  // Búzios Beach Resort
  'emp_buzios_buzios-beach-resort': { key: 'fcd77cde72', coverImage: "https://wamhoteis.com.br/wp-content/uploads/2025/08/EmdpHLRQ.webp",
    gallery: [
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/916573.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03664-scaled.jpg",
      "https://wamhoteis.com.br/wp-content/uploads/2025/08/Centro-de-Convencoes-Auditorio-scaled.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03730-scaled.jpg",
    ],
    source: "https://wamhoteis.com.br/buzios-beach-resort/" },
  // Pousada Caminho do Sol
  '8mbOtad5nxVNMThEZdu1': { key: '3317dd4de9', coverImage: "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/59ed3641f55345a7898acfb3fd36bea5.jpg",
    gallery: [
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/bba8c051b8c9473aa21cec45bc6126f8.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/398cb58eb5d543f1a4435ffd5b4b4e4b.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/990df270ae6a41f8827d74a168a78012.jpg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/af836564b63e4e0cbe99cfd0f2964d97.jpeg",
    ],
    source: "https://www.caminhodosol.com.br" },
  // Casas Brancas Boutique Hotel & Spa
  'emp_buzios_casas-brancas-boutique-hotel-spa': { key: 'd62b599d39', coverImage: "https://images3.motor-reserva.com.br/curl/storage/5518/202409241727196045ohotel1.jpg",
    gallery: [
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo3.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo1.1.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232951mobile2.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta6c%C3%B3pia2100.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta3100.jpg",
    ],
    source: "https://casasbrancas.com.br" },
  // Hotel Experience João Fernandes
  'emp_buzios_hotel-experience-joao-fernandes': { key: '3d94c9d42b', coverImage: "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/vista-aerea-10-1024x576-1-1.jpg",
    gallery: [
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/Piscina-33-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-1-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-2-quartos-48-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/suite-master-139-1024x683.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/HEJF-OSSOS-1024x576-1.jpg",
    ],
    source: "https://experiencejoaofernandes.com.br" },
  // Insólito Boutique Hotel & Spa
  'emp_buzios_insolito-boutique-hotel-spa': { key: 'fc940ae877', coverImage: "https://insolitohotel.com/wp-content/uploads/2025/04/DJI_20250221182508_0533_D-1-1.jpg",
    gallery: [
      "https://insolitohotel.com/wp-content/uploads/2025/12/suites-e-acomodacoes.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-com-piscina-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/master-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/superior-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/classic.webp",
    ],
    source: "https://insolitohotel.com" },
  // Maravista Hotel e Spa
  'emp_buzios_maravista-hotel-e-spa': { key: 'f5e5c85f20', coverImage: "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-02.jpg",
    gallery: [
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-01.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-04.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-05.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-45.jpg",
      "https://maravista.com.br/wp-content/uploads/2026/01/Wedding-70.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/12/maravista-buzios.jpg",
    ],
    source: "https://maravista.com.br" },
  // Pousada da Prainha
  'Efp75piLz0FZvNyprlvD': { key: '39eecff471', coverImage: "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA.jpg",
    gallery: [
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA-2.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-16-at-15.13.56.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/sala-de-estar-Copia.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.51.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.05-2.jpeg",
    ],
    source: "https://pousadadaprainha.com" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
