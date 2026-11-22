// Openly licensed photographs used in the flipbook intro, found through Openverse.
// Credited on /credits. Everything else in the flipbook is drawn by this site.
export type FlipImage = { src: string; title: string; creator?: string; creatorUrl?: string | null; license: string; licenseVersion?: string; licenseUrl?: string; landing: string }
export const FLIP_IMAGES: FlipImage[] = [
  {
    "src": "/flipbook/neuron.jpg",
    "title": "Alien neuron network core",
    "creator": "3dhdscan",
    "creatorUrl": "https://sketchfab.com/3dhdscan",
    "license": "by",
    "licenseVersion": "4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "landing": "https://sketchfab.com/3d-models/9b1af8411cf94819af3c60fef1ab6c36"
  },
  {
    "src": "/flipbook/atrium.jpg",
    "title": "Looking up toward the ceiling of a shopping mall that has several levels",
    "creator": "FahimMurshed",
    "creatorUrl": "https://fahimm.com/",
    "license": "cc0",
    "licenseVersion": "1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "landing": "https://wordpress.org/photos/photo/70065be409/"
  },
  {
    "src": "/flipbook/fiber.jpg",
    "title": "Fiber Optical Cable",
    "creator": "chaitawat",
    "creatorUrl": null,
    "license": "cc0",
    "licenseVersion": "1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/deed.en/",
    "landing": "https://commons.wikimedia.org/w/index.php?curid=79709434"
  }
]
