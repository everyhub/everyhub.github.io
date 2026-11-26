const adsenseEnabled = process.env.ADSENSE_ENABLED === '1';

export const site = {
  baseURL: process.env.SITE_URL || 'https://everyhub.github.io/',
  googleVerification: process.env.GOOGLE_SITE_VERIFICATION || 'nar4DWHsjqtmjhB-V9W5aKVDD34rzoTOjxb0b-kQgsw',
  naverVerification: process.env.NAVER_SITE_VERIFICATION || '6284cb2c0891fe3b8496ad2ebc9af0c3d1932a74',
  adsenseAccount: 'ca-pub-8870302275342469',
  adsenseClient: adsenseEnabled ? process.env.ADSENSE_CLIENT_ID || '' : '',
  adsenseSlot: adsenseEnabled ? process.env.ADSENSE_SLOT_ID || '' : '',
};
