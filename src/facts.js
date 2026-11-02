// Sentia product facts: the single source of truth.
// The page copy, the specs table, the JSON-LD graph, llms.txt and
// llms-full.txt are all generated from this file so numbers never drift.

export const FACTS = {
  brand: 'Sentia',
  product: 'Sentia Patch One',
  platform: 'Sentia Cloud',
  mcpServer: 'Sentia MCP Server',
  tagline: 'Measurements that find their own way home.',
  definition:
    'Sentia Patch One is a square adhesive sensor patch with strongly rounded corners and a 2.5 mm profile that measures skin temperature, hydration and activity for up to 14 days without a phone.',
  thicknessMm: 2.5,
  weightG: 3.1,
  wearDays: 14,
  rating: 'IP67',
  radios: ['Bluetooth Low Energy 5.0', 'LoRaWAN Class A'],
  networks: ['Find My network', 'LoRaWAN'],
  digestBytes: 16,
  loraBytes: 19,
  sensors: [
    { name: 'Skin temperature', detail: 'Thermistor array, reported in °C' },
    { name: 'Hydration', detail: 'Bioimpedance electrodes, reported as a hydration index from 0 to 100' },
    { name: 'Activity and posture', detail: 'Three axis accelerometer, steps equivalent and posture class' },
    { name: 'Sweat rate', detail: 'Microfluidic channel, reported in µL/min' },
  ],
  layers: [
    { name: 'Top cover', detail: 'Matte warm white cover with strongly rounded square corners, the SENTIA wordmark and one LED line.' },
    { name: 'Comfort foam', detail: 'A cushioning layer beneath the top cover.' },
    { name: 'Sensing and processing board', detail: 'Carries sensing and processing electronics and the Bluetooth Low Energy and LoRaWAN radios.' },
    { name: 'Adhesive layer', detail: 'Attaches the patch to the skin for up to 14 days of wear.' },
    { name: 'Release liner', detail: 'Protects the adhesive before application.' },
  ],
  specs: [
    ['Profile', '2.5 mm'],
    ['Layers', 'Top cover, comfort foam, sensing and processing board, adhesive layer, release liner'],
    ['Weight', '3.1 g'],
    ['Wear time', 'Up to 14 days, single use'],
    ['Battery', 'Battery, sized for the full wear period'],
    ['Radios', 'Bluetooth Low Energy 5.0 and LoRaWAN Class A'],
    ['Water resistance', 'IP67'],
    ['Find My network payload', '16 byte encrypted digest'],
    ['LoRaWAN payload', '19 byte frame, SF9, 125 kHz'],
    ['Sensors', 'Thermistor array, bioimpedance electrodes, three axis accelerometer, microfluidic sweat channel'],
    ['Positioning', 'None on the patch. No GPS receiver. Relay devices contribute location context.'],
  ],
  faq: [
    {
      q: 'How does Sentia send data without a phone nearby?',
      a: 'When no phone is near, Sentia Patch One switches to its LoRaWAN radio and sends a fuller 19 byte frame to any public or private gateway within a few kilometres. The gateway forwards it to a network server, which passes it to Sentia Cloud. No pairing, no hub, and no cellular subscription is involved.',
    },
    {
      q: 'How does the Find My network path work?',
      a: 'Sentia Patch One broadcasts a short encrypted digest over Bluetooth Low Energy every few minutes, following the accessory pattern used by the Find My network. Apple devices passing nearby relay the digest to Apple, and Sentia Cloud retrieves and decrypts the payloads addressed to it. The patch itself carries no GPS receiver.',
    },
    {
      q: 'What does the patch measure?',
      a: 'Sentia Patch One measures skin temperature with a thermistor array, hydration with bioimpedance electrodes, and movement and posture with a three axis accelerometer. A microfluidic channel estimates sweat rate. Measurements are wellness indicators, sampled every few minutes and summarised into digests, not continuous clinical grade streams.',
    },
    {
      q: 'How long does the battery last?',
      a: 'The battery is sized for the full 14 day wear period. Bluetooth Low Energy does most of the work because a relay broadcast costs very little energy. The patch listens for relay patterns and only spends LoRaWAN transmissions, which cost more, when no phone has carried a digest for a while.',
    },
    {
      q: 'What do nearby phones see?',
      a: 'Almost nothing. A relaying phone receives an opaque encrypted digest under a rotating identifier and forwards it without being able to read it. The phone contributes its own location context to the network, never the patch contents. Only Sentia Cloud holds the keys that link a digest to a wearer and decode it.',
    },
    {
      q: 'Is Sentia a medical device?',
      a: 'No. Sentia Patch One is a wellness and monitoring concept product. It does not diagnose, treat or prevent any condition, and its readings are not a substitute for medical advice or clinical instruments. If a reading worries you, talk to a qualified clinician. Sentia is not sold or certified as a medical device.',
    },
  ],
};

export const GITHUB_URL = 'https://github.com/arananet/anvil-factory';
export const REPO_URL = 'https://github.com/arananet/sentia';
