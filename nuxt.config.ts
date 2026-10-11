// Las URLs de su web actual, a la página nueva que las sustituye (301): así no se pierde lo que
// Google ya tiene de ellas. Sus 21 servicios se agrupan en cuatro páginas; cada uno, a su sección
// dentro de la de su grupo (#ancla, ver anclaDe en app/utils/contenido.js)
const ANTIGUAS: Record<string, string> = {
  '/water-damage-restoration': '/services/water-damage',
  '/flood-damage-repair-and-cleanup': '/services/water-damage#flood-damage-repair-and-cleanup',
  '/sewage-backup-and-cleanup': '/services/water-damage#sewage-backup-and-cleanup',
  '/structural-drying-and-repairs': '/services/water-damage#structural-drying-and-repairs',
  '/water-intrusion-restoration': '/services/water-damage',
  '/content-cleaning-and-pack-out-services': '/services/water-damage#content-cleaning-and-pack-out-services',
  '/fire-damage-restoration': '/services/fire-smoke',
  '/smoke-and-soot-clean-up': '/services/fire-smoke#smoke-and-soot-clean-up',
  '/odor-removal-and-deodorization': '/services/fire-smoke#odor-removal-and-deodorization',
  '/reconstruction-and-repair-services': '/services/fire-smoke#reconstruction-and-repair-services',
  '/storm-damage-restoration': '/services/storm-damage',
  '/hail-and-wind-damage-restoration': '/services/storm-damage#hail-and-wind-damage-restoration',
  '/board-up-and-tarping-services': '/services/storm-damage#board-up-and-tarping-services',
  '/commercial-large-loss-restoration': '/services/storm-damage#commercial-large-loss-restoration',
  '/structural-and-property-services': '/services/storm-damage#structural-and-property-services',
  '/emergency-24/7-response-services': '/services/storm-damage#emergency-24-7-response-services',
  '/mold-remediation-and-removal': '/services/mold-remediation',
  '/mold-inspection-and-testing': '/services/mold-remediation#mold-inspection-and-testing',
  '/containment-and-air-filtration': '/services/mold-remediation#containment-and-air-filtration',
  '/professional-mold-removal': '/services/mold-remediation#professional-mold-removal',
  '/sanitization-and-disinfection-treatments': '/services/mold-remediation#sanitization-and-disinfection-treatments',
  '/post-remediation-verification-and-clearance-testing': '/services/mold-remediation#post-remediation-verification-and-clearance-testing',
  '/faqs': '/faq',
  '/contact-us': '/contact',
  '/areas-we-serve': '/areas',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-fort-myers-fl': '/areas/fort-myers',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-lehigh-acres-fl': '/areas/lehigh-acres',
  '/service-area/water-damage-and-mold-remediation-and-removal-service-north-fort-myers-fl': '/areas/north-fort-myers',
  '/service-area/water-damage-and-mold-remediation-and-removal-service-bonita-springs-fl': '/areas/bonita-springs',
  '/service-area/water-damage-and-mold-remediation-service-estero-fl': '/areas/estero',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-naples-fl': '/areas/naples',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-bonita-beach-fl': '/areas/bonita-beach',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-sanibel-fl': '/areas/sanibel',
  '/service-area/water-damage-and-mold-remediation-and-removal-services-marco-island-fl': '/areas/marco-island'
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  routeRules: Object.fromEntries(Object.entries(ANTIGUAS).map(([de, a]) => [de, { redirect: { to: a, statusCode: 301 } }])),
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: (t?: string) => (t ? `${t} · Overland Restoration 24/7` : 'Overland Restoration 24/7 · Water, Fire, Storm & Mold · Cape Coral, FL'),
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#ffffff' },
        // Demo privada para enseñársela al dueño: que Google no la indexe
        { name: 'robots', content: 'noindex, nofollow' }
      ],
      link: [
        // la R de su logo (scripts/hacer-favicon.cjs)
        { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
      ]
    }
  }
})
