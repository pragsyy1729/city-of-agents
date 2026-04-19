export function createWorld() {
  return {
    tick: 1,
    rent: 500,
    market_closed: false,
    city_hall_closed: false,
    jobs: [
      { title: 'Barista', employer: 'Café Existenz', wage: 12 },
      { title: 'Factory Hand', employer: 'Chennai Textiles', wage: 14 },
      { title: 'Nurse', employer: 'Apollo Hospital', wage: 16 },
      { title: 'Management Consultant', employer: 'McKinsey', wage: 100 },
    ],
    crisis: [],
    rumours: [],
    msgQueue: [],
    invites: [],
    tradeOffers: [],
    complaints: [],
    events: [],
    groups: [],
    strikes: [],
    bribes: 0,
    locations: ['Park', 'Market', 'Café', 'City Hall', 'Hospital', 'Home'],
  }
}
